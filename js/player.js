var Player = function() {
  this._volume = 0; // Fetch from settings
  this.state = '';
  this.currentSong = null;
  this.backend = null;
};

Player.prototype = {
  get volume() {
    return this._volume;
  },
  set volume(val) {
    this._volume = val;
  }
};

Player.prototype.play = function() {
  this.backend.play();
};

Player.prototype.pause = function() {
  this.backend.pause();
};

Player.prototype.seek = function() {

};

Player.prototype.next = function() {

};

Player.prototype.prev = function() {

};

Player.prototype.loadSong = function(song) {
  // Get backend and sync settings
};

Player.prototype.loadPlaylist = function() {

};
