if(!window.Q) { window.Q = {}; }

/**
 * Sets child's constructor
 * @param {Object} constructor
 * @param {Object} superconstructor
 * TODO: add instanceof
 */
Q.inherit = function(ctor, superCtor) {
  for (var i in superCtor.prototype){
    ctor.prototype[i] = superCtor.prototype[i];
  }
};

Q.Event = (function () {

  var registry = {},
  Event = function() {};

  Event.prototype = {
    constructor : Q.Event,

    /**
     * Listen for the event forever
     * @param {String} event name
     * @param {Function} event callback
     * @return {Number} listener ID
     */
    on : function(event, callback) {
      if(typeof callback !== 'function') {
        throw 'Not a function!';
      }
      if(!registry[event]) {
        registry[event] = [callback];
      } else {
        registry[event].push(callback);
      }
      return registry[event].length - 1;
    },

    /**
     * Listen for the event once
     * @param {String} event name
     * @param {Function} event callback
     * @return {Number} listener ID
     */
    once : function(event, callback) {
      var that = this;
      var id = this.on(event, function() {
        callback.apply(null, arguments);
        that.removeListener(event, id);
      });
      return id;
    },

    /**
     * Emit event with optional arguments
     * @param {String} event name
     * @param {Mixed} passed arguments
     */
    emit : function(/* event[, args] */) {
      var args = Array.prototype.slice.call(arguments);
      if(args.length === 0) throw 'Event required!';
      var i = 0, listeners = registry[args[0]];
      if(!listeners) {
        return;
      }

      for(i; i < listeners.length; i++) {
        listeners[i].apply(null, args.slice(1));
      }
    },

    /**
     * Removes listener from event with ID
     * @param {String} event name
     * @param {Number} listener ID
     */
    removeListener: function(event, id) {
      if(typeof registry[event][id] !== 'undefined') {
        registry[event].splice(id, 1);
      }
    },

    /**
     * Removes all listeners from event
     * @param {String} event name
     */
    removeAllListeners : function(event) {
      delete registry[event];
    }
  };

  return Event;
}());