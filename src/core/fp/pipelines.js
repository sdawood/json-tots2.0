const F = require('functional-pipelines');

const parser = require('../tots/parser');

const catches = (fn, alt) => x => {
  let result;
  try {
    result = fn(x);
  } catch (error) {
    if (alt === undefined) {
      result = F.reduced(x);
    } else {
      result = F.reduced(alt);
    }
  }
  return result;
};

const predicates = predicate => x => predicate(x) ? x : F.reduced(x);
const negates = predicate => x => predicate(x) ? F.reduced(x) : x ;

const parse = F.pipes(
  predicates(F.isString),
  catches(parser.parse)
);

module.exports = {
  predicates,
  negates,
  catches,
  parse,
};
