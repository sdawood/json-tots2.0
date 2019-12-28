const L = require('partial.lenses');
const jp = require('../jsonpath');

const {pipe, pipeWith} = require('../enumeration/pipe');
const {scan} = require('../../core/enumeration/iterator');
const {parse, predicates, negates} = require('../fp/pipelines');

const tryParse = ({path, value}) => ({
  path,
  value: parse(value),
  source: value
});

const readerSeq = nodes => pipe(
  tryParse,
)(nodes);

const evaluate = ctx => maybeAST => {
  const {value: {
    __template__: templateAST = false,
    __invocation__: invocationAST = false
  } = {}} = {} = maybeAST;

  return maybeAST;
};

const evaluatorSeq = ctx => astSeq => pipe(
  evaluate(ctx)
)(astSeq);

const printInto = target => evaluatedSeq => {
  F.reduce((acc, {path, value}) => {
    acc.history.push(acc.revision);
    acc.revision = L.set(path)(value);
    return acc;
  }, F.lazy({revision: target, history: []}), evaluatedSeq, result => console.log(JSON.stringify(result)));
};

const printStoreSeq = initState => evaluatedSeq => scan(
  (state, input) => {
    state.history.push(state.revision); // keep reference to revision before immutable creating a new one.
    state.revision = L.set(input.path.slice(1), input.value, state.revision);
    return state;
  },
  () => ({revision: initState, history: []}),
  evaluatedSeq,
  ({revision}) => revision);


module.exports = {
  tryParse,
  readerSeq,
  evaluatorSeq,
  printStoreSeq
};

