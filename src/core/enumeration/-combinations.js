const F = require('functional-pipelines');

const {pipe} = require('../enumeration/pipe');

const any = enumerable => F.reduce((acc, item) => acc || item, () => false, enumerable);
const none = enumerable => F.reduce((acc, item) => acc || item, () => false, enumerable, x => !x);

function* combinations(...enums) {

  const iterators = F.map(
    enumerator => F.entries(enumerator, {kv: true}),
    enums
  );

  let columnCombinationIter = pipe(([head]) => head)(iterators);
  yield [...columnCombinationIter];

}

module.exports = {
  combinations
};

for (const row of combinations(['a', 'b', 'c'], [1, 2], ['red', 'black'])) {
  console.log(JSON.stringify(row));
}
