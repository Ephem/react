# Lightyear React-Apollo-Hooks Example

This example uses the unofficial [react-apollo-hooks](https://github.com/trojanowski/react-apollo-hooks) as a data cache for Suspense data to demonstrate the capabilities of Lightyear. 

The library `react-apollo-hooks` provides hooks for fetching GraphQL-data with a regular `ApolloClient`. What makes this interesting from Lightyear's perspective is that it also has experimental support for Suspense data-fetching.

Normally one would use a `getMarkupFromTree`-function that does one (or more) prepasses of the component tree on the server to fetch the data needed for a proper render. This examples demonstrates how to use Lightyear to do a single asynchronous render instead. A good place to start is [src/server.js](https://github.com/Ephem/react-lightyear/blob/lightyear/examples/react-apollo-hooks/src/server.js).

Read how you would normally do SSR with `react-apollo-hooks` in the [server side documentation](https://github.com/trojanowski/react-apollo-hooks#server-side-rendering).

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
