import App from './app/App';
import {BrowserRouter} from 'react-router-dom';
import React from 'react';
import {hydrate} from 'react-dom';
import {
  createClient,
  dedupExchange,
  cacheExchange,
  ssrExchange,
  fetchExchange,
  Provider,
} from 'urql';

const ssrCache = ssrExchange({
  initialState: window.__URQL_DATA__,
});

const client = createClient({
  url: 'https://api.graphcms.com/simple/v1/swapi',
  exchanges: [dedupExchange, cacheExchange, ssrCache, fetchExchange],
});

hydrate(
  <Provider value={client}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept();
}
