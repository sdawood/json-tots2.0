const F = require('functional-pipelines');

const nodes = (json, {parent, FQP, queue} = {}) => F.toIterator(
  function* nodes(json, {parent = '$', FQP = [parent], queue = []}) {
    let rootIterator = F.entries(json);
    const formatKey = F.isArray(json) ? k => parseInt(k, 10) : k => k;
    for (const [key, value] of rootIterator) {
      const path = [...FQP, formatKey(key)];
      yield {path, value}; // @TODO we might need a parent reference returned in ctx: {$$parent}, for back-tracking at least
      if (F.isContainer(value)) {
        queue.push([value, {parent: key, FQP: path}]); //recursive args
      }
    }
    for (const args of queue) {
      yield* nodes(...args);
    }

  }(json, {parent, FQP, queue}));

function* range({start = 0, end = Number.POSITIVE_INFINITY, step = 1}) {
  let index = start || 0;
  while(index < end) {
    yield index;
    index += step;
  }
}

module.exports = {
  nodes,
  range
};
