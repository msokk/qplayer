
Q.GsPlayer = function() {
  var that = this;
  this.name = 'grooveshark';
  this.api = new GrooveShark(function() {
    that.emit('ready');
  });
  this.elem = Q.Audio.elem();
};
Q.inherit(Q.GsPlayer, Q.Event);

Q.GsPlayer.prototype.load = function(songId, cb) {
  var that = this;
  var song = new GrooveSharkSong(this.api, songId);
  
  song.getStreamURL(function(url) {
    Q.Audio.load(url, function(newElem) {
      that.elem.pause();
      that.elem.setAttribute('src', '');
      that.elem = newElem;
      that.emit('loaded', that.elem.duration);
      cb && cb(that.elem.duration);
    });
  });
};

Q.GsPlayer.prototype.pause = function() {
  this.elem.pause();
};

Q.GsPlayer.prototype.play = function() {
  return this.elem.play();
};

Q.GsPlayer.prototype.paused = function() {
  return this.elem.paused;
};

Q.GsPlayer.prototype.time = function(newTime) {
  if(this.elem.ended) {
    this.emit('ended');
  }
  if(newTime) {
    this.elem.currentTime = newTime;
  } else {
    return this.elem.currentTime;
  }
};

Q.GsPlayer.prototype.volume = function(newVolume) {
  if(newVolume) {
    newVolume = newVolume / 100;
    this.elem.volume = newVolume;
  } else {
    return this.elem.volume;
  }
};