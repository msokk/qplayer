$(function() { window.qp = new Q.App(); });

Q.App = function() {
  this.ui = {};
  Q.Audio = new audioElem('nativePlayer');

  this.initUI();
  
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
  
  this.on('UINewPlaylist', function(elem) {
    console.log('New playlist: %s', elem.html());
  });
  
  this.on('UIViewPlaylist', function(id) {
    console.log('Viewing playlist: %s', id);
  });
  
  this.on('UIEditPlaylist', function(id) {
    console.log('Edited playlist: %s', id);
  });
  
  this.on('UISongToPlaylist', function(playlistId, songId) {
    console.log('Added song: %s to playlist %s', songId, playlistId);
  });
  
  this.on('UISearchValue', function(value) {
    console.log('Searching: %s', value);
  });
  
  this.on('UISearchFilter', function(obj) {
    console.log('Filterstate: %s', JSON.stringify(obj));
  });
  
  this.on('UISelectSong', function(id) {
    console.log('Playing song: %s', id);
  });
  
};
Q.inherit(Q.App, Q.Event);

Q.App.prototype.initUI = function() {
  Q.UISettings(this); //Settings btn, tab
  Q.UIVolume(this); //Volume bar
  Q.UISeekbar(this); //Seek bar
  Q.UIPlaylist(this); //Playlists
  Q.UITracklist(this); //Playlist tracks
  Q.UIPlayback(this); //Playback buttons, shuffle, etc.
  Q.UISearch(this); //Search bar
  Q.UIGeneric(this); //Generic 
};