# :dizzy: Lightyear

Lightyear is a React server renderer with support for Suspense.

This is a fork of React which reuses most of the code from the official server renderer, extending it with an asynchronous main loop. This enables you to use Suspense to fetch data from any component, without using double-rendering techniques. It also has support for streaming.

> :warning: Warning: Suspense is still unstable, experimental and likely to change and so is this renderer. Use at your own risk.

As soon as there is official SSR-support for Suspense this fork will be deprecated.

## Installation

> :warning: Warning: This package does not follow semver, pin your version and [read more in the FAQ](#how-does-the-versioning-work).

```sh
npm install react react-lightyear
```

If you want to hydrate the markup on the client, you also need `react-dom`.

## Usage

Instead of `renderToString`, use `renderToStringAsync` which returns a Promise that resolves to the markup.

```jsx
const React = require('react');
const { renderToStringAsync } = require('react-lightyear/server');
const AppWithSuspense = require('./app');

const markup = await renderToStringAsync(
  <AppWithSuspense />
);
```

You hydrate the markup as usual with `ReactDOM.hydrate` on the client.

Lightyear only takes care of rendering your app to a string, you need to take care of the Suspense parts and de/rehydrating data to the client yourself.

Beside returning a Promise instead of a string and having support for Suspense, this server renderer works just like the official one, meaning you should be able to follow the normal server rendering documentation for any libraries you happen to use. Most full-scale SSR-frameworks like Next.js and Gatsby does not currently support custom asynchronous renderers however.

Also see the full examples.

* [Redux](https://github.com/Ephem/react-lightyear/tree/lightyear/examples/redux)
* [URQL GraphQL](https://github.com/Ephem/react-lightyear/tree/lightyear/examples/urql)
* [Apollo GraphQL with react-apollo-hooks](https://github.com/Ephem/react-lightyear/tree/lightyear/examples/react-apollo-hooks)

### Streaming

```jsx
const React = require('react');
const { renderToNodeStreamAsync } = require('react-lightyear/server');
const AppWithSuspense = require('./app');

const stream = renderToNodeStreamAsync(
  <AppWithSuspense />
);
```

A full example with streaming is forthcoming.

The thing to note with streaming is that everything up until the first `<Suspense>`-boundary will be streamed immediately. After that, `<Suspense>`-boundaries will be streamed top-to-bottom as they get resolved.

If you put all your data-fetching inside the React-components themselves instead of fetching data before rendering, this means you will have a very fast time to first byte when streaming. _If_ your top boundaries/top parts of you application use fast APIs or cached data, you can get meaningful (visual) content to the users very fast instead of being blocked by the slower API calls that might exist further down.

Because Lightyear streams pure markup, it will always have the limitation of streaming top to bottom. The new official server renderer will try to achieve out of order-streaming by streaming JavaScript that controls the insertion order, also allowing for fallbacks even before the full client side hydration. This is out of scope for Lightyear.

### Fallbacks

How Suspense will work on the server is still undecided/uncommunicated by the React team. A lot of behaviours like how fallbacks will work is currently unclear.

For now, Lightyear stays true to this and tries to avoid introducing behaviours yet to be defined. This means fallbacks from `<Suspense>`-boundaries are never used on the server. If you need timeout behaviours towards APIs etc, you need to implement them yourself.

This might change in the future.

## FAQ

### Why Lightyear?

Suspense is a very exciting addition to React, perhaps [especially for server rendering](https://blogg.svt.se/svti/react-suspense-server-rendering/). Some want to play around with it, some want to explore what future patterns could look like and some want to take a risk using it in production even though it is unstable. It is currently hard to do any of this with server rendering.

Excellent libraries like [react-ssr-prepass](https://github.com/FormidableLabs/react-ssr-prepass) tackle this by doing an additional pass over the tree to populate the cache before running the normal `renderToString` on it. I wanted to see if there was a way to avoid the extra rendering pass and also support streaming.

Streaming with React is particularly interesting. It has been largely neglected in the past since many have deemed the gains not worth the complexity of using it. This is bound to change when data can be fetched as part of the rendering process and markup can be partially hydrated on the client, something the React team is working on. With Lightyear you can play around with streaming Suspense today!

While a new official server renderer is being developed, Suspense data fetching might very well be ready on the client first. If this happens, it is my hope that Lightyear can help fill the gap until the official server renderering support is ready.

To be clear, the new official server renderer aims to solve a lot more problems in a much better way than Lightyear aspires to do, it is at best a crude placeholder.

### How does the versioning work?

Lightyear does not follow semver and you are recommended to pin your version. Instead of semver, Lightyear adopts the same major and minor version as the React version it is supporting. In order to be able to release independently of React, it keeps patch-versions separate.

For example a `react-lightyear@16.9.2` would be compatible with `react@16.9.0` and `react@16.9.4`, but possibly not with `react@16.8.4` or `react@16.10.0`.

Breaking changes _might_ happen in patch versions, but it is unlikely. New features might very well be introduced in patch versions however, make sure you read the [Changelog](./CHANGELOG.md) before upgrading.

### Why the name Lightyear?

The new official server renderer is codenamed Fizz. Fizz->Buzz->Lightyear. Also, like the speed of light, this renderer is blazingly fast! :dizzy:

My previous exploration with a Suspense-ready server renderer was codenamed [React Aldrin](https://github.com/ephem/react-aldrin) with a similar motivation.

### Why a fork?

The React team is currently rewriting the server side renderer with very ambitious goals. Lightyear has a way smaller scope than that rewrite and only aims to be an intermittant solution until the rewrite is done. Since it aims to be short-lived, it doesn't make much sense to bring this into the official React project since it could add unnecessary long term complexity.

That said, I would love to turn this into a contribution to React at any point if the core team would see that as helpful.

I have done my best to make this fork maintainable by extending rather than rewriting the official renderer.

### Does React.lazy() work with Lightyear?

Yes and no. Using `React.lazy()` does work when server rendering, but it is also not usable as an out-of-the-box solution since it breaks client side hydration.

Because of the hurdles involved, the recommendation is to avoid `React.lazy()` and instead use any of the existing solutions for universal code splitting, such as [loadable-components](https://github.com/smooth-code/loadable-components).

When the lazy-loaded component is hydrated on the client side, the code needs to already be loaded or the fallback will be shown for that Suspense boundary. There are two conceptual solutions for this:

1. Make sure the code is already loaded when running `React.hydrate()` by including the necessary file as a script-tag.

This requires the server renderer to pick up which files are needed during the rendering process so they can be included in the markup. It also requires the function being passed to `React.lazy()` to resolve synchronously if code is already loaded. It is possible to get this working with Lightyear today, but it requires a bunch of work.

This is out of scope for Lightyear itself, but would be an excellent standalone package.

2. Make sure client side hydration can be paused without showing a fallback when encountering the lazy loaded component. This is called partial hydration and is something the React team is currently working on.

### How performant is Lightyear? How does it differ from multi-pass rendering solutions?

When it comes to rendering speed, Lightyear performs on par with React in artificial benchmarks without suspending.

Nr of renders: 50
```
Averages
┌────────────────┬──────────┬───────────────────┐
│                │ React    │ Lightyear         │
├────────────────┼──────────┼───────────────────┤
│ balanced-tree  │ 111.46ms │ 110.6ms (-0.77%)  │
├────────────────┼──────────┼───────────────────┤
│ deep-tree      │ 142.66ms │ 146.02ms (+2.36%) │
├────────────────┼──────────┼───────────────────┤
│ hacker-news    │ 6.98ms   │ 7.76ms (+11.17%)  │
├────────────────┼──────────┼───────────────────┤
│ wide-tree      │ 102.64ms │ 99.9ms (-2.67%)   │
├────────────────┼──────────┼───────────────────┤
│ Summed Average │ 390.62ms │ 390.04ms (-0.15%) │
└────────────────┴──────────┴───────────────────┘
```
The small differences in the results should just be natural variance and indeed differs slightly between runs even with a high number of renders. Do note that CPU and memory characteristics have not been investigated yet.

In contrast to `react-lightyear`, multi-pass solutions render the tree multiple times, so in theory has `x * N` rendering time where `x` is the number of passes made and `N` is the React rendering time.

**react-ssr-prepass**

This library always renders only one extra time, so rendering time should be 2N. In practice `react-ssr-prepass` makes some optimizations to be faster than the React rendering, which brings this down slightly.

**Apollo**

`getDataFromTree` and `getMarkupFromTree` renders one pass per nested query. This means rendering time is a minimum of 2N if all queries are parallell, but could be more.

Does this matter? Only you can answer this and it probably largely depends on your application. If you already have fast rendering times, doing another pass won't add much time in absolute numbers. If SSR rendering already takes a lot of time, adding another pass will hurt those absolute numbers a lot.

## API

### `react-lightyear/server`

- `renderToStringAsync: Promise<String>`
- `renderToStaticMarkupAsync: Promise<String>`
- `renderToNodeStreamAsync: ReadableStream`
- `renderToStaticNodeStreamAsync: ReadableStream`

**Synchronous**

> These functions work just as `react-dom/server` does, so if you are using these, you are probably better off using the official renderer instead! They are left in place mostly for debugging and testing purposes.

- `renderToString: String`
- `renderToStaticMarkup: String`
- `renderToNodeStream: ReadableStream`
- `renderToStaticNodeStream: ReadableStream`

## Contributing

I welcome any and all contributions, as long as you read and abide by the [Code of Conduct](./CODE_OF_CONDUCT.md).

If you want to contribute code or just tinker with the project, the [Contributing](./CONTRIBUTING.md) document is a good place to get started.
