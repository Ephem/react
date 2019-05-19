/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Readable} from 'stream';

import {ReactDOMServerRendererAsync} from './ReactPartialRenderer';

// Exported for testing only
export class ReactMarkupReadableStreamAsync extends Readable {
  constructor(element, makeStaticMarkup, streamOptions) {
    super(streamOptions || {});
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
  return new ReactMarkupReadableStreamAsync(element, false);
}

export function renderToStaticNodeStreamAsync(element) {
  return new ReactMarkupReadableStreamAsync(element, true);
}
