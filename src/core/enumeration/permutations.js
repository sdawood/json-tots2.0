const F = require('functional-pipelines');

function permuteRecur(a, chosen = []) {
  console.log(`permuteRest(${JSON.stringify({a, chosen})})`);
  if (a.length === 0) {
    console.log(JSON.stringify({chosen}));
  } else {
    for (let i = 0; i < a.length; i++) {
      //choose
      const c = a[i];
      chosen.push(c);
      a.splice(i, 1);
      //explore
      permuteRecur(a, chosen);
      //unchoose
      a.splice(i, 0, c);
      chosen.pop();
    }
  }
}

function* permute(a, chosen = []) {
  // console.log(`permute(${JSON.stringify({a, chosen})})`);
  if (a.length === 0) {
    // console.log(JSON.stringify({chosen}));
    yield [...chosen]; // if we don't shallow copy chosen array, the reference would get empty before we yield the next time.
  } else {
    for (let i = 0; i < a.length; i++) {
      //choose
      const c = a[i];
      chosen.push(c);
      a.splice(i, 1);
      //explore
      yield* permute(a, chosen);
      //un-choose
      a.splice(i, 0, c);
      chosen.pop();
    }
  }
}

function* permuteGenerators(a, {chosen = [], entry = true} = {}) {
  if (entry) {
    a = a.map((sourceFn, index) => ({sourceFn, source: sourceFn(), name: index}))
  }
  // console.log(`permute(${JSON.stringify({a, chosen})})`);
  console.log(`permute(${a.length}, ${chosen.length})`);
  if (a.length === 0) {
    // console.log(JSON.stringify({chosen}));
    yield F.map(({value, name}) => ({value, name}), chosen); // if we don't shallow copy chosen array, the reference would get empty before we yield the next time.
  } else {
    for (let i = 0; i < a.length; i++) {
      //choose
      const {source, sourceFn, name, done: isDone} = a[i];
      console.log({name, isDone, isIterator: F.isIterator(source)});
      a.splice(i, 1); // we should splice here, in case we continue, we assume the current complete iterator is gone
      // if(isDone) {
      //   continue; // oh How I miss a good old continue :)
      // }
      let value, done;
      let openSource = source;
      // if (!isDone) {
      // const openSource = isDone ? sourceFn() : source;
      ({value, done} = openSource.next());
      if (done) {
        console.log(`restarting generator #${name} ...`);
        openSource = sourceFn();
        ({value, done} = openSource.next());
      }
      console.log({name, value, done});
      chosen.push({value, done, source: openSource, sourceFn, name});
      // we used to a.splice(i, 1) here
      // }
      //explore
      yield* permuteGenerators(a, {chosen, entry: false});
      //un-choose
      // if(!isDone) {
      a.splice(i, 0, {value, done, source: openSource, sourceFn, name});
      // }
      chosen.pop();
    }
  }
}

module.exports = {
  permute,
  permuteGenerators
};
