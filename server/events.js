var EventEmitter = require('events');

module.exports = (function() {

  var emitter = new EventEmitter();

  return {
    emitter: emitter
  }
})();
