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


/**
 * Convert seconds to minutestring
 * @param {Number} seconds
 * @return {String} minutes
 */
Q.toMinutes = function(seconds) {
  if(seconds == '') {
    return '';
  }
  var m = Math.floor((seconds / 60));
  var s = seconds % 60;
  return m + ':' + _.lpad(s+'', 2, '0');
}; 

/**
 * EventEmitter
 */
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

/**
 * LocalStorage wrapper
 */
Q.Storage = {

  /**
   * Stores object to storage
   * @param {Mixed} object
   */
  set : function(key, value) {
    if(!window.localStorage) {
      throw new Error('LocalStorage not supported here! Fallback missing!');
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  },

  /**
   * Fetches object or string from storage
   * @param {String} key
   * @return {Mixed} String/JSON
   */
  get : function(key) {
    if(!window.localStorage) {
      throw new Error('LocalStorage not supported here! Fallback missing!');
    }
    var str = window.localStorage.getItem(key);
    if(str) {
      return JSON.parse(str);
    } else {
      return null;
    }
  },

  /**
   * Deletes item from storage
   * @param {String} key
   */
  clear : function(key) {
    delete window.localStorage[key];
  }
};

/**
 * YouTube Player Event Bridge
 * Handles ytPlayer events
 */
Q.Youtube = {
  player: null,
  hasLoaded: false,
  state: -1,
  
  ready: function() {},
  trigger: function(playerId) {
    Q.Youtube.player = document.getElementById(playerId);
    Q.Youtube.ready(Q.Youtube.player);
    Q.Youtube.hasLoaded = true;
  },
  
  onStateChange: function() {},
  triggerState: function(state) {
    Q.Youtube.state = state;
    Q.Youtube.onStateChange(state);
  },
  
  getPlayer: function() {
    if(Q.Youtube.player) {
      return Q.Youtube.player;
    }
    return document.getElementById('ytPlayer');
  }
};

/**
 * Native YouTube player event
 * Triggered when player is ready
 * @param {String} player ID
 */
function onYouTubePlayerReady(playerId) {
  Q.Youtube.trigger(playerId);
  Q.Youtube.player.addEventListener("onStateChange", "onytplayerStateChange");
};

/**
 * Native YouTube player event
 * Triggered when player changes state
 * @param {Number} player state
 */
function onytplayerStateChange(newState) {
   Q.Youtube.triggerState(newState);
}