var io = require('socket.io');
var ip = require('ip');
var OSC = require('./osc');
var BIKE_OSC = require('./bike_osc');
var Emitter = require('./events');

var SOCKET = function(express) {

	var users = {};
	var ids = [];

	io = io.listen(express);
	io.on('connection', userConnected);

	function userConnected(socket) {

		ids.push(socket.id);
		users[socket.id] = socket;

		users[socket.id].emit('handshake', {
			index:ids.length-1,
			id: socket.id,
			ip: ip.address()
		});

		socket.on('queue:video:search', function(val){
			Emitter.emitter.emit('video:search', val);
		});

		console.log("Connection: ", socket.id, 'at: ', ip.address());
	}


	var osc = new OSC(io);
	var bike_osc = new BIKE_OSC(io);

};

module.exports = SOCKET;
