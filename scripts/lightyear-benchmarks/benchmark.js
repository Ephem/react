'use strict';

const React = require('react');
const Lightyear = require('react-lightyear/server');
const ReactDOMServer = require('react-dom/server');
const ssrPrepass = require('react-ssr-prepass');

function App({depth, maxDepth = 10000, siblings = 1}) {
  if (depth > maxDepth) {
    return null;
  }

  let Siblings = [];

  for (let i = 0; i < siblings; i += 1) {
    Siblings.push(
      <App key={i} depth={depth + 1} maxDepth={maxDepth} siblings={siblings} />
    );
  }

  return <div>{Siblings}</div>;
}

const app = <App depth={0} />;

async function runReact() {
  ReactDOMServer.renderToString(app);
}

async function runPrepass() {
  await ssrPrepass(app);
  ReactDOMServer.renderToString(app);
}

async function runLightyear() {
  await Lightyear.renderToStringAsync(app);
}

async function bench(name, fn, repeats = 5) {
  let total = 0;
  for (let i = 0; i < repeats; i += 1) {
    const start = Date.now();
    await fn();
    total += Date.now() - start;
  }
  console.log(
    `${name} took on average ${total / repeats} for ${repeats} repeats`
  );
}

async function runAll() {
  await bench('React', runReact);
  await bench('Prepass', runPrepass);
  await bench('Lightyear', runLightyear);
}

runAll();
