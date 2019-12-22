const {transform} = require('./transform');

describe('transform', () => {
  const template = {
    A: {
      B: {
        D: {
          H: 'H'
        },
        E: {
          I: 'I',
          J: 'J'
        }
      },
      C: {
        F: {K: 'K'},
        G: 'G'
      }
    }
  };

  it('should transduce nodes through pipeline', () => {
    const result = transform(template)();
    const expectedResult = {
      "$.A": {"B": {"D": {"H": "H"}, "E": {"I": "I", "J": "J"}}, "C": {"F": {"K": "K"}, "G": "G"}},
      "$.A.B": {"D": {"H": "H"}, "E": {"I": "I", "J": "J"}},
      "$.A.C": {"F": {"K": "K"}, "G": "G"},
      "$.A.B.D": {"H": "H"},
      "$.A.B.E": {"I": "I", "J": "J"},
      "$.A.B.D.H": "H",
      "$.A.B.E.I": "I",
      "$.A.B.E.J": "J",
      "$.A.C.F": {"K": "K"},
      "$.A.C.G": "G",
      "$.A.C.F.K": "K"
    };
    console.log(JSON.stringify(result));
    expect(result).toEqual(expectedResult);
  });
});
