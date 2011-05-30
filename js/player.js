
Q.Player = function(app) {
  this.app = app;
  this.currentBackend = '';
  
  this.bindUIHandlers();
};
Q.inherit(Q.Player, Q.Event);

Q.Player.prototype.bindUIHandlers = function() {
  var that = this;
  this.on('UISelectSong', function(id) {
    var playlist = that.app.playlist.getCurrentPlaylist();
    var song = playlist[id];
    console.log(playlist);
    console.log(song);
    if(song.resource.type == 'soundcloud') {
      that.app.ui.setMetadata(song.metadata);
      Q.Audio.load(song.resource.stream_url + '?&consumer_key=' + that.app.scKey, function(player) {
        player.play();
        var duration = player.duration;
        $(player).bind('timeupdate', function(data) {
          var perc = (player.currentTime / duration) * 100;
          that.app.ui.seekbar.setProgress(perc);
        });
      });
    }
  });
};

Q.Player.prototype.get = function() {

};
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
  var player = this['player' + this.playerIndex];
  var ready = function() {
    player.unbind('canplay', ready);
    cb && cb(player[0]);
  };
  player.bind('canplay', ready);
  player.attr('src', url);
};

audioElem.prototype.swap = function() {
  if(this.playerIndex == 1) {
    this.playerIndex = 2;
  } else {
    this.playerIndex = 1;
  }
};

audioElem.prototype.current = function() {
  return this['player' + this.playerIndex][0];
};

Q.Audio = new audioElem('nativePlayer');