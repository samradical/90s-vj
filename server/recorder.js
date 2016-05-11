var tmp = require('tmp');
var fs = require('fs');
var path = require('path');

var RECORDER = (() => {

	let _temp, incre = 0
    tmp.dir({ mode: 0750, prefix: 'VJ_' }, function _tempDirCreated(err, path) {
        if (err) throw err;
		_temp = path
    });

    function _decodeBase64Image(dataString) {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};

        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }

        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');

        return response;
    }

    function saveImage(image, cb) {
    	if(!_temp){
    		return
    	}
        var imageBuffer = _decodeBase64Image(image);
        var p = path.join(_temp, `test${incre}.jpg`)
        fs.writeFile(p, imageBuffer.data, cb)
        incre++
    }

    return {
        saveImage
    }
})();

module.exports = RECORDER;