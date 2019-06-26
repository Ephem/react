import 'isomorphic-fetch';
import App from './app/App';
import React from 'react';
import {renderToStringAsync} from 'react-lightyear/server';
import {StaticRouter} from 'react-router-dom';
import express from 'express';
import serialize from 'serialize-javascript';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {ApolloClient} from 'apollo-client';
import {createHttpLink} from 'apollo-link-http';
import {ApolloProvider} from 'react-apollo-hooks';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const server = express();
server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', async (req, res) => {
    const client = new ApolloClient({
      ssrMode: true,
      link: createHttpLink({
        uri: 'https://api.graphcms.com/simple/v1/swapi',
      }),
      cache: new InMemoryCache(),
    });

    const context = {};
    const markup = await renderToStringAsync(
      <ApolloProvider client={client}>
        <StaticRouter context={context} location={req.url}>
          <App />
        </StaticRouter>
      </ApolloProvider>
    );

    const apolloData = client.extract();

    if (context.url) {
      res.redirect(context.url);
    } else {
      res.status(200).send(`<!doctype html>
<html lang="en">
    <head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charset="utf-8" />
        <title>Lightyear React-Apollo-Hooks Example</title>
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
          window.__APOLLO_STATE__ = ${serialize(apolloData)};
        </script>
    </body>
</html>`);
    }
  });

export default server;
