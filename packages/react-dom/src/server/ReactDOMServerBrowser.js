/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ReactVersion from 'shared/ReactVersion';
import invariant from 'shared/invariant';

import {renderToString, renderToStaticMarkup} from './ReactDOMStringRenderer';
import {
  renderToStringAsync,
  renderToStaticMarkupAsync,
} from './ReactDOMStringRendererAsync';

function renderToNodeStream() {
  invariant(
    false,
    'ReactDOMServer.renderToNodeStream(): The streaming API is not available ' +
      'in the browser. Use ReactDOMServer.renderToString() instead.',
  );
}

function renderToStaticNodeStream() {
  invariant(
    false,
    'ReactDOMServer.renderToStaticNodeStream(): The streaming API is not available ' +
      'in the browser. Use ReactDOMServer.renderToStaticMarkup() instead.',
  );
}

function renderToNodeStreamAsync() {
  // eslint-disable-next-line react-internal/warning-and-invariant-args
  invariant(
    false,
    'ReactDOMServer.renderToNodeStreamAsync(): The streaming API is not available ' +
      'in the browser. Use ReactDOMServer.renderToStringAsync() instead.',
  );
}

function renderToStaticNodeStreamAsync() {
  // eslint-disable-next-line react-internal/warning-and-invariant-args
  invariant(
    false,
    'ReactDOMServer.renderToStaticNodeStreamAsync(): The streaming API is not available ' +
      'in the browser. Use ReactDOMServer.renderToStaticMarkupAsync() instead.',
  );
}

// Note: when changing this, also consider https://github.com/facebook/react/issues/11526
export default {
  renderToString,
  renderToStaticMarkup,
  renderToStringAsync,
  renderToStaticMarkupAsync,
  renderToNodeStream,
  renderToStaticNodeStream,
  renderToNodeStreamAsync,
  renderToStaticNodeStreamAsync,
  version: ReactVersion,
};
