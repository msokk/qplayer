
Q.Player = function(backends) {
  backends = backends || [];
  this.backends = {};
  this.currentBackend = '';
  this.currentPlaylist = [
    {
      metadata: {
        title: 'On The Road',
        artist: 'WildCookie',
        length: '',
        album: ''
      
      },
      resource: {
        type: 'grooveshark',
        songId: 29345932 
      }
    }
  ];

};
Q.inherit(Q.Player, Q.Event);



/**
 * HTML5 Audio wrapper for buffering
 * @param {String} player ID
 */
var audioElem = function(id) {
  this.playerIndex = 1;
  this.player1 = $('<audio id="'+id+'1" preload></audio>');
  this.player2 = $('<audio id="'+id+'2" preload></audio>');
  this.player1.appendTo('body');
  this.player2.appendTo('body');
};

/**
 * Load new url - FAIL
 */
audioElem.prototype.load = function(url, cb) {
  if(this.playerIndex == 1) {
    this.playerIndex = 2;
  } else {
    this.playerIndex = 1;
  }
  var player = this['player' + this.playerIndex];
  var ready = function() {
    player.unbind('canplay', ready);
    cb && cb(player);
  };
  player.bind('canplay', ready);
  player.attr('src', url);
};

audioElem.prototype.elem = function() {
  return this['player' + this.playerIndex];
};

Q.Audio = new audioElem('nativePlayer');