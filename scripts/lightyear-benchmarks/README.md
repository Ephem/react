# Benchmarks

This folder contains code to run benchmarks for React, Prepass, Apollo (getDataFromTree) and Lightyear.

This document contains a description of these benchmarks and the latest results.

> Benchmarks are really, really hard to get right. These benchmarks are rough and are unlikely to represent real world usage of these libraries. This document tries to describe the limitations of these benchmarks.

If you have ideas for how to improve these benchmarks, please reach out!

## Limitations

For now, these benchmarks contain no suspending or data fetching, only pure rendering of components under different conditions. That is, they currently try to answer "data fetching aside, how much overhead do these libraries add". Adding benchmarks that include (simulations of) data fetching would be a great complement.

Designing good benchmarks is tricky, most of these benchmarks simply renders a tree of the same component over and over in different configurations and as such does not represent real world usage.

The V8 JavaScript-engine has tons of optimizations that happen over time as code is being run. To explore how this affects the benchmarks, they were run in two different configurations:

* Every benchmark/renderer combination run in their own process, but every render happens inside this process and a number of warmup runs happen before benchmarking (V8 has a chance to optimize)
* Every single render runs in it's own process (V8 does not have a chance to optimize)

Results for both of these are included below and they differ a lot (React optimizes well). Because this is running a single deterministic benchmark a repeated number of times, it is hard to judge which of these conditions best reflects real world usage.

## Benchmarks

Currently, all benchmarks but `hacker-news` relies on a single component `<Recursive>` with different props. This component looks like this:

```jsx
function Recursive({depth, maxDepth = 1, siblings = 1}) {
  if (depth >= maxDepth) {
    return null;
  }

  let Siblings = [];

  for (let i = 0; i < siblings; i += 1) {
    Siblings.push(
      <div key={i}>
        <div>{depth + '.' + i}</div>
        <Recursive depth={depth + 1} maxDepth={maxDepth} siblings={siblings} />
      </div>
    );
  }

  return <div>{Siblings}</div>;
}
```

### Balanced Tree (4-4 and 4-6)

This benchmark renders a tree where each component renders 4 children, with a max depth of 4 or 6.

### Deep Tree (500 and 5000)

This benchmark renders a tree where each component only has one Recursive child, with a depth of 500 or 5000.

### Wide Tree (500 and 5000)

This benchmark renders a tree with a depth of 1, with 500 or 5000 siblings.

### Hacker News

This benchmark was migrated from the React repo and renders a number of stories.

## Results

> If you haven't figured already, take these results with a grain of salt.

Do note that even with repeat renders, there is a bunch of variance in these numbers, so don't stare too much at single digits and instead look at the big picture.

### With V8 optimizations (separate process for each benchmark/renderer combination)

```
Warmup renders: 10 - Nr of renders: 50
┌─────────────────────┬──────────┬────────────────────┬────────────────────┬───────────────────┐
│ Average             │ React    │ Prepass            │ Apollo             │ Lightyear         │
├─────────────────────┼──────────┼────────────────────┼────────────────────┼───────────────────┤
│ balanced-tree (4-4) │ 6.52ms   │ 10.48ms (+60.74%)  │ 13.32ms (+104.29%) │ 6.4ms (-1.84%)    │
├─────────────────────┼──────────┼────────────────────┼────────────────────┼───────────────────┤
│ balanced-tree (4-6) │ 111.46ms │ 187.14ms (+67.9%)  │ 217.66ms (+95.28%) │ 110.6ms (-0.77%)  │
├─────────────────────┼──────────┼────────────────────┼────────────────────┼───────────────────┤
│ deep-tree (500)     │ 11.96ms  │ 19.42ms (+62.37%)  │ 22.64ms (+89.3%)   │ 11ms (-8.03%)     │
├─────────────────────┼──────────┼────────────────────┼────────────────────┼───────────────────┤
│ deep-tree (5000)    │ 142.66ms │ 235.44ms (+65.04%) │ 283.12ms (+98.46%) │ 146.02ms (+2.36%) │
├─────────────────────┼──────────┼────────────────────┼────────────────────┼───────────────────┤
│ hacker-news         │ 6.98ms   │ 10.74ms (+53.87%)  │ 13.84ms (+98.28%)  │ 7.76ms (+11.17%)  │
├─────────────────────┼──────────┼────────────────────┼────────────────────┼───────────────────┤
│ wide-tree (500)     │ 8.4ms    │ 15ms (+78.57%)     │ 17ms (+102.38%)    │ 8.36ms (-0.48%)   │
├─────────────────────┼──────────┼────────────────────┼────────────────────┼───────────────────┤
│ wide-tree (5000)    │ 102.64ms │ 183.4ms (+78.68%)  │ 204.08ms (+98.83%) │ 99.9ms (-2.67%)   │
├─────────────────────┼──────────┼────────────────────┼────────────────────┼───────────────────┤
│ Summed Average      │ 390.62ms │ 661.62ms (+69.38%) │ 771.66ms (+97.55%) │ 390.04ms (-0.15%) │
└─────────────────────┴──────────┴────────────────────┴────────────────────┴───────────────────┘
```

### Without V8 optimizations (separate process for each render)

```
Warmup renders: 0 - Nr of renders: 20
┌─────────────────────┬──────────┬─────────────────────┬─────────────────────┬───────────────────┐
│ Average             │ React    │ Prepass             │ Apollo              │ Lightyear         │
├─────────────────────┼──────────┼─────────────────────┼─────────────────────┼───────────────────┤
│ balanced-tree (4-4) │ 44.2ms   │ 60.1ms (+35.97%)    │ 71.95ms (+62.78%)   │ 45.25ms (+2.38%)  │
├─────────────────────┼──────────┼─────────────────────┼─────────────────────┼───────────────────┤
│ balanced-tree (4-6) │ 242.7ms  │ 316.25ms (+30.3%)   │ 357.65ms (+47.36%)  │ 246.4ms (+1.52%)  │
├─────────────────────┼──────────┼─────────────────────┼─────────────────────┼───────────────────┤
│ deep-tree (500)     │ 69.15ms  │ 86.1ms (+24.51%)    │ 121.35ms (+75.49%)  │ 71.7ms (+3.69%)   │
├─────────────────────┼──────────┼─────────────────────┼─────────────────────┼───────────────────┤
│ deep-tree (5000)    │ 305.55ms │ 356.4ms (+16.64%)   │ 468.8ms (+53.43%)   │ 328.1ms (+7.38%)  │
├─────────────────────┼──────────┼─────────────────────┼─────────────────────┼───────────────────┤
│ hacker-news         │ 51.25ms  │ 65.35ms (+27.51%)   │ 84.6ms (+65.07%)    │ 54.85ms (+7.02%)  │
├─────────────────────┼──────────┼─────────────────────┼─────────────────────┼───────────────────┤
│ wide-tree (500)     │ 51.6ms   │ 68.9ms (+33.53%)    │ 84.6ms (+63.95%)    │ 51.3ms (-0.58%)   │
├─────────────────────┼──────────┼─────────────────────┼─────────────────────┼───────────────────┤
│ wide-tree (5000)    │ 235ms    │ 323.85ms (+37.81%)  │ 364.1ms (+54.94%)   │ 241ms (+2.55%)    │
├─────────────────────┼──────────┼─────────────────────┼─────────────────────┼───────────────────┤
│ Summed Average      │ 999.45ms │ 1276.95ms (+27.77%) │ 1553.05ms (+55.39%) │ 1038.6ms (+3.92%) │
└─────────────────────┴──────────┴─────────────────────┴─────────────────────┴───────────────────┘
```
