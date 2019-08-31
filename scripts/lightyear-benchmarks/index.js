'use strict';

const argv = require('minimist')(process.argv.slice(2));
const {readdirSync} = require('fs');
const execa = require('execa');
const Listr = require('listr');
const Table = require('cli-table');

const benchmarkStartTime = Date.now();

const warmup = argv.warmup || 0;
const repeats = argv.repeats || 5;
const separateProcesses = argv.separateProcesses;
const benchmark = argv.benchmark;

function runBenchmarkInSubprocess(filename, rendererName, isolated) {
  return new Promise((resolve, reject) => {
    let result;
    const subprocess = execa.node('./runner', [
      '--warmup',
      isolated ? 0 : warmup,
      '--repeats',
      isolated ? 1 : repeats,
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
  const totalAverages = {
    react: 0,
    prepass: 0,
    apollo: 0,
    lightyear: 0,
  };
  const table = new Table({
    style: {head: ['green']},
    head: ['Average', 'React', 'Prepass', 'Apollo', 'Lightyear'],
  });

  const benchmarkNames = Object.keys(results);

  for (let i = 0; i < benchmarkNames.length; i += 1) {
    const benchmarkName = benchmarkNames[i];
    const renderers = results[benchmarkName];

    const reactAverage = renderers.react.average;

    const renderersTableData = Object.entries(renderers).map(
      ([rendererName, {average}]) => {
        const roundedAverage = Math.round(average * 100) / 100;
        totalAverages[rendererName] += average;
        const sign = average > reactAverage ? '+' : '-';
        const difference = Math.abs(
          Math.round((average / reactAverage - 1) * 10000) / 100
        );
        return rendererName === 'react'
          ? `${roundedAverage}ms`
          : `${roundedAverage}ms (${sign}${difference}%)`;
      }
    );
    table.push({[benchmarkName]: renderersTableData});
  }

  const totalReactAverage = totalAverages.react;

  const totalRow = Object.entries(totalAverages).map(
    ([rendererName, totalAverage]) => {
      const roundedAverage = Math.round(totalAverage * 100) / 100;
      const sign = totalAverage > totalReactAverage ? '+' : '-';
      const difference = Math.abs(
        Math.round((totalAverage / totalReactAverage - 1) * 10000) / 100
      );
      return rendererName === 'react'
        ? `${roundedAverage}ms`
        : `${roundedAverage}ms (${sign}${difference}%)`;
    }
  );
  table.push({'Summed Average': totalRow});

  console.log(`Warmup renders: ${warmup} - Nr of renders: ${repeats}`);
  console.log(table.toString());
  console.log(`Total benchmark time: ${Date.now() - benchmarkStartTime}ms`);
};

async function run() {
  const results = {};

  function createNormalBenchmarkTask(dirName, rendererName) {
    return async () => {
      const result = await runBenchmarkInSubprocess(dirName, rendererName);
      if (!results[dirName]) {
        results[dirName] = {};
      }
      results[dirName][rendererName] = result;
    };
  }

  function createIsolatedBenchmarkTask(dirName, rendererName) {
    return async () => {
      let benchmarkResults = [];
      for (let i = 0; i < repeats; i += 1) {
        const {total} = await runBenchmarkInSubprocess(
          dirName,
          rendererName,
          true
        );
        benchmarkResults.push(total);
      }
      const total = benchmarkResults.reduce((a, b) => a + b, 0);
      const average = total / benchmarkResults.length;
      const min = Math.min(...benchmarkResults);
      const max = Math.max(...benchmarkResults);

      if (!results[dirName]) {
        results[dirName] = {};
      }
      results[dirName][rendererName] = {average, min, max, total};
    };
  }

  const directories = readdirSync('./benchmarks/', {withFileTypes: true})
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const benchmarkTasks = directories.map(dirName => {
    const rendererTasks = ['react', 'prepass', 'apollo', 'lightyear'].map(
      rendererName => {
        return {
          title: `Render with ${rendererName}`,
          task: separateProcesses
            ? createIsolatedBenchmarkTask(dirName, rendererName)
            : createNormalBenchmarkTask(dirName, rendererName),
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
  console.log('Running React/Prepass/Apollo/Lightyear benchmark');
  console.log();
  await tasks.run();
  console.log();
  printResults(results);
  console.log();
}

run();
