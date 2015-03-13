(function(window) {

require('setimmediate');
require('readable-stream');
var createReadStream = require('filereader-stream');
var through = require('through');
var drop = require('drag-drop');
var zlib = require('browserify-zlib');
var byline = require('byline');
var work = require('webworkify');
var SequenceString = require('./sequence-string');
var predict = require('./predict');

var info = document.getElementById('info');

function debug(text) {
  info.innerHTML = text;
}

drop('#drop', function(files){
  var first = files[0];
  var gunzip = zlib.createGunzip();
  var source = createReadStream(first);
  var lineStream = byline.createStream();
  source.pipe(through(write, end));
  gunzip.pipe(lineStream);

  // direct piping seems unstable, this is nansty workaround but it works.
  function write(chunk){
    gunzip.write(chunk);  
  }
  function end(){
    gunzip.end();
  }

  var start = (new Date()).valueOf();
  var lineNumber = 0;
  
  // prediction worker
  lineStream.on('end', function(){
    debug(first.name + ' has ' + lineNumber + ' lines. Read in ' + ((new Date()).valueOf() - start)/1000 + ' seconds');
  });
  lineStream.on('data', function(data){
    lineNumber++;
    if ((lineNumber + 2) % 4 == 0) {
      lineStream.pause();

      // ideally we should send the line to a worker
      var line = data.toString();      
      debug('Reading ' + first.name + ' -> ' + lineNumber + ' : ' + line);
    
    // current hack: make it async
    setTimeout(function(){
        // this is a damn slow process, we should have a functional approach rather than managing states
        predict('fast', line, start);
        lineStream.resume();
      }, 1);
    }
  });
});

console.log('boot...');

})();
