const F = require('functional-pipelines');

const {permute, permuteGenerators} = require('./permutations');
const {range} = require('./iterator');
const {pipe} = require('./pipe');

describe('scenario: permutation generator choosing from list of values', () => {
  it('works: generates the correct number of all possible unique permutation', () => {
    const permuteGen = permute(['A', 'B', 'C', 'D', 'E']);
    const result = [...permuteGen];
    const resultSet = new Set(result);
    expect(resultSet.size).toEqual(result.length);
    expect(resultSet.size).toEqual(120);
  });
});

describe('scenario: permutation generator choosing from list of values', () => {
  it('works: generates the correct number of all possible unique permutation', () => {
    const colors = ['BLACK', 'WHITE'];
    const letters = ['A', 'B', 'C'];
    const numbers = [1, 2, 3, 4];

    const createGeneratorFn = source => () => pipe(index => source[index])(range({end: source.length}));

    const permuteGen = permuteGenerators([
      createGeneratorFn(colors),
      createGeneratorFn(letters),
      createGeneratorFn(numbers)
    ]);

    // console.log(permuteGen.next());
    // console.log(permuteGen.next());
    // console.log(permuteGen.next());
    // console.log(permuteGen.next());
    // console.log(permuteGen.next());
    // console.log(permuteGen.next());
    const result = F.map(list => F.map(({value}) => value, list), permuteGen);
    // const result = [...permuteGen];
    const resultSet = new Set(result);
    expect(result).toEqual([]);
    expect(resultSet.size).toEqual(result.length);
    expect(resultSet.size).toEqual(120);
  });
});

