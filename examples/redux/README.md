# Lightyear Redux Example

This example uses Redux as a data cache for Suspense data to demonstrate the capabilities of Lightyear. 

Suspense is still unstable! There currently does not exist any recommended ways to use it to fetch data, and this example is no exception. It is naivly implemented and on purpose avoids to tackle the tricker issues that exist around Suspense.

## Running the example

After cloning the repository, do the following in the example folder:

```sh
yarn
yarn start
```

Or if you are using npm:

```sh
npm install
npm start
```

## Important implementation note

Note that this example uses Redux hooks to get data from the store. This is not because hooks are cool, but because using `connect` won't work here. Suspense (currently) gives no guarantees to which components gets re-rendered after the thrown Promise has resolved.

The current implementation, both in ReactDOM and Lightyear, does not re-render the parent `connect`-component, which means any updates to the store that were triggered by the dispatch will not be reflected in props when the component that threw the Promise is re-rendered. By using hooks we get the updated value directly from the store when the component re-renders.

In a broader sense, one could say that (currently) a Suspense cache itself can be passed down via context, but reading values from that cache must happen directly in the same component that otherwise throws the Promise.
