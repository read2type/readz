var sequence = require('../sequence');
var species = require('../species');
 
// imagine we have this `lastSpecies` as the last matched species
// var lastSpecies = '633;1';
var lastSpecies = '780;373;254;474;362;779;803;801;804;475;374;360;361;1079;802';
 
var newSequence = [];
var newSpecies = [];
 
// this is the reduce function
// given,
//   `key`: an element of (current) `species[]`.
//   `index`: an index of key inside the `species[]`.
function reduce(key, index) {
  var keyParts = key.split(';');
  if (keyParts.length < lastSpecies.split(';').length) {
    var isSubset = true;
    for (var i = 0; i < keyParts.length; i++) {
      var lastSpeciesWithGuard = ';'.concat(lastSpecies).concat(';');
      var keyPartWithGuard = ';'.concat(keyParts[i]).concat(';');
      if (lastSpeciesWithGuard.indexOf(keyPartWithGuard) < 0) {
        isSubset = false;
        break;
      }

      // if not reduced (or if subset = true), we can use it for the next iteration.
      if (isSubset) {
        newSpecies.push(key);
        newSequence.push(sequence[index]);
      }
    }
  }
}
 
console.log('before: ');
console.log('sequence', sequence.length);
console.log('species ', species.length);
 
// loop!
for (var i = 0; i < species.length; i++) {
  reduce(species[i], i);
}
 
console.log('after: ');
console.log('sequence', newSequence.length);
console.log('species ', newSpecies.length);
