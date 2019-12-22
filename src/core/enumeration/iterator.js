const F = require('functional-pipelines');

function* nodes(json, {parent = '$', FQP = [parent], queue = []} = {}) {
  let rootIterator = F.entries(json);
  const formatKey = F.isArray(json) ? k => parseInt(k, 10) : k => k;
  for(const [key, value] of rootIterator) {
    const path = [...FQP, formatKey(key)];
    yield {path, value};
    if (F.isContainer(value)) {
      queue.push([value, {parent: key, FQP: path}]); //recursive args
    }
  }
  for(const args of queue) {
    yield* nodes(...args);
  }

}

module.exports = {
  nodes
};
