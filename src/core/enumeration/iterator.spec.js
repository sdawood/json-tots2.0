const F = require('functional-pipelines');
const jp = require('jsonpath');

const {nodes} = require('./iterator');

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

