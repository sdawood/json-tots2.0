const F = require('functional-pipelines');

const pipe = (...pipeline) => enumerator => F.toIterator(function* (enumerator) {
  const pipelineFn = F.pipes(...pipeline);
  // const iterator = F.toIterator(enumerator);
  for (const entry of enumerator) {
    // console.log({entry});
    yield pipelineFn(entry);
  }
}(enumerator)); // IIF here is simply a lazy call to the generator function and fixing the premature termination ES-BUG for the client-code

module.exports = {
  pipe
};
