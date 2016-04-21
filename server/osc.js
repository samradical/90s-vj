var OscReceiver = require('osc-receiver');


module.exports = function(io) {
  var receiver = new OscReceiver();
  var _io = io;

  var _position = {
    x: 0,
    y: 0
  };
  var _direction = {
    x: 0,
    y: 0
  };

  receiver.bind(32000);

  receiver.on('/position', function(x, y) {
    if(Math.random() > .99) console.log('Position :', x, y);
    _position.x = x;
    _position.y = y;
    io.sockets.emit('position', _position);
  });

  receiver.on('/direction', function(x, y) {
    _direction.x = x;
    _direction.y = y; 
    io.sockets.emit('direction', _direction);
  });

  receiver.on('/velocity', function(velocity) {
    io.sockets.emit('velocity', velocity);
  });

  receiver.on('/channel1/rightHand/position', function(x, y) {
    _position.x = x;
    _position.y = y;
    io.sockets.emit('channel1:rightHand:position', _position);
  });


  

  receiver.on('/channel1/rightHand/direction', function(x, y) {
    _position.x = x;
    _position.y = y;
    io.sockets.emit('channel1:rightHand:direction', _position);
  });

  receiver.on('/channel1/rightHand/velocity', function(x, y) {
    _position.x = x;
    _position.y = y;
    io.sockets.emit('channel1:rightHand:velocity', _position);
  });

  receiver.on('/channel2/rightHand/position', function(x, y) {
    _position.x = x;
    _position.y = y;
    io.sockets.emit('channel2:rightHand:position', _position);
  });

  receiver.on('/channel2/rightHand/direction', function(x, y) {
    _position.x = x;
    _position.y = y;
    io.sockets.emit('channel2:rightHand:direction', _position);
  });

  receiver.on('/channel2/rightHand/velocity', function(x, y) {
    _position.x = x;
    _position.y = y;
    io.sockets.emit('channel2:rightHand:velocity', _position);
  }); 

  receiver.on('/channel3/rightHand/position', function(x, y) {
    _position.x = x;
    _position.y = y;
    io.sockets.emit('channel3:rightHand:position', _position);
  });

  receiver.on('/channel3/rightHand/direction', function(x, y) {
    _position.x = x;
    _position.y = y;
    io.sockets.emit('channel3:rightHand:direction', _position);
  });

  receiver.on('/channel3/rightHand/velocity', function(x, y) {
    _position.x = x;
    _position.y = y;
    io.sockets.emit('channel3:rightHand:velocity', _position);
  }); 
};