$(function() { window.qp = new Q.App(); });

Q.App = function() {
  this.scKey = "46q8ZDUJD6nbBsaka0DgfA";
  this.initUI();
  this.playlist = new Q.Playlist(this);
  this.search = new Q.Search(this);
  
  //Tests
  this.on('UIVolume', function(volume) {
    console.log('Volume: %s', volume);
  });
  
  this.on('UISeek', function(progress) {
    console.log('Progress: %s', progress);
  });
  
  this.on('UIPlayback', function(state) {
    console.log('Playback: %s', state);
  });
  
  this.on('UISongToPlaylist', function(playlistId, songId) {
    console.log('Added song: %s to playlist %s', songId, playlistId);
  });

  this.on('UISelectSong', function(id) {
    console.log('Playing song: %s', id);
  });
};
Q.inherit(Q.App, Q.Event);

Q.App.prototype.initUI = function() {
  this.ui = {};
  Q.UISettings(this); //Settings btn, tab
  Q.UIVolume(this); //Volume bar
  Q.UISeekbar(this); //Seek bar
  Q.UIPlaylist(this); //Playlists
  Q.UITracklist(this); //Playlist tracks
  Q.UIPlayback(this); //Playback buttons, shuffle, etc.
  Q.UISearch(this); //Search bar
  Q.UIGeneric(this); //Generic 
};