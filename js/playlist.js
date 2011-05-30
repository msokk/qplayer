﻿/**
 * qPlayer Playlist manager
 * @param {Q.App} qPlayer
 */
Q.Playlist = function(app) {
  this.app = app;
  
  this.playlistIndex = Q.Storage.get('playlistIndex') || [];
  this.currentId = (Q.Storage.get('currentPlaylist') != undefined) ? Q.Storage.get('currentPlaylist') : -1;
  
  this.playlists = {};
  this.loadPlaylists();
  
  this.renderIndex();
  this.renderPlaylist(this.currentId);
  this.bindHandlers();
};

/**
 * Restore playlists
 */
Q.Playlist.prototype.loadPlaylists = function() {
  for(var i = 0; i < this.playlistIndex.length; i++) {
    this.playlists[this.playlistIndex[i].id] = Q.Storage.get('pl_' 
      + this.playlistIndex[i].id) || {};
  }
};

/**
 * Get Playlist by Id
 * @param {Number} Id
 * @return {Object} Playlist
 */
Q.Playlist.prototype.getPlaylist = function(id) {
  if(id == -1) {
    return this.app.search.searchPlaylist;
  }
  return this.playlists[id];
};

/**
 * Get Current Playlist
 * @return {Object} Current playlist
 */
Q.Playlist.prototype.getCurrentPlaylist = function() {
  return this.getPlaylist(this.currentId);
};

/**
 * Render playlist index
 */
Q.Playlist.prototype.renderIndex = function() {
  $('#treeview #list').empty();
  
  for(var i = 0; i < this.playlistIndex.length; i++) {
    var item = this.playlistIndex[i];
    $('<li data-id="'+item.id+'">'+item.title+'</li>').appendTo('#treeview #list');
  }
  
  $('li[data-id='+this.currentId+']').addClass('clicked');
  this.app.ui.attachDrop();
};

Q.Playlist.prototype.renderPlaylist = function(id) {
  if(this.currentId == -1) {
    return;
  }
  var result = '';
  var pl = this.getPlaylist(id);
  var keys = Object.keys(pl);
  
  for(var i = 0; i < keys.length; i++) {
    var item = pl[keys[i]];
    var type = this.app.ui.filterMap[item.resource.type];
    result += '<tr data-type="'+item.resource.type+'" data-id="'+item.id+'">'+
                '<td><span class="icon '+type+'-active"></span></td>'+
                '<td>'+_.truncate(item.metadata.title, 50, ' ')+'</td>'+
                '<td>'+item.metadata.artist+'</td>'+
                '<td>'+Q.toMinutes(item.metadata.duration)+'</td>'+
                '<td>'+item.metadata.album+'</td>'+
              '</tr>';
  }
  $('#tracklist').empty();
  $('#tracklist').append(result);
};

Q.Playlist.prototype.bindHandlers = function() {
  var that = this;
  this.app.on('UINewPlaylist', function(elem) {
    var newId = 0;
    if(that.playlistIndex[that.playlistIndex.length-1]) {
      newId = that.playlistIndex[that.playlistIndex.length-1].id + 1;
    }
    that.playlistIndex.push({
      id: newId,
      title: elem.html()
    });
    Q.Storage.set('playlistIndex', that.playlistIndex);
    Q.Storage.set('pl_' + newId, {});
    that.playlists[newId] = {};
    that.app.ui.attachDrop();
    elem.attr('data-id', newId);
  });
  
  this.app.on('UIEditPlaylist', function(id) {
    for(var i = 0; i < that.playlistIndex.length; i++) {
      var item = that.playlistIndex[i];
      if(item.id == id) {
        item.title = $('li[data-id='+id+']').html();
        Q.Storage.set('playlistIndex', that.playlistIndex);
      }
    }
  });
  
  this.app.on('UIDeletePlaylist', function(id) {
    that.playlistIndex.splice(id, 1);
    Q.Storage.set('playlistIndex', that.playlistIndex);
    Q.Storage.clear('pl_' + id);
    Q.Storage.set('currentPlaylist', -1);
  });
  
  this.app.on('UIViewPlaylist', function(id) {
    for(var i = 0; i < that.playlistIndex.length; i++) {
      var item = that.playlistIndex[i];
      if(item.id == id) {
        that.currentId = id;
        that.renderPlaylist(id);
        Q.Storage.set('currentPlaylist', id);
      }
    }
  });
  
  this.app.on('UISongToPlaylist', function(playlistId, songId) {
    var song = that.getPlaylist(that.currentId)[songId];
    var target = that.getPlaylist(playlistId);
    target[songId] = song;
    Q.Storage.set('pl_' + playlistId, target);
  });
  
  this.app.on('UIDeleteSong', function(id) {
    if(that.currentId == -1) {
      return;
    }
  
    var pl = that.getPlaylist(that.currentId);
    delete pl[id];
    Q.Storage.set('pl_' + that.currentId, pl);
  });
};