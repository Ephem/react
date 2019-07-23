'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {readdirSync} = require('fs');
const execa = require('execa');
const Listr = require('listr');

const warmup = argv.warmup || 0;
const repeats = argv.repeats || 5;

function runBenchmarkInSubprocess(filename, rendererName) {
  return new Promise((resolve, reject) => {
    let result;
    const subprocess = execa.node('./runner', [
      '--warmup',
      warmup,
      '--repeats',
      repeats,
      '--renderer',
      rendererName,
      filename,
    ]);

    subprocess.on('message', message => {
      if (message.type === 'REGISTER_BENCHMARK_RESULT') {
        result = message.payload;
      }
    });

    subprocess.on('error', error => {
      reject(error);
    });

    subprocess.on('exit', () => {
      resolve(result);
    });
  });
}

const printResults = results => {
  console.table(results);
};

async function run() {
  const results = {};

  const directories = readdirSync('./benchmarks/', {withFileTypes: true})
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const benchmarkTasks = directories.map(dirName => {
    const rendererTasks = ['react', 'prepass', 'lightyear'].map(
      rendererName => {
        return {
          title: `Render with ${rendererName}`,
          task: async () => {
            const result = await runBenchmarkInSubprocess(
              dirName,
              rendererName
            );
            if (!results[dirName]) {
              results[dirName] = {};
            }
            results[dirName][rendererName] = result;
          },
        };
      }
    );
    return {
      title: `Running benchmark ${dirName}`,
      task: () => new Listr(rendererTasks),
    };
  });

  const tasks = new Listr(benchmarkTasks);

  await tasks.run();

  printResults(results);
}

run();
