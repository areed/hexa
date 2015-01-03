var Big = require('big.js');
var _ = require('highland');

/**
 * Pads the beginning of a string to reach the requried length.
 * @param {string} p - the character to use to pad
 * @param {number} l - the length of the padded string
 * @param {string} h - the string to pad
 */
function pad(p, l, h) {
  //the number of characters of padding required
  return (new Array(l - h.length + 1)).join(p) + h;
}

exports.pad = pad;

/**
 * Curried pad function using '0' for the pad character.
 * @function
 * @param {number} l
 * @param {string} h
 */
var pad0 = exports.pad0 = _.curry(pad, '0');

/**
 * pad0 with length of 2
 * @function
 * @param {string} h
 */
exports.pad0Byte = pad0(2);

/**
 * pad0 with length of 4
 * @function
 * @param {string} h
 */
exports.pad0Wyde = pad0(4);

/**
 * pad0 with length of 8
 * @function
 * @param {string} h
 */
exports.pad0Tetra = pad0(8);

/**
 * pad0 with length of 16
 * @function
 * @param {string} h
 */
exports.pad0Octa = pad0(16);

/**
 * pad0 with a length of 32.
 * @function
 * @param {string} h
 */
exports.pad0Sexa = pad0(32);

/**
 * curried pad function using 'F' as the pad character.
 * @function
 * @param {number} l
 * @param {string} h
 */
var padF = exports.padF = _.curry(pad, 'F');

/**
 * padF with length of 2 for 8 bit numbers.
 * @function
 * @param {string} h
 */
exports.padFByte = padF(2);

/**
 * padF with length of 4 for 16 bit numbers.
 * @function
 * @param {string} h
 */
exports.padFWyde = padF(4);

/**
 * padF with length of 8 for 32 bit numbers.
 * @function
 * @param {string} h
 */
exports.padFTetra = padF(8);

/**
 * padF with length of 16 for 64 bit numbers.
 * @function
 * @param {string} h
 */
exports.padFOcta = padF(16);

/**
 * padF with length of 32 for 128 bit numbers.
 * @function
 * @param {string} h
 */
exports.padFSexa = padF(32);

/**
 * Returns the hexadecimal equivalent of a decimal string.
 * Uses two's-complement encoding for negatives.
 * @function
 * @param {string} deci
 * @param {number} bits - 8, 16, 32, 64, or 128
 */
exports.hexify = (function() {
  var two = Big(2);
  var n2h = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
  ];

  return function hexify(deci, bits) {
    var charLength = bits / 4;
    var isNegative = deci.charAt(0) === '-';
    var pad = isNegative ? padF : pad0;

    var digits = [];
    var q = new Big(deci).mod(two.pow(bits));
    var r;

    if (isNegative) {
      //fix Big.js modulus operation
      q = two.pow(bits).plus(q);
    }

    while (q.gte(1)) {
      r = q.mod(16);
      digits.unshift(r.toString());
      q = q.div(16).round(0, 0);
    }

    var hex = digits.map(function(d) {
      return n2h[d];
    }).join('') || '0';

    var padded = pad(charLength, hex);
    if (padded.length > charLength) {
      return padded.substring(padded.length - charLength);
    }
    return padded;
  };
})();

/**
 * Returns the decimal string for the 2's complement hexadecimal string.
 * @function
 * @param {string} hex
 * @param {number} bits - 8, 16, 32, 64, or 128
 * @param {boolean} signed
 */
exports.decify = (function() {
  var two = Big('2');

  return function decify(hex, bits, signed) {
    var m = two.pow(bits);
    var firstNeg = two.pow(bits - 1);
    var unsigned = hex
      .toUpperCase()
      .split('')
      .reverse()
      .map(valueOfHexAtPosition)
      .reduce(sum)
      .mod(m);

    //is negative
    if (signed && unsigned.cmp(firstNeg) >= 0) {
      return unsigned.minus(m).toFixed();
    }
    return unsigned.toFixed();
  };
})();

/**
 * Returns the decimal equivalent of an unsigned hexadecimal byte.
 * @param {Hex} b
 * @return {String}
 */
exports.decifyByte = function(b) {
  return (parseInt(b, 16) % 256).toString();
};

var sum = function(a, b) {
  return b.plus(a);
};

var valueOfHexAtPosition = (function() {
  var sexa = Big('16');
  var h2d = {
    '0': '0',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    'A': '10',
    'B': '11',
    'C': '12',
    'D': '13',
    'E': '14',
    'F': '15',
  };

  return function valueOfHexAtPosition(h, pos) {
    return Big(h2d[h]).times(sexa.pow(pos));
  };
})();

function signExtend(outBits, inBits, h) {
  var hexCharsIn = inBits / 4;
  var hexCharsOut= outBits / 4;
  if (h.length > hexCharsIn) {
    throw new Error('Cannot sign-extend with overflow.');
  }
  return /^[89ABCDEF]/.test(pad0(hexCharsIn, h)) ? padF(hexCharsOut, h) : pad0(hexCharsOut, h);
}

/**
 * Sign-extends a hex string to an octabyte
 * @param {number} bits - 8, 16, 32, or 64
 * @param {Hex} hex
 * @return {Hex}
 */
exports.signExtend64 = _.curry(signExtend, 64);
