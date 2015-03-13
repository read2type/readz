var SequenceString = require('./sequence-string');
var translate = require('./translate');


// I believe this class should be an event emitter, however we should live with this plain old object for a while
function Prediction() {
  this.score = {};
}

Prediction.prototype.setStart = function(start) {
  this.start = start;
}

Prediction.prototype.setStreams = function(source, stream) {
  this.stream = stream;
  this.source = source;
}

Prediction.prototype.append = function(species) {
  if (species == -1)
    return;
  var parts = species.split(';');

  for (var i = 0; i < parts.length; i++) {
    var key = translate[parts[i]-1];

    if (key in this.score)
      this.score[key]+=1
    else
      this.score[key]=1
    
    var sorted = [];

    for (var key in this.score)
      sorted.push([key, this.score[key]])

    sorted.sort( function(a,b) { 
      a = a[1]; b = b[1]; 
      return a < b ? -1 : (a > b ? 1 : 0);
    });

    if (sorted.length < 2) {
      var names = sorted[0][0].split('|');
      // sily things!
      var results = document.getElementById("results");
      var node = document.createElement('li');
      var text = document.createTextNode(names.join(' -> ') + ' at ' + ((new Date()).valueOf() - this.start)/1000 + 'seconds');
      node.appendChild(text);
      results.appendChild(node);

      // FIXME: stop the readable stream, destroy doesn't work!
      // this.source.destroy();      
      // this.stream.end();
    }
  }
}

var prediction = new Prediction();

module.exports = function(mode, line, start) {
  var sequenceString = new SequenceString({
    mode: 'fast',
    refString: line
  });
  prediction.setStart(start);
  prediction.append(sequenceString.getSpecies());
}

