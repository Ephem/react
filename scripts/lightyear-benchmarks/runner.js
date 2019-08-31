'use strict';

const argv = require('minimist')(process.argv.slice(2));
const ReactDOMServer = require('react-dom/server');
const ssrPrepass = require('react-ssr-prepass');
const {getDataFromTree} = require('react-apollo');
const Lightyear = require('react-lightyear/server');

function handleError(error) {
  if (process.send) {
    process.send({type: 'ERROR', payload: error});
  } else {
    throw error;
  }
}

process.on('uncaughtException', handleError);
process.on('uncaughtRejection', handleError);

require('@babel/register')({
  presets: ['@babel/preset-react'],
});
console.log(argv);
const app = require('./benchmarks/' + argv._[0]);

const rendererName = argv.renderer;
const warmup = argv.warmup || 0;
const repeats = argv.repeats || 5;

async function renderReact() {
  return ReactDOMServer.renderToString(app);
}

async function renderPrepass() {
  await ssrPrepass(app);
  return ReactDOMServer.renderToString(app);
}

async function renderApollo() {
  await getDataFromTree(app);
  return ReactDOMServer.renderToString(app);
}

async function renderLightyear() {
  return await Lightyear.renderToStringAsync(app);
}

const rendererMap = {
  react: renderReact,
  prepass: renderPrepass,
  apollo: renderApollo,
  lightyear: renderLightyear,
};

const render = rendererMap[rendererName];

function registerResult(payload) {
  if (process.send) {
    process.send({
      type: 'REGISTER_BENCHMARK_RESULT',
      payload,
    });
  } else {
    console.log('Result:', payload);
  }
}

async function bench() {
  let results = [];
  for (let i = 0; i < warmup; i += 1) {
    await render(app);
  }
  for (let i = 0; i < repeats; i += 1) {
    const start = Date.now();
    await render(app);
    results.push(Date.now() - start);
  }
  const total = results.reduce((a, b) => a + b, 0);
  const average = total / results.length;
  const min = Math.min(...results);
  const max = Math.max(...results);

  return {average, min, max, total};
}

bench().then(registerResult);
