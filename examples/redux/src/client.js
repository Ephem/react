import App from './app/App';
import createStore from './app/createStore';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import React from 'react';
import {hydrate} from 'react-dom';

const store = createStore(window.__INITIAL_STATE__);

hydrate(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept();
}
