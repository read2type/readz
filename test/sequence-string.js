var ENDCHAR = '$';
var ENDCODE = ENDCHAR.charCodeAt(0);
var MINCODE = 'a'.charCodeAt(0);
var MAXCODE = 'z'.charCodeAt(0);

var FREQBUCKETSIZE = 5;
var SABUCKETSIZE = 4;

var sequence = require('./sequence');
var species = require('./species');

module.exports = SequenceString;

function SequenceString(options) {
  options = options || {};
  this.mode = options.mode || 'fast';
  this.refString = options.refString;
}

SequenceString.prototype.getSpecies = function() {
  this.ranks = this.createRanks();
  this.sfxArray = this.createSfxArray();
  this.bwt = this.createBwt();
  this.freq = this.createFreq();
  this.freqCache = this.createFreqCache();
  this.sfxArrayCache = this.createSfxArrayCache();
  return this.search();
}

SequenceString.prototype.search = function() {
  //if (this.mode == 'fast')
  this.occ = this.occFast;
  if (this.multiplicity('N') < 1) {
    for (var key = 0; key < sequence.length; key++) {
      if (this.multiplicity(sequence[key]) > 0 ) { 
        return species[key];
      }
    }
  }
  return -1;
}

SequenceString.prototype.createRanks = function() {
  var freq = [];
  for (var i = ENDCODE; i <= MAXCODE; i++) 
    freq[i] = 0;
  freq[ENDCODE] = 1;
  for (var i = 0; i < this.refString.length; i++) { 
    var bcc = this.refString.charCodeAt(i);
    if (freq[bcc] === undefined) {
        var msg = "count(str): bad ch <" + this.refString.charAt(i) + "> at " + i + "string:" + this.refString;
        console.log(msg);
    }
    freq[bcc] += 1;
  }
  var c = [];
  c[ENDCODE] = 0;
  for (var i = ENDCODE + 1; i <= MAXCODE; i++) 
    c[i] = c[i-1] + freq[i-1];
  return c;
}

SequenceString.prototype.createSfxArray = function() {
  var a = new Array();
  var that = this;
  for( var i = 0; i <= this.refString.length; i++ ) 
    a[i] = i;
  return a.sort(function (i,j) {
    return that.refString.substr(i).localeCompare(that.refString.substr(j));
  });
}

SequenceString.prototype.createBwt = function() {
  var bwt = '';
  for (var i = 0; i <= this.refString.length; i++)
    bwt += this.sfxArray[i] == 0 ? "$" : this.refString.charAt(this.sfxArray[i] - 1);
  return bwt;
}

SequenceString.prototype.createFreq = function() {
  var freq = new Array();
  for (var cc = ENDCODE; cc <= MAXCODE; cc++) 
    freq[cc] = 0;
  return freq;
}

SequenceString.prototype.createFreqCache = function() {
  var freqCache = [];
  var i = 0;
  while (i < this.bwt.length) {
    if ((i % FREQBUCKETSIZE) == 0) {
      var bucket = i / FREQBUCKETSIZE;
      freqCache[bucket] = [];
      for (var j = ENDCODE; j <= MAXCODE; j++)
        freqCache[bucket][j] = this.freq[j];
    }
    this.freq[this.bwt.charCodeAt(i)]++;
    i++;
  }
  return freqCache;
}

SequenceString.prototype.createSfxArrayCache = function() {
  var saCache = [];
  for (var i = 0; i <= Math.floor( (this.sfxArray.length-1) / SABUCKETSIZE ); i++)
    saCache[i] = this.sfxArray[i * SABUCKETSIZE];
  return saCache;
}

SequenceString.prototype.multiplicity = function(pat) {
  var lo = 0, hi = this.bwt.length;
  for (var i = pat.length - 1; hi > lo && i >= 0; i--) { 
    var pati = pat.charAt(i);
    var patiCode = pati.charCodeAt(0);
    lo = this.ranks[patiCode] + this.occ(pati, lo);
    hi = this.ranks[patiCode] + this.occ(pati, hi);
  }
  return hi - lo;
}

SequenceString.prototype.occFast = function (ch, loc) {
  if (loc < 0) 
    return 0;
  var bucket = Math.floor(loc/FREQBUCKETSIZE);
  var lo = bucket * FREQBUCKETSIZE;
  var count  = this.freqCache[bucket][ch.charCodeAt(0)];
  for (var j = lo; j < loc; j++)
    if (this.bwt.charAt(j) == ch) 
      count++;
  return count;
}

SequenceString.prototype.reverse = function(str) {
  var ans = '';
  for (var i = str.length - 1; i >= 0; i--)
    ans = ans + str.charAt(i);
  return ans;
}

SequenceString.prototype.recover = function() {
  var pos = 0,
  ans = ENDCHAR;
  for (var i = 1; i < bwt.length; i++) { 
    ans = this.bwt.charAt(pos) + ans;
    pos = inverse(pos);
  }
  return ans;
}

SequenceString.prototype.inverse = function(pos) {
  var ch = this.bwt.charAt(pos);
  var chCode = ch.charCodeAt(0);
  return this.ranks[chCode] + this.occ(ch, this.bwt, pos);
}