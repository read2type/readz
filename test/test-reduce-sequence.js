var sequence = require('./sequence');
var species = require('./species');

// imagine we have this `lastSpecies` as last matched species
var lastSpecies = '474';

// hence the parts i.e. lasParts is is as follows:
var lastParts = lastSpecies.split(';');

var newSequence = [];
var newSpecies = [];

// this is the reduce function
// given,
//   key: an element of (current) species[].
//   index: index of key inside the species[].
function reduce(key, index) {
  var reduced = false;
  for (var i = 0; i < lastParts.length; i++) {
    var part = lastParts[i];
    if (key.indexOf(part) < 0) {
      reduced = true;
      break;
    }
  }
  // if not reduced, we can use it for next iteration.
  if (!reduced) {
    newSpecies.push(key);
    newSequence.push(sequence[index]);
  }
}

console.log('before: ');
console.log('sequence', sequence.length);
console.log('species ', species.length);

// simulate loop on all species[].
for (var i = 0; i < species.length; i++) {
  reduce(species[i], i);
}

console.log('after: ');
console.log('sequence', newSequence.length);
console.log('species ', newSpecies.length);
