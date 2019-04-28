# :dizzy: Lightyear

This is an experimental fork of the official React server renderer that supports Suspense.

> Warning: Suspense is experimental and likely to change and so is this renderer. Use at your own risk!

## Installation

```sh
npm install react react-lightyear
```

## Usage

Instead of `renderToString`, use `renderToStringAsync` which returns a Promise that resolves to the markup.

```js
const React = require('react');
const Lightyear = require('react-lightyear');
const AppWithSuspense = require('./app');

const markup = await Lightyear.renderToStringAsync(
  <AppWithSuspense />
);
```

## API

### `react-lightyear`

- `renderToStringAsync`
- `renderToStaticMarkupAsync`
- `renderToNodeStreamAsync`
- `renderToStaticNodeStreamAsync`

**Synchronous**

> These functions work just as `react-dom/server` does, so if you are using these, you are probably better off using the official renderer instead!

- `renderToString`
- `renderToStaticMarkup`
- `renderToNodeStream`
- `renderToStaticNodeStream`
