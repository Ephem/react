'use strict';

const React = require('react');

module.exports = function Recursive({depth, maxDepth = 1, siblings = 1}) {
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
};
