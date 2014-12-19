var expect = require('chai').expect;
var hexa = require('../');

describe('hexify', function() {
  [
    //decimal, bits, hex
    ['1', 64, '0000000000000001'],
    ['01', 8, '01'],
    ['-1', 8, 'FF'],
    ['-1', 16, 'FFFF'],
    ['-1', 32, 'FFFFFFFF'],
    ['-1', 64, 'FFFFFFFFFFFFFFFF'],
    ['-1', 128, 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'],
    ['10', 64, '000000000000000A'],
    ['689', 16, '02B1'],
    ['689', 8, 'B1'],
    ['256', 8, '00'],
    ['24197857200151252744792662746087043600', 128, '1234567890ABCDEFEDCBA09876543210'],
    ['-129', 8, '7F'],
    ['-128', 8, '80'],
    ['-129', 16, 'FF7F'],
  ].forEach(function(t, i) {
    it(['("', t[0], '", ', t[1], ') => "', t[2], '"'].join(''), function() {
      expect(hexa.hexify(t[0], t[1])).to.equal(t[2]);
    });
  });
});

describe('decify', function() {
  [
    //hex, bits, signed flag, decimal
    ['0', 8, true, '0'],
    ['00', 8, false, '0'],
    ['FF', 8, true, '-1'],
    ['FF', 8, false, '255'],
    ['FFFF', 8, true, '-1'],
    ['FFFF', 8, false, '255'],
    ['000000000000000A', 64, false, '10'],
    ['7F', 8, true, '127'],
    ['80', 8, true, '-128'],
    ['80', 8, false, '128'],
    ['FF7F', 16, true, '-129'],
    ['1234567890ABCDEFEDCBA09876543210', 128, true, '24197857200151252744792662746087043600'],
    ['1234567890ABCDEFEDCBA09876543210', 128, false, '24197857200151252744792662746087043600'],
  ].forEach(function(t, i) {
    it(['("', t[0], '", ', t[1], ', ', t[2], ') => "', t[3], '"'].join(''), function() {
      expect(hexa.decify(t[0], t[1], t[2])).to.equal(t[3]);
    });
  });
});

describe('signExtend64', function() {
  [
    //bits, in, out
    [8, 'FF', 'FFFFFFFFFFFFFFFF'],
    [8, '60', '0000000000000060'],
    [16, 'FFFF', 'FFFFFFFFFFFFFFFF'],
    [16, '7FFF', '0000000000007FFF'],
    [32, '80000000', 'FFFFFFFF80000000'],
    [32, '76543210', '0000000076543210'],
    [64, 'FFFFFFFFFFFFFFFF', 'FFFFFFFFFFFFFFFF'],
    [64, '0000000000000000', '0000000000000000'],
  ].forEach(function(t) {
    var bits = t[0];
    var input = t[1];
    var output = t[2];

    describe(['(', bits, ', ', input, ')'].join(''), function() {
      it(['=>', output].join(' '), function() {
        expect(hexa.signExtend64(bits, input)).to.equal(output);
      });
    });
  });
});
