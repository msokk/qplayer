
Q.Playlist = function(app) {
  this.app = app;
  this.playlistIndex = Q.Storage.get('playlistIndex') || [];
  this.playlists = {};
  this.loadPlaylists();
  
  this.currentId = Q.Storage.get('currentPlaylist') || 0;
  /*[
    {
      metadata: {
        title: 'On The Road',
        artist: 'WildCookie',
        length: '',
        album: ''
      
      },
      resource: {
        type: 'grooveshark',
        songId: 29345932 
      }
    }
  ];*/
  
  this.renderIndex();
   
  this.bindHandlers();
};
Q.inherit(Q.Playlist, Q.Event);

Q.Playlist.prototype.loadPlaylists = function() {
  for(var i = 0; i < this.playlistIndex.length; i++) {
    this.playlists[this.playlistIndex[i].id] = Q.Storage.get('pl_' 
      + this.playlistIndex[i].id) || {};
  }
};

Q.Playlist.prototype.renderIndex = function() {
  $('#treeview #list').empty();
  for(var i = 0; i < this.playlistIndex.length; i++) {
    var item = this.playlistIndex[i];
    $('<li data-id="'+item.id+'">'+item.title+'</li>').appendTo('#treeview #list');
  }
  $('li[data-id='+this.currentId+']').addClass('clicked');
  this.renderPlaylist(this.currentId);
};

Q.Playlist.prototype.renderPlaylist = function(id) {
  console.log('Rendering playlist: %s', id);
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
  });
  
  this.on('UIEditPlaylist', function(id) {
    for(var i = 0; i < that.playlistIndex.length; i++) {
      var item = that.playlistIndex[i];
      if(item.id == id) {
        item.title = $('li[data-id='+id+']').html();
        Q.Storage.set('playlistIndex', that.playlistIndex);
      }
    }
  });
  
  this.on('UIDeletePlaylist', function(id) {
    that.playlistIndex.splice(id, 1);
    Q.Storage.set('playlistIndex', that.playlistIndex);
  });
  
  this.on('UIViewPlaylist', function(id) {
    for(var i = 0; i < that.playlistIndex.length; i++) {
      var item = that.playlistIndex[i];
      if(item.id == id) {
        that.renderPlaylist(id);
        that.currentId = id;
        Q.Storage.set('currentPlaylist', id);
      }
    }
  });
};