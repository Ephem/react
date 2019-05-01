# :dizzy: Lightyear

Lightyear is a React server renderer with support for Suspense.

This is a fork of React which reuses most of the code from the official server renderer, extending it with an asynchronous main loop. This enables you to use Suspense to fetch data from any component, without using double-rendering techniques. It also has support for streaming.

> :warning: Warning: Suspense is still unstable, experimental and likely to change and so is this renderer. Use at your own risk!
>
> As soon as there is official SSR-support for Suspense this fork will be deprecated.

While it seems fairly stable it is still early days for this renderer, I need help trying it out! Reporting issues is highly encouraged, as are sharing success stories.

## Installation

```sh
npm install react react-lightyear
```

If you want to hydrate the markup on the client, you also need `react-dom`.

Lightyear is currently only tested with React `16.8.6`.

## Usage

Instead of `renderToString`, use `renderToStringAsync` which returns a Promise that resolves to the markup.

```jsx
const React = require('react');
const { renderToStringAsync } = require('react-lightyear');
const AppWithSuspense = require('./app');

const markup = await renderToStringAsync(
  <AppWithSuspense />
);
```

You hydrate the markup as usual with `ReactDOM.hydrate` on the client.

Lightyear only takes care of rendering your app to a string, you need to take care of the Suspense parts and de/rehydrating data to the client yourself.

Beside returning a Promise instead of a string and having support for Suspense, this server renderer works just like the official one, meaning you should be able to follow the normal server rendering documentation for any libraries you happen to use.

### Fallbacks

How Suspense will work on the server is still undecided/uncommunicated by the React team. A lot of behaviours like how fallbacks will work is currently undefined.

For now, Lightyear stays true to this and tries to avoid introducing behaviours yet to be defined. This means fallbacks from `<Suspense>`-boundaries are never used on the server. If you need timeout behaviours towards APIs etc, you need to implement them yourself.

Even though fallbacks are currently not used, a `<Suspense>`-boundary still need to be entirely finished for it to flush to the client when doing streaming server rendering.

## FAQ

### Why Lightyear?

Suspense is a very exciting addition to React, perhaps [especially for server rendering](https://blogg.svt.se/svti/react-suspense-server-rendering/). Some want to play around with it, some want to explore what future patterns could look like and some want to take a risk using it in production even though it is unstable. It is currently hard to do any of this with server rendering.

Excellent libraries like [react-ssr-prepass](https://github.com/FormidableLabs/react-ssr-prepass) tackle this by doing an additional pass over the tree to populate the cache before running the normal `renderToString` on it. I wanted to see if there was a way to avoid the extra rendering pass and also support streaming.

While a new official server renderer is being developed, Suspense might very well be ready on the client first. If this happens, it is my hope that Lightyear can help fill the gap until the official server renderering support is ready.

To be clear, the new official server renderer aims to solve a lot more problems in a much better way than Lightyear aspires to do, it is at best a crude placeholder.

### Why the name Lightyear?

The new official server renderer is codenamed Fizz. Fizz->Buzz->Lightyear. Also, like the speed of light, this renderer is blazingly fast! :dizzy:

My previous exploration with a Suspense-ready server renderer was codenamed [React Aldrin](https://github.com/ephem/react-aldrin) with a similar motivation.

### Why a fork?

I would love to turn this into a contribution at any point, but have heard no such interest from the React team as of yet. This is to be expected, not in the least because so many behaviours for how Suspense should work on the server are still undefined.

I have done my best to make this fork maintainable by extending rather than rewriting the official renderer.

### Does React.lazy work with Lightyear?

No. How `React.lazy` will work on the server is still very much undefined. Compared to the client there are many things that needs to be considered on the server, such as being able to track which chunks has been lazy-loaded in a single render. Lightyear avoids guessing how this will work in the future, instead you are recommended to use any of the existing userland solutions such as [loadable-components](https://github.com/smooth-code/loadable-components) for code splitting.

## API

### `react-lightyear`

- `renderToStringAsync: Promise<String>`
- `renderToStaticMarkupAsync: Promise<String>`
- `renderToNodeStreamAsync: ReadableStream`
- `renderToStaticNodeStreamAsync: ReadableStream`

**Synchronous**

> These functions work just as `react-dom/server` does, so if you are using these, you are probably better off using the official renderer instead!

- `renderToString: String`
- `renderToStaticMarkup: String`
- `renderToNodeStream: ReadableStream`
- `renderToStaticNodeStream: ReadableStream`

## Contributing

I welcome any and all contributions.

Right now I especially need help with trying this out in different projects to see how stable it is and find any bugs!
