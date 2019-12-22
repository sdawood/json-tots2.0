const F = require('functional-pipelines');

function* range({start = 0, inc = 1, end = inc > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY}) {
  let counter = start;
  let newInc = inc;
  do {
    ({start = start, inc = inc, end = end} = (yield counter) || {});
    counter += inc;
  } while(counter < end);
}

function* rollingHistory({size = 10} = {}) {
  const history = {};
  let key = 0;
  let head = key;
  do {
    ({key = ++key, value} = yield {history, key, head});
    head = key <= size ? key : key % size;
    history[head] = value;
  } while (true);
}

const createStore = reducers => function* dispatch(initState = {}, {history = 10} = {}) {
  let type;
  let payload;
  let state = initState;

  do {
    ({type, payload} = yield state);
    F.reduce((acc, reducer) => {
      acc = reducer(acc, {type, payload});
      return acc;
    }, () => state, reducers)
  } while (true);
};

module.exports = {
  rollingHistory,
  createStore
};
