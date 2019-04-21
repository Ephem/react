import {ReactDOMServerRendererAsync} from './ReactPartialRenderer';

export function renderToStringAsync(element) {
  const renderer = new ReactDOMServerRendererAsync(element, false);
  const markupPromise = renderer
    .readAsync(Infinity)
    .then(markup => {
      renderer.destroy();
      return markup;
    })
    .catch(err => {
      renderer.destroy();
      throw err;
    });
  return markupPromise;
}

export function renderToStaticMarkupAsync(element) {
  const renderer = new ReactDOMServerRendererAsync(element, true);
  const markupPromise = renderer
    .readAsync(Infinity)
    .then(markup => {
      renderer.destroy();
      return markup;
    })
    .catch(err => {
      renderer.destroy();
      throw err;
    });
  return markupPromise;
}
