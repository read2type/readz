var SequenceString = require('./sequence-string');
var translate = require('./translate');

var results = document.getElementById('results');

function clear(node) {
  while (node.firstChild)
    node.removeChild(node.firstChild);
}

// I believe this class should be an event emitter, however we should live with this plain old object for a while
function Prediction() {
  this.score = {};
}

Prediction.prototype.setStart = function(start) {
  this.start = start;
}

Prediction.prototype.setMode = function(mode) {
  mode = mode == 'fast' ? 'fast' : 'slow';
  this.mode = mode;
}

Prediction.prototype.handleFast = function(sorted) {
  if (sorted.length < 2) {
    this.appendText(sorted[0][0].split('|').join(' -> '));
  } else {
    // this is still wrong
    var currentScore = sorted[sorted.length-1];
    for (var i = sorted.length-1; i >=0 ; i--) {
      if (sorted[i][1] < currentScore)
        break;
      this.appendText(sorted[i][0].split('|').join(' -> '));
    }
  }
}

Prediction.prototype.handleSlow = function(sorted) {
  for (var i = sorted.length - 1; i >= 0; i--)
    this.appendText(sorted[i][0].split('|').join(' -> ') + ' (score: ' + sorted[i][1] + ')');
}

Prediction.prototype.appendText = function(value) {
  var node = document.createElement('li');
  var timeDiff = ((new Date()).valueOf() - this.start)/1000;
  var text = document.createTextNode(value);
  node.appendChild(text);
  results.appendChild(node);
  document.getElementById('time').innerHTML = 'last update: ' + timeDiff + ' seconds, since ' + new Date(this.start);
}

Prediction.prototype.append = function(species) {
  if (species == -1)
    return;
  var parts = species.split(';');

  // save the current finding
  this.lastParts = parts;
  this.lastSpecies = species;
  
  for (var i = 0; i < parts.length; i++) {
    var key = translate[parts[i]-1];
    if (key in this.score)
      this.score[key]+=1
    else
      this.score[key]=1 
  }
  
  var sorted = [];
  for (var key in this.score)
    sorted.push([key, this.score[key]])

  sorted.sort( function(a,b) { 
    a = a[1]; b = b[1]; 
    return a < b ? -1 : (a > b ? 1 : 0);
  });  

  //FIXME: print
  clear(results);
  if (this.mode == 'fast') {
    this.handleFast(sorted);
  }
  else {
    this.handleSlow(sorted);
  }
}

var prediction = new Prediction();

module.exports = function(mode, line, start) {
  var sequenceString = new SequenceString({
    mode: mode || 'fast',
    refString: line
  });
  prediction.setStart(start);
  prediction.setMode(mode || 'fast');
  prediction.append(sequenceString.getSpecies(prediction.lastParts, prediction.lastSpecies));
}

