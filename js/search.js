﻿Q.Search = function(app) {
  this.app = app;
  this.filterstate = Q.Storage.get('filterstate') || 
    { grooveshark: true, youtube: true, soundcloud: true };
    
  this.lastSearch = Q.Storage.get('lastsearch') || '';
  $('#searchBox').val(this.lastSearch);
  
  this.searchPlaylist = [];
  
  app.ui.setFilters(this.filterstate);
  
  this.bindHandlers();
};
Q.inherit(Q.Search, Q.Event);

Q.Search.prototype.bindHandlers = function() {
  var that = this;
  this.on('UISearchValue', function(value) {
    that.doSearch(_.trim(value));
  });
  
  this.on('UISearchFilter', function(obj) {
    var key = Object.keys(obj)[0];
    that.filterstate[key] = obj[key];
    Q.Storage.set('filterstate', that.filterstate);
  });
};

Q.Search.prototype.renderResult = function() {
  var result = '';
  var keys = Object.keys(this.searchPlaylist);
  for(var i = 0; i < keys.length; i++) {
    var item = this.searchPlaylist[keys[i]];
    var type = this.app.ui.filterMap[item.resource.type];
    result += '<tr data-type="'+item.resource.type+'" data-id="'+item.id+'">'+
                '<td><span class="icon '+type+'-active"></span></td>'+
                '<td>'+_.truncate(item.metadata.title, 50, ' ')+'</td>'+
                '<td>'+item.metadata.artist+'</td>'+
                '<td>'+Q.toMinutes(item.metadata.duration)+'</td>'+
                '<td>'+item.metadata.album+'</td>'+
              '</tr>';
  }
  $('#tracklist').append(result);
  this.app.ui.setSearchStatus(false);
};

Q.Search.prototype.doSearch = function(value) {
  Q.Storage.set('lastsearch', value);
  Q.Storage.set('currentPlaylist', -1);
  this.app.playlist.currentId = -1;
  this.app.ui.activatePlaylist(-1);
  $('#list li').removeClass('clicked');
  this.searchPlaylist = [];
  
  $('#tracklist').empty();
  var filters = Object.keys(this.filterstate);
  for(var i = 0; i < filters.length; i++) {
    if(this.filterstate[filters[i]]) {
      this[filters[i]](value);
    }
  }
};

Q.Search.prototype.grooveshark = function(value) {
  console.log('gs');
};

Q.Search.prototype.youtube = function(value) {
  this.app.ui.setSearchStatus(true);
  var that = this;
  $.getJSON('http://gdata.youtube.com/feeds/api/videos?q='+value+
    '&category=Music&v=2&alt=jsonc', function(result) {
    var items = result.data.items;
    if(items) {
      for(var i = 0; i < items.length; i++) {
        var id = hex_sha1(JSON.stringify(items[i]));
        that.searchPlaylist[id] = {
          id: id,
          metadata: {
            title: items[i].title,
            artist: '',
            duration: items[i].duration,
            album: '',
            coverart: items[i].thumbnail.hqDefault
          },
          resource: {
            type: 'youtube',
            videoId: items[i].id 
          }
        };
      }
      that.renderResult();
    }
  });
};

Q.Search.prototype.soundcloud = function(value) {
  var that = this;
  $.getJSON("http://api.soundcloud.com/tracks.json?filter=streamable&q=" + value + "&consumer_key=" + 
    this.app.scKey, function(data) {
      if(data) {
        for(var i = 0; i < data.length; i++) {
          var id = hex_sha1(JSON.stringify(data[i]));
          
          var cover = data[i].artwork_url;
          if(cover) {
            cover = cover.replace('large', 't300x300');
          }
          that.searchPlaylist[id] = {
            id: id,
            metadata: {
              title: data[i].title,
              artist: data[i].user.username,
              duration: Math.round(data[i].duration / 1000),
              album: '',
              coverart: cover
            },
            resource: {
              type: 'soundcloud',
              stream_url: data[i].stream_url
            }
          };
        }
        that.renderResult();
      }
  });
};