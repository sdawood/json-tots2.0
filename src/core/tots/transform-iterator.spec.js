const F = require('functional-pipelines');
const L = require('partial.lenses');
const jp = require('../jsonpath');

const {astIterator} = require('./transform-iterator');
const {nodes} = require('../enumeration/iterator');

describe('transform-iterator', () => {
  const template = {
    A: {
      B: {
        D: {
          H: '{{a.b.c}}'
        },
        E: {
          I: 'I',
          J: 'J'
        }
      },
      C: {
        // F: {K: 'K -- {+|=altSourceName{a.b.c} | foo | stringify:__:null:0} -- O'},
        F: {K: 'K -- {!=altSrcName | + {a.b.c} | foo | stringify:__:null:0}} -- O'},
        G: 'G'
      }
    }
  };

  it('should parse string node.value into ast through pipeline', () => {
    const astIter = astIterator(nodes(template));

    const xfStringifyPath = F.mapTransformer(({path, ...rest}) => ({
      jp: jp.stringify(path), path, ...rest
    }));
    const transducerFn = F.compose(xfStringifyPath);
    const reducingFn = transducerFn((acc, node) => {
      acc[node.jp] = node;
      return acc;
    }); // append is a transducer fn that ignores its argument and returns a reducing function that appends to an array
    const nodeAsts = F.reduce(reducingFn, () => [], astIter);
    expect(nodeAsts['$.A.B.E.I'].value).toEqual('I'); // failing to parse string, returns the source string as is
    expect(nodeAsts['$.A.B.E'].value).toEqual(template.A.B.E); // non-string values are un-touched
    expect(nodeAsts['$.A.B.E'].source).toEqual(template.A.B.E); // source holds original value in all cases
    expect(nodeAsts['$.A.C.F'].value).toEqual(template.A.C.F);
    expect(nodeAsts['$.A.B.D.H'].value).toEqual([
      {
        "operators": {
          "constraint": null,
          "enumeration": null,
          "inception": null,
          "query": null,
          "symbol": null
        },
        "path": "a.b.c",
        "pipes": [],
        "source": "{{a.b.c}}",
        "value": null
      }
    ]);

    expect(nodeAsts['$.A.C.F.K'].value).toEqual([
      {
        "operators": {
          "constraint": {
            "defaultValue": null,
            "equal": "=",
            "operator": "!",
            "source": "altSrcName"
          },
          "enumeration": null,
          "inception": null,
          "query": {
            "count": null,
            "operator": "+"
          },
          "symbol": null
        },
        "path": "a.b.c",
        "pipes": [
          {
            "args": [],
            "function": "foo"
          },
          {
            "args": [
              "__",
              "null",
              "0"
            ],
            "function": "stringify"
          }
        ],
        "source": "{!=altSrcName | + {a.b.c} | foo | stringify:__:null:0}",
        "value": null
      }
    ]);
  });
});
