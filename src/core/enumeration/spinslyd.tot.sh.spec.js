const throws = message => {
  throw new Error(message);
};

function* slide(fn, {allowEmptyArgs = true} = {}) {
  const l = fn.length;
  const args = [];

  while (true) {
    if (args.length < l) {
      const batch = [...yield];
      (batch.length || allowEmptyArgs) ? args.push(...batch) : throws(`
Illegal Empty Arguments call:      
      allowEmptyArgs: ${allowEmptyArgs},
      received ${batch.length}`);
      // args.push(...batch);
    } else {
      return fn(...args);
    }
  }
}

function spin(fn, {allowEmptyArgs = true} = {}) {
  const gen = slide(fn, {allowEmptyArgs});

  gen.next();

  return function turn(...args) {
    const {done, value} = gen.next(args); // two way communication with the generator (::)

    return done ? value : turn;
  };
}

describe('scenario: spin-slide', () => {
  it('works with no arg calls with allowEmptyArgs options = true', () => {
    const result = spin((a, b, c) => a + b + c)()(1, 2)(3);
    const expectedResult = 6;
    expect(result).toEqual(expectedResult);
  });
  it('throws with no arg calls with allowEmptyArgs options = false', () => {
    expect(
      () => spin((a, b, c) => a + b + c, {allowEmptyArgs: false})()(1, 2)(3)
    ).toThrowError(/Illegal Empty Arguments/);
  });
});
