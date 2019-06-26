import 'isomorphic-fetch';
import App from './app/App';
import React from 'react';
import {renderToStringAsync} from 'react-lightyear/server';
import {StaticRouter} from 'react-router-dom';
import express from 'express';
import serialize from 'serialize-javascript';
import {
  createClient,
  dedupExchange,
  cacheExchange,
  ssrExchange,
  fetchExchange,
  Provider,
} from 'urql';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const server = express();
server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', async (req, res) => {
    const ssrCache = ssrExchange();
    const client = createClient({
      url: 'https://api.graphcms.com/simple/v1/swapi',
      exchanges: [dedupExchange, cacheExchange, ssrCache, fetchExchange],
      suspense: !process.browser,
    });

    const context = {};
    const markup = await renderToStringAsync(
      <Provider value={client}>
        <StaticRouter context={context} location={req.url}>
          <App />
        </StaticRouter>
      </Provider>
    );

    const urqlData = ssrCache.extractData();

    if (context.url) {
      res.redirect(context.url);
    } else {
      res.status(200).send(`<!doctype html>
<html lang="en">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charset="utf-8" />
        <title>Lightyear Redux Example</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${
          assets.client.css
            ? `<link rel="stylesheet" href="${assets.client.css}">`
            : ''
        }
        ${
          process.env.NODE_ENV === 'production'
            ? `<script src="${assets.client.js}" defer></script>`
            : `<script src="${assets.client.js}" defer crossorigin></script>`
        }
    </head>
    <body>
        <div id="root">${markup}</div>
        <script>
          window.__URQL_DATA__ = ${serialize(urqlData)};
        </script>
    </body>
</html>`);
    }
  });

export default server;
