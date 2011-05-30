$(function() { 
  window.qp = new Q.App(); 
});

Q.App = function() {
  var that = this;
  this.scKey = "46q8ZDUJD6nbBsaka0DgfA";
  this.initUI();
  
  this.gsApi = new GrooveShark(function() {
    that.gsApi.ready = true;
    that.ui.setStatus(true);
  });
  
  this.search = new Q.Search(this);
  this.playlist = new Q.Playlist(this);
  this.player = new Q.Player(this);
  
  //Tests
  this.on('UIPlayback', function(state) {
    console.log('Playback: %s', state);
  });
};
Q.inherit(Q.App, Q.Event);

Q.App.prototype.initUI = function() {
  this.ui = {};
  Q.UIGeneric(this); //Generic 
  Q.UISettings(this); //Settings btn, tab
  Q.UIVolume(this); //Volume bar
  Q.UISeekbar(this); //Seek bar
  Q.UIPlaylist(this); //Playlists
  Q.UITracklist(this); //Playlist tracks
  Q.UIPlayback(this); //Playback buttons, shuffle, etc.
  Q.UISearch(this); //Search bar
};