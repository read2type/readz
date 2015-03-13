var readz = require('../');
var fs = require('fs');
readz(fs.createReadStream(__dirname + '/../data/ERR025475_2.fastq.gz'));
