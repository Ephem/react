/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Readable} from 'stream';

import {ReactDOMServerRendererAsync} from './ReactPartialRenderer';

class ReactMarkupReadableStream extends Readable {
  constructor(element, makeStaticMarkup) {
    super({});
    this.partialRenderer = new ReactDOMServerRendererAsync(
      element,
      makeStaticMarkup,
    );
  }

  _destroy(err, callback) {
    this.partialRenderer.destroy();
    callback(err);
  }

  _read(size) {
    this.partialRenderer
      .readAsync(size)
      .then(markup => {
        this.push(markup);
      })
      .catch(err => {
        this.destroy(err);
      });
  }
}

export function renderToNodeStreamAsync(element) {
  return new ReactMarkupReadableStream(element, false);
}

export function renderToStaticNodeStreamAsync(element) {
  return new ReactMarkupReadableStream(element, true);
}
