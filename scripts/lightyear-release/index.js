'use strict';

const fs = require('fs').promises;
const path = require('path');
const Listr = require('Listr');
const {prompt} = require('enquirer');
const execa = require('execa');
const fetch = require('node-fetch');

const ciAuthToken = process.env.LIGHTYEAR_CIRCLECI_AUTH;
const ciStatusUrl =
  'https://circleci.com/api/v1.1/project/github' +
  `/ephem/react-lightyear/tree/lightyear?circle-token=${ciAuthToken}`;

const lightyearPath = path.resolve(__dirname, './../../packages/react-dom/');
const lightyearNpmPath = path.resolve(lightyearPath, './npm/');
const lightyearPackageJsonPath = path.resolve(
  lightyearNpmPath,
  './package.json'
);
const lightyearBuildOutputPath = path.resolve(
  __dirname,
  './../../build/node_modules/react-dom/'
);

function handleError(err) {
  console.log();
  console.log('An error happened, aborting release');
  if (err) {
    if (typeof err === 'string') {
      console.log(err);
    } else if (err.stdout) {
      console.log(err.stdout);
    } else if (err.message) {
      console.log(err.message);
    }
  }
  console.log();
  process.exit(1);
}

function getPackageVersion() {
  return require(lightyearPackageJsonPath).version;
}

function parseVersion(version) {
  const [mainPart, canaryRaw = ''] = version.split('-');
  const canaryParts = canaryRaw.split('.');
  const canary = canaryParts.length > 1 ? canaryParts[1] : 0;
  const [major, minor, patch] = mainPart.split('.');
  return [+major, +minor, +patch, +canary];
}

function calculateNextVersion(currentVersion, semverType) {
  const semverMap = {
    major: 0,
    minor: 1,
    patch: 2,
    canary: 3,
  };

  const versions = parseVersion(currentVersion);
  const positionToBump = semverMap[semverType];
  versions[positionToBump] += 1;

  for (let i = positionToBump + 1; i <= 3; i += 1) {
    versions[i] = 0;
  }

  return `${versions[0]}.${versions[1]}.${versions[2]}${
    versions[3] ? `-canary.${versions[3]}` : ''
  }`;
}

async function getUserInput() {
  const tagType = await prompt({
    type: 'Select',
    name: 'tagType',
    message: 'Release to canary or latest?',
    choices: ['Canary', 'Latest'],
  }).then(answer => answer.tagType.toLowerCase());
  const semverType =
    tagType === 'canary'
      ? 'canary'
      : await prompt({
          type: 'Select',
          name: 'semverType',
          message: 'Is this a patch, minor or major release?',
          choices: ['Patch', 'Minor', 'Major'],
        }).then(answer => answer.semverType.toLowerCase());

  const currentVersion = getPackageVersion();
  const nextVersion = calculateNextVersion(currentVersion, semverType);

  const {releaseType} = await prompt({
    type: 'Select',
    name: 'releaseType',
    message: 'Is this a dry run or a real release?',
    choices: ['Dry run', 'Real release'],
  });

  console.log();
  console.log('Current version:', currentVersion);
  console.log('Next version:', nextVersion);
  console.log('Releasing to:', tagType);
  console.log('This is a:', releaseType);
  console.log();

  const {confirm} = await prompt({
    type: 'Confirm',
    name: 'confirm',
    message: 'Release with the above settings?',
  });

  console.log();

  if (!confirm) {
    await new Listr([
      {
        title: 'Aborting release',
        task: () => '',
      },
    ]).run();
    console.log();
    process.exit(1);
  }

  return {tagType, semverType, releaseType, currentVersion, nextVersion};
}

async function release() {
  let trailer = '';

  console.log('');
  console.log('---------------------');
  console.log('| Release Lightyear |');
  console.log('---------------------');
  console.log('');

  const {tagType, releaseType, nextVersion} = await getUserInput();

  const isCanaryRelease = tagType !== 'latest';
  const isDryRun = releaseType !== 'Real release';

  const tasks = new Listr(
    [
      {
        title: 'Check auth-token',
        task: () => {
          if (!ciAuthToken) {
            handleError('You need an auth-token to release this package');
          }
        },
      },
      {
        title: 'Verify Git state',
        task: () =>
          new Listr([
            {
              title: 'Check current branch',
              skip: () => process.env.SKIP_BRANCH_CHECK === '1',
              task: async () => {
                const {stdout: currentBranch} = await execa('git', [
                  'symbolic-ref',
                  '--short',
                  'HEAD',
                ]).catch(handleError);
                if (currentBranch !== 'lightyear') {
                  handleError('Can only publish from branch "lightyear"');
                }
              },
            },
            {
              title: 'Check clean working tree',
              task: async () => {
                const {stdout: status} = await execa('git', [
                  'status',
                  '--porcelain',
                ]).catch(handleError);
                if (status !== '') {
                  handleError('Can only publish with a clean working tree');
                }
              },
            },
            {
              title: 'Check that we have the latest code',
              skip: () => process.env.SKIP_REMOTE_HISTORY_CHECK === '1',
              task: async () => {
                const {stdout: history} = await execa('git', [
                  'rev-list',
                  '--count',
                  '--left-only',
                  '@{u}...HEAD',
                ]).catch(handleError);
                if (history !== '0') {
                  handleError(
                    'Can only publish if remote history does not differ'
                  );
                }
              },
            },
          ]),
      },
      {
        title: 'Verify latest node_modules installed',
        task: () =>
          execa('yarn', [
            'install',
            '--frozen-lockfile',
            '--production=false',
          ]).catch(handleError),
      },
      {
        title: 'Verify health',
        task: () =>
          new Listr([
            {
              title: 'Get recent CircleCI builds',
              task: async ctx => {
                const res = await fetch(ciStatusUrl, {
                  headers: {
                    Accept: 'application/json',
                  },
                }).catch(handleError);
                const circleCIPayload = await res.json().catch(handleError);
                ctx.verifyCITask = taskName => {
                  if (
                    circleCIPayload.find(
                      build => build.build_parameters.CIRCLE_JOB === taskName
                    ).failed
                  ) {
                    handleError(`Last ${taskName} task on CircleCI failed`);
                  }
                  return true;
                };
              },
            },
            {
              title: 'Verify latest CircleCI-install',
              task: ctx => {
                return ctx.verifyCITask('install');
              },
            },
            {
              title: 'Verify Linting and Prettier',
              task: async ctx => {
                ctx.verifyCITask('lint');
                if (!isCanaryRelease) {
                  await execa('yarn', ['lint']).catch(handleError);
                  await execa('yarn', ['lightyear:prettier-check']).catch(
                    handleError
                  );
                }
              },
            },
            {
              title: 'Verify tests',
              task: async ctx => {
                ctx.verifyCITask('test');
                if (!isCanaryRelease) {
                  await execa('yarn', ['test']).catch(handleError);
                }
              },
            },
            {
              title: 'Verify production tests',
              task: async ctx => {
                ctx.verifyCITask('test-prod');
                if (!isCanaryRelease) {
                  await execa('yarn', ['test-prod']).catch(handleError);
                }
              },
            },
            {
              title: 'Verify build success',
              task: async ctx => {
                ctx.verifyCITask('build');
                if (!isCanaryRelease) {
                  await execa('yarn', ['lightyear:build']).catch(handleError);
                }
              },
            },
          ]),
      },
      {
        title: 'Verify that we still have a clean working tree',
        task: async () => {
          const {stdout: status} = await execa('git', [
            'status',
            '--porcelain',
          ]).catch(handleError);
          if (status !== '') {
            handleError(
              'Something is wrong, working tree is unclean after having verified and built the project'
            );
          }
        },
      },
      {
        title: 'Bump version',
        task: () =>
          new Listr([
            {
              title: 'Bump version in package.json',
              task: () => {
                const oldPackageJson = require(lightyearPackageJsonPath);

                oldPackageJson.version = nextVersion;

                return fs
                  .writeFile(
                    lightyearPackageJsonPath,
                    JSON.stringify(oldPackageJson, null, 2)
                  )
                  .catch(handleError);
              },
            },
            {
              title: 'Commit version-bump',
              skip: () => isDryRun,
              task: async () => {
                await execa('git', ['add', lightyearPackageJsonPath]).catch(
                  handleError
                );
                return execa('git', [
                  'commit',
                  '-m',
                  `Bump version to ${nextVersion}`,
                ]).catch(handleError);
              },
            },
            {
              title: 'Create git tag',
              skip: () => isDryRun,
              task: () =>
                execa('git', [
                  'tag',
                  '-a',
                  `lightyear-v${nextVersion}`,
                  '-m',
                  `Version ${nextVersion}`,
                ]).catch(handleError),
            },
          ]),
      },
      {
        title: 'Publish',
        task: () =>
          new Listr([
            {
              // Build project with the correct version
              title: 'Build project',
              task: () => execa('yarn', ['lightyear:build']).catch(handleError),
            },
            {
              title: 'Push version bump and tag',
              skip: () => releaseType !== 'Real release',
              task: async () => {
                await execa('git', ['push']).catch(handleError);
                return execa('git', [
                  'push',
                  'origin',
                  `lightyear-v${nextVersion}`,
                ]).catch(handleError);
              },
            },
            {
              title: 'Publish package to npm',
              task: async () => {
                let publishOptions = ['publish', '--dry-run', '--tag', tagType];

                if (releaseType === 'Real release') {
                  publishOptions = ['publish', '--tag', tagType];
                }

                const {all} = await execa('npm', publishOptions, {
                  cwd: lightyearBuildOutputPath,
                }).catch(handleError);

                trailer += all;
              },
            },
          ]),
      },
      {
        title: 'Cleanup dry run',
        skip: () => releaseType === 'Real release',
        task: async () => {
          await execa('git', [
            'checkout',
            '--',
            path.resolve(__dirname, lightyearNpmPath),
          ]).catch(handleError);
        },
      },
    ],
    {
      collapse: false,
    }
  );

  await tasks.run();

  console.log();

  console.log(trailer);

  console.log();
}

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
    process.exit(1);
  });

release();
