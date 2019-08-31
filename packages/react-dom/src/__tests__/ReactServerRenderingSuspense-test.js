'use strict';

let React;
let ReactDOMServer;
let SuspenseCacheContext;

const Suspender = ({suspendKey, suspendTo, time = 1}) => {
  const suspenseCacheContext = React.useContext(SuspenseCacheContext);

  if (!suspenseCacheContext[suspendKey]) {
    suspenseCacheContext[suspendKey] = {isLoading: true};

    throw new Promise(resolve => {
      setTimeout(() => {
        suspenseCacheContext[suspendKey].data = suspendTo;
        resolve();
      }, time);
    });
  }
  return (
    <p>
      {suspenseCacheContext[suspendKey]
        ? suspenseCacheContext[suspendKey].data
        : null}
    </p>
  );
};

describe('ReactDOMServer', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useRealTimers();
    React = require('react');
    ReactDOMServer = require('react-dom/server');
    SuspenseCacheContext = React.createContext({});
  });
  afterEach(() => {
    jest.useFakeTimers();
  });

  describe('renderToStringAsync', () => {
    it('should generate simple markup', async () => {
      const response = await ReactDOMServer.renderToStringAsync(
        <span>hello world</span>,
      );
      expect(response).toMatch(
        new RegExp('<span data-reactroot=""' + '>hello world</span>'),
      );
    });

    it('should render with a single suspend', async () => {
      const suspenseCache = {};

      const responsePromise = ReactDOMServer.renderToStringAsync(
        <div>
          <SuspenseCacheContext.Provider value={suspenseCache}>
            <React.Suspense fallback="Loading">
              <Suspender suspendTo="Suspended correctly" />
            </React.Suspense>
          </SuspenseCacheContext.Provider>
        </div>,
      );

      const response = await responsePromise;

      expect(response).toBe(
        '<div data-reactroot=""><!--$--><p>Suspended correctly</p><!--/$--></div>',
      );
    });

    it('should render sibling text nodes correctly inside suspends', async () => {
      const suspenseCache = {};

      const responsePromise = ReactDOMServer.renderToStringAsync(
        <div>
          <SuspenseCacheContext.Provider value={suspenseCache}>
            <React.Suspense fallback="Loading">
              <Suspender
                suspendTo={
                  <React.Fragment>
                    {'a'} {'b'}
                  </React.Fragment>
                }
              />
            </React.Suspense>
          </SuspenseCacheContext.Provider>
        </div>,
      );

      const response = await responsePromise;

      expect(response).toBe(
        '<div data-reactroot=""><!--$--><p>a<!-- --> <!-- -->b</p><!--/$--></div>',
      );
    });

    it('should suspend in parallel within a single Suspense-boundary', async () => {
      const suspenseCache = {};

      const responsePromise = ReactDOMServer.renderToStringAsync(
        <div>
          <SuspenseCacheContext.Provider value={suspenseCache}>
            <React.Suspense fallback="Loading">
              <Suspender suspendKey="1" suspendTo="Suspended once" />
              <Suspender suspendKey="2" suspendTo="Suspended twice" />
            </React.Suspense>
          </SuspenseCacheContext.Provider>
        </div>,
      );

      expect(suspenseCache).toEqual({
        '1': {
          isLoading: true,
        },
        '2': {
          isLoading: true,
        },
      });

      const response = await responsePromise;

      expect(response).toBe(
        '<div data-reactroot=""><!--$--><p>Suspended once</p><p>Suspended twice</p><!--/$--></div>',
      );
    });

    it('should render with multiple Suspense boundaries', async () => {
      const suspenseCache = {};

      const responsePromise = ReactDOMServer.renderToStringAsync(
        <div>
          <SuspenseCacheContext.Provider value={suspenseCache}>
            <React.Suspense fallback="Loading">
              <Suspender suspendKey="1" suspendTo="Suspended once" />
            </React.Suspense>
            <React.Suspense fallback="Loading 2">
              <Suspender suspendKey="2" suspendTo="Suspended twice" />
            </React.Suspense>
          </SuspenseCacheContext.Provider>
        </div>,
      );

      const response = await responsePromise;

      expect(response).toBe(
        '<div data-reactroot=""><!--$--><p>Suspended once</p><!--/$--><!--$--><p>Suspended twice</p><!--/$--></div>',
      );
    });

    it('should suspend in parallel across multiple Suspense-boundaries', async () => {
      const suspenseCache = {};

      const responsePromise = ReactDOMServer.renderToStringAsync(
        <div>
          <SuspenseCacheContext.Provider value={suspenseCache}>
            <React.Suspense fallback="Loading">
              <Suspender suspendKey="1" suspendTo="Suspended once" />
              <Suspender suspendKey="2" suspendTo="Suspended twice" />
            </React.Suspense>
            <React.Suspense fallback="Loading">
              <Suspender suspendKey="3" suspendTo="Suspended thrice" />
              <Suspender suspendKey="4" suspendTo="Suspended four times" />
            </React.Suspense>
          </SuspenseCacheContext.Provider>
        </div>,
      );

      expect(suspenseCache).toEqual({
        '1': {
          isLoading: true,
        },
        '2': {
          isLoading: true,
        },
        '3': {
          isLoading: true,
        },
        '4': {
          isLoading: true,
        },
      });

      const response = await responsePromise;

      expect(response).toBe(
        '<div data-reactroot=""><!--$--><p>Suspended once</p><p>Suspended twice</p><!--/$-->' +
          '<!--$--><p>Suspended thrice</p><p>Suspended four times</p><!--/$--></div>',
      );
    });

    it('should suspend in parallel across nested Suspense-boundaries', async () => {
      const suspenseCache = {};

      const responsePromise = ReactDOMServer.renderToStringAsync(
        <div>
          <SuspenseCacheContext.Provider value={suspenseCache}>
            <React.Suspense fallback="Loading">
              <Suspender suspendKey="1" suspendTo="Suspended once" />
              <Suspender suspendKey="2" suspendTo="Suspended twice" />
              <React.Suspense fallback="Loading">
                <Suspender suspendKey="3" suspendTo="Suspended thrice" />
                <Suspender suspendKey="4" suspendTo="Suspended four times" />
              </React.Suspense>
            </React.Suspense>
          </SuspenseCacheContext.Provider>
        </div>,
      );

      expect(suspenseCache).toEqual({
        '1': {
          isLoading: true,
        },
        '2': {
          isLoading: true,
        },
        '3': {
          isLoading: true,
        },
        '4': {
          isLoading: true,
        },
      });

      const response = await responsePromise;

      expect(response).toBe(
        '<div data-reactroot=""><!--$--><p>Suspended once</p><p>Suspended twice</p>' +
          '<!--$--><p>Suspended thrice</p><p>Suspended four times</p><!--/$--><!--/$--></div>',
      );
    });

    it('should fetch data from nested suspends', async () => {
      const suspenseCache = {};

      const responsePromise = ReactDOMServer.renderToStringAsync(
        <div>
          <SuspenseCacheContext.Provider value={suspenseCache}>
            <React.Suspense fallback="Loading">
              <Suspender
                suspendKey="1"
                suspendTo={
                  <Suspender suspendKey="2" suspendTo="Suspended twice" />
                }
              />
            </React.Suspense>
          </SuspenseCacheContext.Provider>
        </div>,
      );

      expect(suspenseCache).toEqual({
        '1': {
          isLoading: true,
        },
      });

      const response = await responsePromise;

      expect(response).toBe(
        '<div data-reactroot=""><!--$--><p><p>Suspended twice</p></p><!--/$--></div>',
      );
    });

    describe('context', () => {
      let TestContext;
      let TestContextPrinter;

      beforeEach(() => {
        TestContext = React.createContext('None');

        TestContextPrinter = () => {
          const value = React.useContext(TestContext);
          return value;
        };
      });

      it('should pass context through suspends', async () => {
        const suspenseCache = {};
        const markup = await ReactDOMServer.renderToStringAsync(
          <div>
            <TestContext.Provider value="Parent">
              <SuspenseCacheContext.Provider value={suspenseCache}>
                <React.Suspense fallback="Loading">
                  <Suspender
                    suspendKey="1"
                    suspendTo={<TestContextPrinter />}
                  />
                </React.Suspense>
              </SuspenseCacheContext.Provider>
            </TestContext.Provider>
          </div>,
        );
        expect(markup).toBe(
          '<div data-reactroot=""><!--$--><p>Parent</p><!--/$--></div>',
        );
      });

      it('should use correct context value in suspends when there are sibling Providers', async () => {
        const suspenseCache = {};
        const markup = await ReactDOMServer.renderToStringAsync(
          <div>
            <TestContext.Provider value="Parent">
              <SuspenseCacheContext.Provider value={suspenseCache}>
                <TestContext.Provider value="Earlier Sibling">
                  <TestContextPrinter />
                </TestContext.Provider>
                <React.Suspense fallback="Loading">
                  <Suspender
                    suspendKey="1"
                    suspendTo={<TestContextPrinter />}
                  />
                </React.Suspense>
                <TestContext.Provider value="Later Sibling">
                  <TestContextPrinter />
                </TestContext.Provider>
              </SuspenseCacheContext.Provider>
            </TestContext.Provider>
          </div>,
        );
        expect(markup).toBe(
          '<div data-reactroot="">Earlier Sibling<!--$--><p>Parent</p><!--/$-->Later Sibling</div>',
        );
      });

      it('should use correct context value when Providers exist inside Suspense-boundaries', async () => {
        const suspenseCache = {};
        const markup = await ReactDOMServer.renderToStringAsync(
          <div>
            <SuspenseCacheContext.Provider value={suspenseCache}>
              <React.Suspense fallback="Loading">
                <TestContext.Provider value="Inside Suspense">
                  <Suspender
                    suspendKey="1"
                    suspendTo={<TestContextPrinter />}
                  />
                </TestContext.Provider>
              </React.Suspense>
            </SuspenseCacheContext.Provider>
          </div>,
        );
        expect(markup).toBe(
          '<div data-reactroot=""><!--$--><p>Inside Suspense</p><!--/$--></div>',
        );
      });

      it('should use correct context value when Providers exist inside suspends', async () => {
        const suspenseCache = {};
        const markup = await ReactDOMServer.renderToStringAsync(
          <div>
            <SuspenseCacheContext.Provider value={suspenseCache}>
              <React.Suspense fallback="Loading">
                <Suspender
                  suspendKey="1"
                  suspendTo={
                    <TestContext.Provider value="Inside suspend">
                      <TestContextPrinter />
                    </TestContext.Provider>
                  }
                />
              </React.Suspense>
            </SuspenseCacheContext.Provider>
          </div>,
        );
        expect(markup).toBe(
          '<div data-reactroot=""><!--$--><p>Inside suspend</p><!--/$--></div>',
        );
      });
    });
  });

  describe('renderToNodeStreamAsync', () => {
    it('should generate simple markup', done => {
      const SuccessfulElement = React.createElement(() => <img />);
      const response = ReactDOMServer.renderToNodeStreamAsync(
        SuccessfulElement,
      );
      response.on('data', chunk => {
        expect(chunk.toString()).toMatch(
          new RegExp('<img data-reactroot=""' + '/>'),
        );
        done();
      });
    });

    it('should flush all suspends in a single boundary simultanously', done => {
      const suspenseCache = {};
      const response = ReactDOMServer.renderToNodeStreamAsync(
        <div>
          <SuspenseCacheContext.Provider value={suspenseCache}>
            <React.Suspense fallback="Loading">
              <Suspender suspendKey="1" suspendTo="Suspended once" />
              <Suspender suspendKey="2" time={50} suspendTo="Suspended twice" />
            </React.Suspense>
          </SuspenseCacheContext.Provider>
        </div>,
      ).setEncoding('utf-8');

      let chunksFlushed = 0;
      response.on('data', chunk => {
        if (chunksFlushed === 0) {
          expect(chunk).toBe('<div data-reactroot="">');
        } else if (chunksFlushed === 1) {
          expect(chunk).toBe(
            '<!--$--><p>Suspended once</p><p>Suspended twice</p><!--/$--></div>',
          );
          done();
        }

        chunksFlushed += 1;
      });
    });

    it('should flush suspends across multiple boundaries individually', done => {
      const suspenseCache = {};
      const response = ReactDOMServer.renderToNodeStreamAsync(
        <div>
          <SuspenseCacheContext.Provider value={suspenseCache}>
            <React.Suspense fallback="Loading">
              <Suspender suspendKey="1" suspendTo="Suspended once" />
            </React.Suspense>
            <React.Suspense fallback="Loading">
              <Suspender suspendKey="2" time={50} suspendTo="Suspended twice" />
            </React.Suspense>
          </SuspenseCacheContext.Provider>
        </div>,
      ).setEncoding('utf-8');

      let chunksFlushed = 0;
      response.on('data', chunk => {
        if (chunksFlushed === 0) {
          expect(chunk).toBe('<div data-reactroot="">');
        } else if (chunksFlushed === 1) {
          expect(chunk).toBe('<!--$--><p>Suspended once</p><!--/$-->');
        } else if (chunksFlushed === 2) {
          expect(chunk).toBe('<!--$--><p>Suspended twice</p><!--/$--></div>');
          done();
        }

        chunksFlushed += 1;
      });
    });

    it('should flush boundaries top to bottom', done => {
      const suspenseCache = {};
      const response = ReactDOMServer.renderToNodeStreamAsync(
        <div>
          <SuspenseCacheContext.Provider value={suspenseCache}>
            <React.Suspense fallback="Loading">
              <Suspender suspendKey="1" time={20} suspendTo="Suspended once" />
            </React.Suspense>
            <React.Suspense fallback="Loading">
              <Suspender suspendKey="2" suspendTo="Suspended twice" />
            </React.Suspense>
            <React.Suspense fallback="Loading">
              <Suspender
                suspendKey="3"
                time={10}
                suspendTo="Suspended thrice"
              />
            </React.Suspense>
          </SuspenseCacheContext.Provider>
        </div>,
      ).setEncoding('utf-8');

      let chunksFlushed = 0;
      response.on('data', chunk => {
        if (chunksFlushed === 0) {
          expect(chunk).toBe('<div data-reactroot="">');
        } else if (chunksFlushed === 1) {
          expect(chunk).toBe('<!--$--><p>Suspended once</p><!--/$-->');
        } else if (chunksFlushed === 2) {
          expect(chunk).toBe('<!--$--><p>Suspended twice</p><!--/$-->');
        } else if (chunksFlushed === 3) {
          expect(chunk).toBe('<!--$--><p>Suspended thrice</p><!--/$--></div>');
          done();
        }

        chunksFlushed += 1;
      });
    });

    it('should wait for outermost boundary to flush with nested boundaries', done => {
      const suspenseCache = {};
      const response = ReactDOMServer.renderToNodeStreamAsync(
        <div>
          <SuspenseCacheContext.Provider value={suspenseCache}>
            <React.Suspense fallback="Loading">
              <React.Suspense fallback="Loading">
                <Suspender suspendKey="1" suspendTo="Suspended once" />
              </React.Suspense>
              <Suspender suspendKey="2" time={50} suspendTo="Suspended twice" />
            </React.Suspense>
          </SuspenseCacheContext.Provider>
        </div>,
      ).setEncoding('utf-8');

      let chunksFlushed = 0;
      response.on('data', chunk => {
        if (chunksFlushed === 0) {
          expect(chunk).toBe('<div data-reactroot="">');
        } else if (chunksFlushed === 1) {
          expect(chunk).toBe(
            '<!--$--><!--$--><p>Suspended once</p><!--/$--><p>Suspended twice</p><!--/$--></div>',
          );
          done();
        }

        chunksFlushed += 1;
      });
    });

    it('should flush everything currently in the queue when suspending', done => {
      const suspenseCache = {};
      const response = ReactDOMServer.renderToNodeStreamAsync(
        <div>
          <SuspenseCacheContext.Provider value={suspenseCache}>
            <div>This should be flushed first</div>
            <React.Suspense fallback="Loading">
              <Suspender suspendKey="1" suspendTo="Suspended once" />
              <Suspender suspendKey="2" time={50} suspendTo="Suspended twice" />
            </React.Suspense>
          </SuspenseCacheContext.Provider>
        </div>,
        false,
      ).setEncoding('utf-8');

      let chunksFlushed = 0;
      response.on('data', chunk => {
        if (chunksFlushed === 0) {
          expect(chunk).toBe(
            '<div data-reactroot=""><div>This should be flushed first</div>',
          );
        } else if (chunksFlushed === 1) {
          expect(chunk).toBe(
            '<!--$--><p>Suspended once</p><p>Suspended twice</p><!--/$--></div>',
          );
          done();
        }

        chunksFlushed += 1;
      });
    });
  });
});
