module.exports = function(io, receiver, index) {

  var _index = {
    index: 0,
    length: 0
  };

  var _position = {
    x: 0,
    y: 0
  };

  var _direction = {
    x: 0,
    y: 0
  };

  receiver.on('/channel' + index + '/index', function(index, length) {
    _index.index = index;
    _index.length = length;
    io.sockets.emit('index', _index);
  });

  receiver.on('/channel' + index + '/position', function(x, y) {
    _position.x = x;
    _position.y = y;
    io.sockets.emit('channel' + index + '/position', _position);
  });

  receiver.on('/channel' + index + '/direction', function(x, y) {
    _direction.x = x;
    _direction.y = y;
    io.sockets.emit('channel' + index + '/direction', _direction);
  });

  receiver.on('/channel' + index + '/velocity', function(velocity) {
    io.sockets.emit('channel' + index + '/velocity', velocity);
  });
};