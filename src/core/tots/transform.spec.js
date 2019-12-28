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
      "$.A": template.A,
      "$.A.B": template.A.B,
      "$.A.C": template.A.C,
      "$.A.B.D": template.A.B.D,
      "$.A.B.E": template.A.B.E,
      "$.A.B.D.H": template.A.B.D.H,
      "$.A.B.E.I": template.A.B.E.I,
      "$.A.B.E.J": template.A.B.E.J,
      "$.A.C.F": template.A.C.F,
      "$.A.C.G": template.A.C.G,
      "$.A.C.F.K": template.A.C.F.K
    };
    console.log(JSON.stringify(result));
    expect(result).toEqual(expectedResult);
  });
});
