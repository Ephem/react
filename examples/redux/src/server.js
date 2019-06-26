import 'isomorphic-fetch';
import App from './app/App';
import createStore from './app/createStore';
import React from 'react';
import {renderToStringAsync} from 'react-lightyear/server';
import {Provider} from 'react-redux';
import {StaticRouter} from 'react-router-dom';
import express from 'express';
import serialize from 'serialize-javascript';
import fullArticles from './articleData';

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const articles = [1, 2, 3, 4, 5];

const server = express();
server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/api/articles/:id', (req, res) => {
    res.send(JSON.stringify(fullArticles[req.params.id]));
  })
  .get('/api/articles', (req, res) => {
    const articleList = articles.map(id => ({
      id,
      title: fullArticles[id].title,
    }));
    res.send(JSON.stringify(articleList));
  })
  .get('/*', async (req, res) => {
    const store = createStore();
    const context = {};
    const markup = await renderToStringAsync(
      <Provider store={store}>
        <StaticRouter context={context} location={req.url}>
          <App />
        </StaticRouter>
      </Provider>
    );

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
          window.__INITIAL_STATE__ = ${serialize(store.getState())};
        </script>
    </body>
</html>`);
    }
  });

export default server;
