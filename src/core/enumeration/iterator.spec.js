const F = require('functional-pipelines');
const jp = require('jsonpath');

const {nodes, scan} = require('./iterator');

describe('iterator', () => {
  const template = {
    A: {
      B: {
        D: {
          H: 'H'
        },
        E: {
          I: 'I',
          J: 'J'
        }
      },
      C: {
        F: {K: 'K'},
        G: 'G'
      }
    }
  };

  it('should return an iterator of JSON Tree Nodes', () => {
    const xfExtractPath = F.mapTransformer(({path}) => path);
    const xfStringify = F.mapTransformer(pathArray => jp.stringify(pathArray));
    const transducerFn = F.compose(xfExtractPath, xfStringify);
    const reducingFn = transducerFn(F.append(/*reducingFn*/)); // append is a transducer fn that ignores its argument and returns a reducing function that appends to an array
    const paths = F.reduce(reducingFn, () => [], nodes(template));
    expect(paths).toEqual(jp.paths(template, '$..*').map(pathArray => jp.stringify(pathArray)));
  });
});

describe('scenario: scan', () => {
  it('works: ', () => {
    function* withReturn() {
      yield 1;
      yield 2;
      yield 3;
      return 4;
    }
    const resultSeq = scan((acc, input) => {
      acc.state = acc.state + input;
      return acc;
    }, () => ({state: 0}), withReturn(), ({state}) => state);
    const expectedResults = [1, 3, 6, 10];

    let count = 0;
    for(const [i, acc] of F.iterator(resultSeq, {indexed: true, kv: true})) {
      expect(acc.state).toEqual(expectedResults[i]);
      count = i;
    }

    expect(count).toEqual(expectedResults.length);
  });
});

