/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ReactVersion from 'shared/ReactVersion';

import {renderToString, renderToStaticMarkup} from './ReactDOMStringRenderer';
import {
  renderToStringAsync,
  renderToStaticMarkupAsync,
} from './ReactDOMStringRendererAsync';
import {
  renderToNodeStream,
  renderToStaticNodeStream,
} from './ReactDOMNodeStreamRenderer';
import {
  renderToNodeStreamAsync,
  renderToStaticNodeStreamAsync,
} from './ReactDOMNodeStreamRendererAsync';

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
