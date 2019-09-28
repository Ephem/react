# Changelog

## 16.10.0 (September 28, 2019)

This release merges the [React version v16.10.0](https://github.com/facebook/react/releases/tag/v16.10.0) into Lightyear.

Also:

* Add a `postinstall`-warning about not being a semver-package ([@ThisIsMissEm](https://github.com/ThisIsMissEm) in [#30](https://github.com/Ephem/react-lightyear/pull/30))

## 16.9.0 (September 15, 2019)

First "stable" release!

While using `react@16.9.0` did work before this release, this release has merged the latest changes from React, is tested with and now officially supports the latest version.

This release adds basic support for `React.lazy()`. It is not usable out of the box however and you are still recommended to use existing solutions for universal code splitting. More information can be found in the Readme.

With this release, the versioning scheme changes. From now on, major and minor will be synced with the supported React-version, while patch will be kept separate. This means Lightyear will not be following semver, make sure you pin your version.

## 0.2.4 (August 31, 2019)

This patch fixes a bug where the streaming renderer would not flush the markup it already had generated on a suspend. This meant markup could look partial and possibly broken for the client until the suspend finished.

## 0.2.3 (July 17, 2019)

This patch improves performance, especially with large component trees. Before this patch there was an expontential slowdown with larger trees because of how the queued output was being handled.

## 0.2.2 (July 16, 2019)

This patch fixes a bug that would cause a crash when context was used in certain ways ([#22](https://github.com/Ephem/react-lightyear/issues/22)).

## 0.2.1 (July 15, 2019)

This patch only contains minor behind the scenes infrastructure changes.

## 0.2.0 (June 26, 2019)

* Fix bug which caused wrong markup for text siblings inside of suspended subtrees
* Instead of importing directly from `react-lightyear`, the entry point `react-lightyear/server` should now be used instead

This release will brake your imports, make sure you update them. This change is made so that Lightyear mimics the `ReactDOM/server`-entrypoint, which also makes it easier to run the tests and maintain the fork.

## 0.1.1 (May 4, 2019)

* Moved `ReactDOM` from incorrect `optionalDependencies` to `peerDependencies`.

## 0.1.0 (May 1, 2019)

First release. Forked from React 16.8.6.

This release adds new asyncronous versions of the ReactDOMServer apis:

* `renderToStringAsync`
* `renderToStaticMarkupAsync`
* `renderToNodeStreamAsync`
* `renderToStaticNodeStreamAsync`

When using these functions, any Promise thrown inside of a `<Suspense>`-boundary will pause rendering for that subtree and continue with siblings. As thrown Promises resolve, the paused subtrees will be resumed and their markup added in the correct place to the already rendered markup. The `renderToString`-apis will wait for the entire markup to be finished before resolving, while the `renderToNodeStream`-apis will emit to the stream when enough bytes are available.

Behind the scenes, this is accomplished by a new separate renderer `ReactDOMServerRendererAsync`, which extends the original renderer, but has it's own asyncronous main loop.

## Possibility of upstreaming changes

This project implements React APIs that are still unstable and unfinished designwise. As of writing this, the long term plan from the React core team when it comes to Suspense SSR seems to be twofold:

* Add support for rendering Suspense fallbacks in the current server renderer
* Create a new server renderer Fizz which implements proper support for Suspense (and more)

The approach used in Lightyear could possibly provide an interim solution for parts of Suspense while Fizz is being developed. If there is interest in this from the core team, this project's focus will switch to providing such a contribution.
