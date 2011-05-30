/**
 * qPlayer Player module
 * @param {Q.App} qPlayer
 */
Q.Player = function(app) {
  this.app = app;
  this.repeat = false;
  this.shuffle = true;
  
  this.backends = {
    grooveshark: new Q.gsPlayer(app),
    youtube: new Q.ytPlayer(app),
    soundcloud: new Q.scPlayer(app)
  };
  
  this.currentBackend = {};
  
  this.playlist = app.playlist.getCurrentPlaylist();
  this.song = {};
  
  this.bindUIHandlers();
};
Q.inherit(Q.Player, Q.Event);

/**
 * Bind UI Events
 */
Q.Player.prototype.bindUIHandlers = function() {
  var that = this;
  
  this.app.on('UIPlayback', function(state) {
    switch(state) {
      case 'play': that.currentBackend.play();
        break;
      case 'pause': that.currentBackend.pause();
        break;
      case 'prev': that.currentBackend.go(-1);
        break;
      case 'next': that.currentBackend.go(1);
        break;
      case 'shuffleOn': that.shuffle = true;
        break;
      case 'shuffleOff': that.shuffle = false;
        break;
      case 'repeatOn': that.repeat = true;
        break;
      case 'repeatOff': that.repeat = false;
        break;
    }
  });
  
  this.app.on('UISelectSong', function(id) {
    that.playlist = that.app.playlist.getCurrentPlaylist();
    var song = that.song = that.playlist[id];
    
    console.log(that.playlist); //DEBUG
    console.log(song); //DEBUG
    
    that.currentBackend = that.backends[song.resource.type];
    that.app.ui.setPlayButton(true);
    that.app.ui.seekbar.setProgress('0');
    that.app.ui.seekbar.setDownloaded('100');
    that.currentBackend.load(song.resource);
    that.app.ui.setMetadata(song.metadata);
  });
  
  this.app.on('UIVolume', function(volume) {
    that.currentBackend.setVolume(volume);
  });
  
  this.app.on('UISeek', function(progress) {
    that.currentBackend.seek(progress);
  });
};

/**
 * qPlayer Grooveshark player
 * @param {Q.App} qPlayer
 */
Q.gsPlayer = function(app) {

};

Q.gsPlayer.prototype.load = function() {

};

Q.gsPlayer.prototype.play = function() {

};

Q.gsPlayer.prototype.pause = function() {

};

Q.gsPlayer.prototype.go = function(offset) {

};

Q.gsPlayer.prototype.seek = function(time) {

};

/**
 * qPlayer YouTube player
 * @param {Q.App} qPlayer
 */
Q.ytPlayer = function(app) {

};

Q.ytPlayer.prototype.load = function() {

};

Q.ytPlayer.prototype.play = function() {

};

Q.ytPlayer.prototype.pause = function() {

};

Q.ytPlayer.prototype.go = function(offset) {

};

Q.ytPlayer.prototype.seek = function(time) {

};

/**
 * qPlayer SoundCloud player
 * @param {Q.App} qPlayer
 */
Q.scPlayer = function(app) {
  this.app = app;
  this.duration = 0;
  
  this.bindEvents();
};

Q.scPlayer.prototype.bindEvents = function() {
  var that = this;
  this.startedLoading = false;
  this.playing = false;
  that.duration = 0;
  
  Q.Audio.bind('timeupdate', function(data) {
    if($(this)[0] == that.player()) {
      var perc = (that.player().currentTime / that.duration) * 100;
      that.app.ui.seekbar.setProgress(perc);
    }
  });
  
  Q.Audio.bind('progress', function(data) {
    if($(this)[0] == that.player() && that.startedLoading) {
      var perc = (that.player().buffered.end() / that.duration) * 100;
      that.app.ui.seekbar.setDownloaded(perc);
    }
  });

  Q.Audio.bind('loadedmetadata', function() {
    that.startedLoading = true;
    that.duration = that.player().duration;
  });

  Q.Audio.bind('canplay', function() {
    that.player().play();
    that.app.ui.setPlayButton(false);
  });
  
  Q.Audio.bind('ended', function() {
    that.app.ui.setPlayButton(true);
    that.app.ui.seekbar.setProgress('0');
    that.app.ui.seekbar.setDownloaded('100');
    console.log('Finished playing, get next');
  });
};

Q.scPlayer.prototype.player = function() {
  return Q.Audio.current();
};

Q.scPlayer.prototype.load = function(resource) {
  this.startedLoading = false;
  var url = resource.stream_url + '?&consumer_key=' + this.app.scKey;
  Q.Audio.load(url);
};

Q.scPlayer.prototype.play = function() {
  this.player().play();
  this.playing = true;
};

Q.scPlayer.prototype.pause = function() {
  this.player().pause();
  this.playing = false;
};

Q.scPlayer.prototype.go = function(offset) {

};

Q.scPlayer.prototype.seek = function(time) {
  var position = (time / 100) * this.duration;
  this.player().currentTime = position;
};

Q.scPlayer.prototype.setVolume = function(volume) {
  var vol = volume / 100;
  this.player().volume = vol;
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
 * Load new resource to elements
 * @param {String} resource url
 * @param {Function} loaded callback
 */
audioElem.prototype.load = function(url, cb) {
  var that = this;
  var player = this['player' + this.playerIndex];
  var ready = function() {
    player.unbind('canplay', ready);
    cb && cb(player[0]);
  };
  player.bind('canplay', ready);
  player.attr('src', url);
};

/**
 * Swap player instance
 */
audioElem.prototype.swap = function() {
  if(this.playerIndex == 1) {
    this.playerIndex = 2;
  } else {
    this.playerIndex = 1;
  }
};

/**
 * Bind events to both elements
 * @param {String} event
 * @param {Function} callback
 */
audioElem.prototype.bind = function(event, cb) {
  $(this.player1, this.player2).bind(event, cb);
};

/**
 * Get current player
 * @return {HTMLAudioElement} audio elem
 */
audioElem.prototype.current = function() {
  return this['player' + this.playerIndex][0];
};

Q.Audio = new audioElem('nativePlayer');