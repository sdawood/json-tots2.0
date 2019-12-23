// const applyAll = ({meta, sources, tags, functions, context, config, stages}) => F.composes(
//   pipeOperator({functions}),
//   enumerateOperator,
//   symbolOperator({tags, context, sources, stages}),
//   constraintOperator({sources, config}),
//   query,
//   deref(sources)
// );

const jp = require('../../jsonpath');
const bins = require('../../tots/builtins');

const sortBy = (keyName, {mapping = v => v, asc = true} = {}) => (a, b) => {
  if (!asc) [a, b] = [b, a];
  return +(mapping(a[keyName]) > mapping(b[keyName])) || +(mapping(a[keyName]) === mapping(b[keyName])) - 1;
};

const regex = {
  safeDot: /\.(?![\w\.]+")/,
  memberOrDescendant: /^[\[\.]/,
  fnArgsSeparator: /\s*:\s*/,
  PIPE: /\s*\|\s*/
};

// eslint-disable-next-line no-confusing-arrow
const jpify = path => path.startsWith('$') ? path : regex.memberOrDescendant.test(path) ? `$${path}` : `$.${path}`;

const deref = sources => (ast, {meta = 1, source = 'origin'} = {}) => {
  const document = sources[source];
  let values;
  if (F.isNil(document)) {
    values = [];
  } else if (!F.isContainer(document)) {
    meta = 0;
    values = [document]; // literal value
  } else {
    values = jp.query(document, jpify(ast.path));
  }
  return {...ast, '@meta': meta, value: values};
};

const query = ({query}) => value => {
  if(!query) return F.identity;
  const {operator, count} = query;
  const ops = {
    '+': count => values => bins.take(count)(values),
    '-': count => values => count ? bins.skip(count)(values) : values.pop(), // semantics of standalone - are not yet defined
    undefined: () => values => values.pop()
  };
  return ops[operator](count);
};

const eval = ast => ctx => F.pipes(
  query(ast)
)(ctx.value);

module.exports = {};
