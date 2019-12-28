const F = require('functional-pipelines');
const jp = require('jsonpath');

const {nodes} = require('../enumeration/iterator');
const {catches, predicates, negates} = require('../fp/pipelines');
const {parse} = require('./parser');
const bins = require('./builtins');

const defaultConfig = {
  throws: false,
  nullifyMissing: true,
  operators: {
    constraints: {
      '?': {
        drop: true
      },
      '!': {
        nullable: true
      }
    }
  }
};

const transform = (template, {
  meta = 0,
  sources = {'default': {}},
  tags = {},
  functions = {},
  args = {},
  config = defaultConfig
} = {}, {builtins = bins} = {}) =>
  document => {
    functions = {...bins, ...functions};
    const options = {
      meta,
      sources: {...sources, origin: document},
      tags,
      functions,
      args,
      config
    };

    const xfStringify = F.mapTransformer(({path, value}) => ({
      path: jp.stringify(path),
      value
    }));

    const xfParseNode = F.mapTransformer(({path, value}) => ({
      path,
      value: F.pipes(predicates(F.isString), catches(parse))(value)
    }));

    const xfEvalNode = F.mapTransformer(maybeAST => {

    });

    const transducerFn = F.pipes(xfStringify, xfParseNode);
    const reducingFn = transducerFn((acc, {path, value}) => {
      acc[path] = value;
      return acc;
    });
    const transduce = enumerable => F.reduce(reducingFn, () => ({}), enumerable);

    // const nodeIterator = nodes(template);
    const pipeline = F.pipes(
      negates(F.isString), //
      nodes, // json -> nodes iterator
      transduce
    );

    return pipeline(template);
  };

module.exports = {
  transform
};
