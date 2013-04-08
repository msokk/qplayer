var LocalBackend = function(audiotag_id) {
  var oldAudio = document.getElementById(audiotag_id);
  if(oldAudio) {
    this.audio = oldAudio;
  } else {
    this.audio = document.createElement('audio');
    this.audio.id = audiotag_id;
  }

  LucidJS.emitter(this);
};

LocalBackend.prototype.play = function() {
  this.audio.play();
};

LocalBackend.prototype.pause = function() {
  this.audio.pause();
};
