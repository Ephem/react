'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {readdirSync} = require('fs');
const execa = require('execa');
const Listr = require('listr');
const Table = require('cli-table');

const warmup = argv.warmup || 0;
const repeats = argv.repeats || 5;
const benchmark = argv.benchmark;

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
  const table = new Table({
    style: {head: ['green']},
    head: ['Average', 'React', 'Prepass', 'Lightyear'],
  });

  const benchmarkNames = Object.keys(results);

  for (let i = 0; i < benchmarkNames.length; i += 1) {
    const benchmarkName = benchmarkNames[i];
    const renderers = results[benchmarkName];

    const reactAverage = renderers.react.average;

    const renderersTableData = Object.entries(renderers).map(
      ([rendererName, {average}]) => {
        const sign = average > reactAverage ? '+' : '-';
        const difference = Math.abs(
          Math.round((average / reactAverage - 1) * 10000) / 100
        );
        return rendererName === 'react'
          ? `${average}ms`
          : `${average}ms (${sign}${difference}%)`;
      }
    );
    table.push({[benchmarkName]: renderersTableData});
  }

  console.log(`Warmup renders: ${warmup} - Nr of renders: ${repeats}`);
  console.log(table.toString());
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
      skip: () => benchmark && benchmark !== dirName,
      task: () => new Listr(rendererTasks),
    };
  });

  const tasks = new Listr(benchmarkTasks);

  console.log();
  console.log('Running React/Prepass/Lightyear benchmark');
  console.log();
  await tasks.run();
  console.log();
  printResults(results);
  console.log();
}

run();
