
Q.Custom = {
  gs: {
    getSearchResults: function(value, callback) {
    
    },
    getStreamURL: function(songid, callback) {
    
    }
  }
};

/**
 * Youtube Event Bridge
 * Handles ytPlayer events
 */
Q.Youtube = {
  player: null,
  hasLoaded: false,
  state: -1,
  ready: function() {},
  trigger: function(playerId) {
    Q.Youtube.player = window[playerId];
    Q.Youtube.ready(Q.Youtube.player);
    Q.Youtube.hasLoaded = true;
  },
  onStateChange: function() {},
  triggerState: function(state) {
    Q.Youtube.state = state;
    Q.Youtube.onStateChange(state);
  }
};

function onYouTubePlayerReady(playerId) {
  Q.Youtube.trigger(playerId);
  Q.Youtube.player.addEventListener("onStateChange", "onytplayerStateChange");
};

function onytplayerStateChange(newState) {
   Q.Youtube.triggerState(newState);
}