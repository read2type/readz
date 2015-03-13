var through2 = require('through2');
var through = require('through');
var Stream = require('stream');
var byline = require('byline');
var zlib = require('browserify-zlib');

var count = 0;

function write (buf) {
  count++;
  console.log(count, buf.toString())
}
function end () {
  console.log('total', count);
}

module.exports = function (source) {
  var gunzip = zlib.createGunzip();
  var count = 0;
  source.pipe(through2(function(chunk, enc, cb){
    setTimeout(function(){
      cb(null, chunk);
    }, 10);
  }))
  .pipe(gunzip)
  .pipe(byline.createStream())
  .pipe(through(write, end));
  console.log('counting');
}
