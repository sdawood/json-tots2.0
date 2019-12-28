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

function* scan(reducingFn, initFn, enumerable, resultFn) {
  if (F.isFunction(resultFn)) {
    resultFn = F.pipe(F.unreduced, resultFn);
  } else {
    resultFn = F.unreduced;
  }
  let result;
  const iter = F.iterator(enumerable);

  if (!initFn) {
    const [initValue] = iter;
    initFn = F.lazy(initValue);
  }
  result = initFn();

  // if we use for-of we miss the final value `return`ed from the inner sequence
  // return is the only mechanism to signal the value as the last value, normally your consumer is surprised that done === true with value === undefined
  // for-of ignores it, since done is returned true with the final value
  // let value, done;
  // do {
  //   ({value, done} = iter.next());
  //
  //   if(value !== undefined && done) {
  //     result = reducingFn(result, value);
  //     result = F.reduced(result);
  //   }
  //
  //   if (F.isReduced(result)) {
  //     break;
  //   }
  //   result = reducingFn(result, value);
  //   yield result;
  // } while (!done);

  let {value, done} = iter.next();
  while(!done || value !== undefined) { // to include returned value from inner sequence if any
    result = reducingFn(result, value);
    if (F.isReduced(result)) {
      break;
    }
    yield result;
    ({value, done} = iter.next());
  }

  yield resultFn(result);
  // yield inner sequence `return` value, to be present for ... and for-of looping that ignores {value: final, done: true}
  return; // {value: undefined, done: true}
}
module.exports = {
  nodes,
  range,
  scan
};
