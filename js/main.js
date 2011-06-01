﻿$(function() {
  window.qp = new Q.App(); 
});



/**
 * qPlayer Application
 */
Q.App = function() {
  var that = this;
  this.scKey = "46q8ZDUJD6nbBsaka0DgfA";
  this.initUI();

  this.search = new Q.Search(this);
  this.playlist = new Q.Playlist(this);
  this.player = new Q.Player(this);
  
  this.ui.setStatus(true);
};
Q.inherit(Q.App, Q.Event);

/**
 * Initalize UI elements
 */
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