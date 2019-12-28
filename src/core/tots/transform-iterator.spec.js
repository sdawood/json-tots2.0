const F = require('functional-pipelines');
const L = require('partial.lenses');
const jp = require('../jsonpath');

const {readerSeq, evaluatorSeq, printStoreSeq} = require('./transform-iterator');
const {nodes} = require('../enumeration/iterator');

describe('transform-iterator', () => {
  const template = {
    A: {
      B: {
        D: {
          H: '{{a.b.c}}'
        },
        E: {
          I: '@functionToCall | inlineFn:hello:__:world | *',
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
    const astIter = readerSeq(nodes(template));

    const xfStringifyPath = F.mapTransformer(({path, ...rest}) => ({
      jp: jp.stringify(path), path, ...rest
    }));
    const transducerFn = F.compose(xfStringifyPath);
    const reducingFn = transducerFn((acc, node) => {
      acc[node.jp] = node;
      return acc;
    }); // append is a transducer fn that ignores its argument and returns a reducing function that appends to an array
    const nodeAsts = F.reduce(reducingFn, () => [], astIter);
    expect(nodeAsts['$.A.B.E.I'].value).toEqual([
      {
        "__invocation__": {
          "args": [
            null,
            null,
            "functionToCall"
          ],
          "function": "functionToCall",
          "pipes": [
            {
              "args": [
                "hello",
                "__",
                "world"
              ],
              "function": "inlineFn"
            },
            {
              "function": "*"
            }
          ]
        }
      }
    ]); // template expression, type = __invoaction__
    expect(nodeAsts['$.A.B.E'].value).toEqual(template.A.B.E); // non-string values are un-touched
    expect(nodeAsts['$.A.B.E'].source).toEqual(template.A.B.E); // source holds original value in all cases
    expect(nodeAsts['$.A.C.F'].value).toEqual(template.A.C.F);
    expect(nodeAsts['$.A.B.D.H'].value).toEqual([
      [
        {
          "__template__": {
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
        }
      ]
    ]);

    expect(nodeAsts['$.A.C.F.K'].value).toEqual([
      {
        "__template__": {
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
      }]);
  });

  it('should print evaluated sequence into the target JSON', () => {
    const astSeq = readerSeq(nodes(template));
    const ctx = {};
    const evaluatedSeq = evaluatorSeq(ctx)(astSeq);
    const target = {};
    const storeSeq = printStoreSeq(target)(evaluatedSeq);
    let value, done;
    do {
      ({value, done} = storeSeq.next());
      console.log(!done ? value.history.length : 'final-state');
      console.log(JSON.stringify(!done ? value.revision : value));
    } while(!done);
  })
});
