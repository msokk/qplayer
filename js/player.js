/**
 * qPlayer Player module
 * @param {Q.App} qPlayer
 */
Q.Player = function(app) {
  this.app = app;
  this.repeat = false;
  this.shuffle = false;  
  this.backends = {
    grooveshark: new Q.gsPlayer(app),
    youtube: new Q.ytPlayer(app),
    soundcloud: new Q.scPlayer(app)
  };
  
  app.ui.volume.setVolume(Q.Storage.get('lastVolume')*100 || 50);
  
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
  
  //Playback buttons
  this.app.on('UIPlayback', function(state) {
    switch(state) {
      case 'play': if(that.currentBackend.play) that.currentBackend.play();
        break;
      case 'pause': if(that.currentBackend.pause) that.currentBackend.pause();
        break;
      case 'prev': that.go(-1);
        break;
      case 'next': that.go(1);
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
  
  //Song selection
  this.app.on('UISelectSong', function(id, fromCode) {
    if(!fromCode) {
      that.playlist = that.app.playlist.getCurrentPlaylist();
      that.app.ui.activatePlaylist(that.app.playlist.currentId);
    }
    var song = that.song = that.playlist[id];

    if(that.currentBackend.unload) {
      that.currentBackend.unload();
    }
    that.currentBackend = that.backends[song.resource.type];
    that.app.ui.setPlayButton(true);
    that.app.ui.seekbar.setProgress('0');
    that.app.ui.seekbar.setDownloaded('100');
    that.app.ui.setMetadata(song.metadata, song.resource.type);
    that.currentBackend.load(song.resource);
  });
  
  //Volume change
  this.app.on('UIVolume', function(volume) {
    Q.Storage.set('lastVolume', (volume == 0)? 0: volume / 100);
    if(that.currentBackend.setVolume) {
      that.currentBackend.setVolume(volume);
    }
  });
  
  //Track seeking
  this.app.on('UISeek', function(progress) {
    if(that.currentBackend.seek) {
      that.currentBackend.seek(progress);
    } else {
      that.app.ui.seekbar.setProgress('0');
    }
  });
  
  //Play next song
  this.app.on('PlayNext', function() {
    that.go(1);
  });
};

Q.Player.prototype.go = function(offset) {
  var keys = Object.keys(this.playlist);
  var songId = this.song.id;
  
  var nextSong = this.song;
  
  for(var i = 0; i < keys.length; i++) {
    if(keys[i] == songId) {
      nextSong = this.playlist[keys[i + offset]];
      if(this.repeat && !nextSong) {
        nextSong = this.playlist[keys[0]];
      }
    }
  }
  if(nextSong) {
    this.app.ui.selectSong(nextSong.id);
  }
};

/**
 * qPlayer Grooveshark player
 * @param {Q.App} qPlayer
 */
Q.gsPlayer = function(app) {
  this.app = app;
  Q.Audio.player1[0].volume = Q.Storage.get('lastVolume') || 0.5;
  Q.Audio.player2[0].volume = Q.Storage.get('lastVolume') || 0.5;
  this.duration = 0;
  
  this.bindEvents();
};

Q.gsPlayer.prototype.bindEvents = function() {
  var that = this;
  this.startedLoading = false;
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
    that.app.emit('PlayNext');
  });
};

Q.gsPlayer.prototype.player = function() {
  return Q.Audio.current();
};

Q.gsPlayer.prototype.load = function(resource) {
  var that = this;
  this.startedLoading = false;
  var song = new GrooveSharkSong(this.app.gsApi, resource.songId);
  song.getStreamURL(function(url) {
    Q.Audio.load(url);
    that.play();
  });
};

Q.gsPlayer.prototype.unload = function() {

  this.pause();
};

Q.gsPlayer.prototype.play = function() {
  this.player().play();
};

Q.gsPlayer.prototype.pause = function() {
  this.player().pause();
};

Q.gsPlayer.prototype.seek = function(time) {
  var position = (time / 100) * this.duration;
  this.player().currentTime = position;
};

Q.gsPlayer.prototype.setVolume = function(volume) {
  var vol = volume / 100;
  this.player().volume = vol;
};

/**
 * qPlayer YouTube player
 * @param {Q.App} qPlayer
 */
Q.ytPlayer = function(app) {
  this.app = app;
  this.duration = 0;
  this.player = null;
  this.progressTimer = 0;
  this.expanded = false;
  
  this.sizeMap = {
    small: [ 320, 240 ],
    medium: [ 640, 360 ],
    large: [ 853, 480 ],
    hd720: [ 853, 480 ],
    hd1080: [ 853, 480 ],
    highres: [ 853, 480 ]
  }
  
  Q.Youtube.ready = function(player) {
    this.player = player;
  };
  this.player = Q.Youtube.getPlayer();
  this.bindEvents();
};
  
Q.ytPlayer.prototype.bindEvents = function() {
  var that = this;
  
  var videoBuffering = function() {
    that.player.setVolume(Q.Storage.get('lastVolume')*100 || 50);
    that.duration = that.player.getDuration();
    clearInterval(that.progressTimer);
    that.progressTimer = setInterval(function() {
      var perc = (that.player.getCurrentTime() / that.duration) * 100;
      that.app.ui.seekbar.setProgress(perc);
      
      var perc2 = ((that.player.getVideoStartBytes() + that.player.getVideoBytesLoaded()) / that.player.getVideoBytesTotal()) * 100;
      that.app.ui.seekbar.setDownloaded(perc2);
    }, 1000);
  };
  
  
  var videoEnded = function() {
    clearInterval(that.progressTimer);
    that.app.ui.setPlayButton(true);
    that.app.ui.seekbar.setProgress('0');
    that.app.ui.seekbar.setDownloaded('100');
    that.app.emit('PlayNext');
  };
  
  Q.Youtube.onStateChange = function(state) {
    switch(state) {
      case 3: videoBuffering();
        break;
      case 0: videoEnded();
        break;
    }
  };

  $('#ytOverlay').click(function() {
    var size = that.sizeMap[that.player.getPlaybackQuality()];
    if(that.expanded) {
      that.setSize(200, 200);
      that.expanded = false;
    } else {
      that.setSize(size[0], size[1]);
      that.expanded = true;
    }
  });
  
  $('#ytOverlay').dblclick(function() {
    that.setSize(true);
    that.expanded = true;
  });
};

Q.ytPlayer.prototype.setSize = function(width, height) {
  if(typeof width == 'boolean') {
    $('#ytPlayer, #ytOverlay').attr('width', $('#content-main').width())
      .attr('height', $('#content-main').height())
      .width($('#content-main').width())
      .height($('#content-main').height())
      .css({ 
        'top': $('#content-main').position().top, 
        'left': $('#content-main').position().left, 
        'position': 'fixed'  
      });
    return;
  }
  $('#ytPlayer, #ytOverlay').attr('width', width)
    .attr('height', height)
    .width(width)
    .height(height)
    .css({ 'top': 200 - height, 'left': 0, 'position': 'absolute' });
};

Q.ytPlayer.prototype.load = function(resource) {
  $('#ytPlayer').addClass('show');
  $('#ytOverlay').addClass('show');
  this.player.cueVideoById(resource.videoId, 0, 'highres');
  this.player.playVideo();
  this.app.ui.setPlayButton(false);
};

Q.ytPlayer.prototype.unload = function() {
  clearInterval(this.progressTimer);
  $('#ytPlayer').removeClass('show');
  $('#ytOverlay').removeClass('show');
  this.pause();
};

Q.ytPlayer.prototype.play = function() {
  this.player.playVideo();
};

Q.ytPlayer.prototype.pause = function() {
  this.player.pauseVideo();
};

Q.ytPlayer.prototype.seek = function(time) {
  var position = (time / 100) * this.duration;
  this.player.seekTo(position);
};

Q.ytPlayer.prototype.setVolume = function(volume) {
  this.player.setVolume(volume);
};

/**
 * qPlayer SoundCloud player
 * @param {Q.App} qPlayer
 */
Q.scPlayer = function(app) {
  this.app = app;
  this.duration = 0;
  
  Q.Audio.player1[0].volume = Q.Storage.get('lastVolume') || 0.5;
  Q.Audio.player2[0].volume = Q.Storage.get('lastVolume') || 0.5;
  
  this.bindEvents();
};

Q.scPlayer.prototype.bindEvents = function() {
  var that = this;
  this.startedLoading = false;
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
    that.app.emit('PlayNext');
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

Q.scPlayer.prototype.unload = function() {
  this.pause();
};

Q.scPlayer.prototype.play = function() {
  this.player().play();
};

Q.scPlayer.prototype.pause = function() {
  this.player().pause();
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