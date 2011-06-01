/**
 * Grooveshark and custom server provider
 */
Q.Custom = {
  gs: {
    getSearchResults: function(value, callback) {
    
    },
    getStreamURL: function(songid, callback) {
    
    }
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