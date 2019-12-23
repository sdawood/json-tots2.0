const jp = require('../jsonpath');

const {pipe} = require('../enumeration/pipe');
const {parse} = require('../fp/pipelines');

const tryParse = ({path, value}) => ({
  path,
  value: parse(value),
  source: value
});

const astIterator = nodes => pipe(
  tryParse
  // ({path, value, ast}) => {}
)(nodes);

module.exports = {
  tryParse,
  astIterator
};

