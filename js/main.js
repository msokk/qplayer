$(function() { window.qp = new Q.App(); });

Q.App = function() {
  this.ui = {};
  Q.Audio = new audioElem('nativePlayer');
  /*window.qp = new Q.Player([
    new Q.GsPlayer()
  ]);
  
  setTimeout(function() {
  
    qp.loadItem(0);
  }, 2000);*/

  

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
};
Q.inherit(Q.App, Q.Event);

Q.App.prototype.initUI = function() {
  Q.UISettings(this); //Settings btn, tab
  Q.UIVolume(this); //Volume bar
  Q.UISeekbar(this); //Seek bar
  Q.UIPlaylist(this); //Playlists
  Q.UITracklist(this); //Playlist tracks
  Q.UIPlayback(this); //Playback buttons, shuffle, etc.
  Q.UIGeneric(this); //Generic
  
  
  $('#gsBtn').click(function() {
    $(this).toggleClass('gs-active');
    $(this).toggleClass('gs-disabled');
  });
  
  $('#ytBtn').click(function() {
    $(this).toggleClass('yt-active');
    $(this).toggleClass('yt-disabled');
  });
  
  $('#scBtn').click(function() {
    $(this).toggleClass('sc-active');
    $(this).toggleClass('sc-disabled');
  });
 
};