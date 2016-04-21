var OscReceiver = require('osc-receiver');
var argv = require('yargs').argv;
var ip = require('ip');
var oscChannels = require('./osc_channel');

module.exports = function(io) {
  var receiver = new OscReceiver();
  var _io = io;
  var oscPort = argv.oscPort || 32000;

  receiver.bind(oscPort);

  var channels = argv.channels || 2;
  for (var i = 0; i < channels; i++) {
    new oscChannels(_io, receiver, i);
  }

   receiver.on('/channel1', function() {
   	console.log(arguments);
  });

  console.log("OSC bound on port " + oscPort + " (" + ip.address() + ')');

};