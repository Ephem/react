# Lightyear URQL Example

This example uses the GraphQL-client URQL as a data cache for Suspense data to demonstrate the capabilities of Lightyear. 

URQL has solved server side data fetching in a very interesting way. On the server it uses Suspense to fetch data, but on the client it does it the traditional way by using `useEffect` (it is possible to configure it to use Suspense on the client as well but this is currently not the default since Suspense is unstable). To make SSR work URQL recommends using [react-ssr-prepass](https://github.com/FormidableLabs/react-ssr-prepass) to make a prepass of the component tree before rendering to fetch all the data and populate the Suspense data cache.

This example shows how it is possible to use `react-lightyear` with URQL instead of `react-ssr-prepass` to achieve a single render-pass. A good place to start is [src/server.js](https://github.com/Ephem/react-lightyear/blob/lightyear/examples/urql/src/server.js).

Read more in the [URQL server side rendering documentation](https://formidable.com/open-source/urql/docs/basics/#server-side-rendering).

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
