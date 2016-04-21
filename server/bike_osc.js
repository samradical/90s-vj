var OscReceiver = require('osc-receiver');

function EaseNumber(value, easing) {
  this.value = value;
  this.targetValue = value;
  this.easing = easing;
}


var p = EaseNumber.prototype;


p.getValue = function(value) {
  return this.value;
}


p.setValue = function(value) {
  this.targetValue = value;
}

p.getTargetValue = function() {
  return this.targetValue;
}


p.setTo = function(value) {
  this.targetValue = this.value = value;
}


p.update = function() {
  this.value += (this.targetValue - this.value) * this.easing;
}


module.exports = function(io) {
  var DEFAULT_BPM = 70;
  var MAX_DATA_SIZE = 300;
  var EASING = 0.1;
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
  var _bike0 = {
    value: 0,
    counter: 0
  };

  var _easing = new EaseNumber(0, EASING);


  var _secondCounter = 0;
  var _currentTime, _beatTime;
  var tempo;
  var _bpm, _bpm2, _prevBpm;

  var _taps = [];

  var _timeout;

  receiver.bind(12345);


  receiver.on('/timestamp', function(x, y) {});

  receiver.on('/bike0', function(x) {
    if (x !== _bike0.value) {
      _bike0.counter++;
      _bike0.value = x;
      _taps.push(Date.now());
      _tempo = calculateTempo();
    }
    io.sockets.emit('bike0/rotations', x);
  });

  function calculateTempo() {
    var diffs = [];
    var totalDiffs = 0;
    var diffCount = 0;
    for (var i = 0; i < _taps.length; i++) {
      if (_taps[i + 1]) {
        var diff = _taps[i + 1] - _taps[i];
        totalDiffs += diff;
        diffCount++;
      }
    }
    var avg = totalDiffs / diffCount;

    if (diffCount > MAX_DATA_SIZE) {
      _taps.shift();
    }
    if (!isNaN(avg)) {
      _bpm = 60 / (avg / 1000);
      setBpm();
    }
    //console.log("Bpm: ", bpm);
  }


  function setBpm() {
    _bpm = Math.max(_bpm, DEFAULT_BPM);
    _easing.setValue(_bpm);
  }

  setInterval(function() {
    _secondCounter++;
    _easing.update();
    io.sockets.emit('bike0/bpm', _easing.getValue());
    if (_bpm) {
      _bpm -= 0.01;
      setBpm();
    }
  }, 10);
};