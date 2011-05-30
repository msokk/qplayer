/**
 * Bind volumebar handler
 * @param {Q.App} QPlayer
 */
Q.UIVolume = function(app) {
  var that = this;
  if(!(this instanceof Q.UIVolume)) {
    return new Q.UIVolume(app);
  }
  
  this.app = app;
  app.ui.volume = this;
  this.elem = $('#volume-bar > .track:first-child');
  
  var volumeDrag = function(e) {
    var offsetX = e.screenX - that.elem.position().left;
    var perc = Math.ceil(((offsetX+5) / that.elem.width()) * 100);
      
    if(perc >= 100) {
      perc = 100;
    }
    
    if(perc <= 10) {
      perc = 10;
    }
    $('#volume-icon').css('opacity', perc/100);
    that.elem.find('.done').css('width', perc + '%');
    that.app.emit('UIVolume', Math.ceil((perc*1.1) - 11));
  };
  
  var volumeUp = function(e) {
    $('body').unbind('mousemove', volumeDrag);
    $('body').unbind('mouseup', volumeUp);
    volumeDrag(e);
  };
  
  this.elem.mousedown(function(e) {
    $('body').bind('mousemove', volumeDrag);
    $('body').bind('mouseup', volumeUp);
  });
  
  this.elem.mouseup(volumeUp);
};

/**
 * Set UIVolume value
 * @param {Number} Volume
 */
Q.UIVolume.prototype.setVolume = function(volume) {
  var perc = Math.floor((volume + 11)/1.1);
  if(perc >= 100) {
    perc = 100;
  }
  
  if(perc <= 10) {
    perc = 10;
  }
  this.elem.find('.done').css('width', perc + '%');
  $('#volume-icon').css('opacity', perc/100);
  this.app.emit('UIVolume', volume);
};

/**
 * Bind settings
 * @param {Q.App} QPlayer
 */
Q.UISettings = function(app) {
  //Settings dialog
  $('#settingsBtn').click(function(e) {
    $('.settingsContainer').toggleClass('show');
    e.stopPropagation();
    $('#container').one('click', function() {
      $('.settingsContainer').removeClass('show');
    });
  });
  
  //Accent selection
  var accent = Q.Storage.get('accent') || 'blue';
  $('#accentSelection').val(accent);
  $('#accentSelection').change(function(e) {
    $('#accent').attr('href', 'css/accents/' + $(this).val() + '.css');
    Q.Storage.set('accent', $(this).val());
  });
  
  $('#accentSelection').change();
  
  //Settings flush
  $('#resetAppBtn').click(function(e) {
    if(confirm('This clears everything - playlists, songs, accounts! Are you sure?')) {
      window.localStorage.clear();
      window.location.href = '';
    }
  });
};

/**
 * Bind seekbar
 * @param {Q.App} QPlayer
 */
Q.UISeekbar = function(app) {
  var that = this;
  if(!(this instanceof Q.UISeekbar)) {
    return new Q.UISeekbar(app);
  }
  this.app = app;
  app.ui.seekbar = this;
  this.elem = $('#seek-bar > .track:first-child');
  
  var seekDrag = function(e) {
    var offsetX = e.screenX - that.elem.position().left;
    var perc = Math.round( ( (offsetX+5) / that.elem.width()) * 100000)/1000;
    if(perc >= 100) {
      perc = 100;
    }
  
    if(perc <= 0) {
      perc = 0;
    } 
      
    that.setProgress(perc);
    that.app.emit('UISeek', perc);
  };
  
  var seekUp = function(e) {
    $('body').unbind('mousemove', seekDrag);
    $('body').unbind('mouseup', seekUp);
    seekDrag(e);
  };
  
  this.elem.mousedown(function(e) {
    $('body').bind('mousemove', seekDrag);
    $('body').bind('mouseup', seekUp);
  });
  
  this.elem.mouseup(seekUp);
};

/**
 * Set seekbar value
 * @param {Number} Percent
 */
Q.UISeekbar.prototype.setProgress = function(perc) {
  if(perc >= 100) {
    perc = 100;
  }
  
  if(perc <= 0) {
    perc = 0;
  }
  this.elem.find('.done').css('width', perc + '%'); 
};

/**
 * Bind playlist
 * @param {Q.App} QPlayer
 */
Q.UIPlaylist = function(app) {
  //New playlist
  $('#treeview .new').live('click', function() {
    $(this).html('+ <input class="editBox" id="newPlaylist" type="text" value="New Playlist" />');
    $('#newPlaylist').select();
    
    var newOne = function() {
      if($('#newPlaylist').length != 0 && $('#newPlaylist').val() != 'New Playlist') {
        $('#treeview #list').append('<li>' + $('#newPlaylist').val() + '</li>');
        app.emit('UINewPlaylist', $('#treeview #list li:last-child'));
      }
      
      $('#treeview .new').html('+ New Playlist');
    };
    
    $('#newPlaylist').blur(newOne);
    $('#newPlaylist').keypress(function(e) {
      if(e.charCode == 13) {
        newOne();
      }
    });
  });
  
  //Select playlist
  $('#treeview #list li').live('click', function() {
    if(!$(this).hasClass('clicked')) {
      $('#treeview li').removeClass('clicked');
      $(this).toggleClass('clicked');
      app.emit('UIViewPlaylist', $(this).data('id'));
    }
  });
  
  //Change name and delete
  $('#treeview #list li').live('dblclick', function(e) {
    
    if($(this).hasClass('clicked')) {
      var oldname = $(this).html();
      var that = this;
      $(this).html('<input class="editBox" id="editPlaylist" type="text" value="'+oldname+'" />');
      $('#editPlaylist').select();
      var editOne = function() {
        if($('#editPlaylist').length != 0 && $('#editPlaylist').val() != oldname) {
          if($('#editPlaylist').val() == '') {
            if(confirm('Delete?')) {
              app.emit('UIDeletePlaylist', $(that).data('id'));
              $(that).remove();
            } else {
              $(that).html(oldname);
            }
          } else {
            $(that).html($('#editPlaylist').val());
            app.emit('UIEditPlaylist', $(that).data('id'));
          }
        } else {
          $(that).html($('#editPlaylist').val());
        }
      };
      
      $('#editPlaylist').blur(editOne);
      $('#editPlaylist').keypress(function(e) {
        if(e.charCode == 13) {
          editOne();
        }
      });
      
      $('#editPlaylist').dblclick(function(e) {
        e.stopPropagation();
      });
    }
  });
  
  //Sort
  $('#treeview #list').sortable({ 
    opacity: 0.6,
    axis: 'y',
    delay: 200,
    containment: '#treeview'
  });
    
  //Activate playlist
  app.ui.activatePlaylist = function(id) {
    var elem = $('li[data-id="'+id+'"]');
    $('#treeview li').removeClass('selected');
    elem.removeClass('clicked');
    elem.addClass('selected');
  }
};

/**
 * Bind tracklist
 * @param {Q.App} QPlayer
 */
Q.UITracklist = function(app) {
  $('#tracklist').sortable({ 
    opacity: 0.6,
    delay: 200
  });
  
  app.ui.attachDrop = function() {
    $('#treeview #list li').droppable({
      drop: function(e) {
        var songId = $(e.srcElement).parent().data('id');
        var playlistId = $(e.target).data('id');
        app.emit('UISongToPlaylist', playlistId, songId);
      },
      tolerance: 'pointer',
      hoverClass: 'addnew',
      accept: 'tr'
    });
  };
  app.ui.attachDrop();
  
  //Click
  $('#tracklist tr').live('click', function() {
    $('#tracklist tr').removeClass('clicked');
    $(this).addClass('clicked');
  });
  
  //Play song
  $('#tracklist tr').live('dblclick', function() {
    $('#tracklist tr').removeClass('clicked')
                      .removeClass('selected');
    $(this).addClass('selected').addClass('clicked');
    app.emit('UISelectSong', $(this).data('id'));
  });
  
  app.ui.selectSong = function(id) {
    var elem = $('#tracklist tr[data-id='+id+']');
    $('#tracklist tr').removeClass('selected');
    elem.addClass('selected');
  };
  
  $(window).keydown(function(e) {
    var activeElem = $('#tracklist tr.clicked');
    if(activeElem.length == 1 && $('*:focus').length == 0) {
      //Enter
      if(e.which == 13) {
        $('#tracklist tr').removeClass('clicked')
                          .removeClass('selected');
        activeElem.addClass('selected').addClass('clicked');
        app.emit('UISelectSong', activeElem.data('id'));
      }
      
      //Up
      if(e.which == 38 && activeElem.prev().length != 0) {
        e.preventDefault();
        activeElem.removeClass('clicked');
        activeElem.prev().addClass('clicked');
        $('#content-main').scrollTop(activeElem.position().top);
      }
      
      //Down
      if(e.which == 40 && activeElem.next().length != 0) {
        e.preventDefault();
        activeElem.removeClass('clicked');
        activeElem.next().addClass('clicked');
        $('#content-main').scrollTop(activeElem.position().top);
      }
      
      //Delete
      if(e.which == 46) {
        app.emit('UIDeleteSong', activeElem.data('id'));
        activeElem.next().addClass('clicked');
        activeElem.remove();
      }
    }
  });

};

/**
 * Bind playback
 * @param {Q.App} QPlayer
 */
Q.UIPlayback = function(app) {
  //Play-Pause button
  $('#playBtn').click(function() {
    $(this).toggleClass('pause');
    if($(this).hasClass('pause')) {
      app.emit('UIPlayback', 'play');
    } else {
      app.emit('UIPlayback', 'pause');
    }
    
  });
  
  app.ui.togglePlayButton = function() {
    $('#playBtn').toggleClass('pause');
  };
  
  //Previous song
  $('#prevBtn').click(function() {
    app.emit('UIPlayback', 'prev');
  });
  
  //Next song
  $('#nextBtn').click(function() {
    app.emit('UIPlayback', 'next');
  });
  
  //Shuffle
  $('#shuffle').click(function() {
    $(this).toggleClass('active');
    if($(this).hasClass('active')) {
      app.emit('UIPlayback', 'shuffleOn');
    } else {
      app.emit('UIPlayback', 'shuffleOff');
    }
  });
  
  //Repeat
  $('#repeat').click(function() {
    $(this).toggleClass('active');
    if($(this).hasClass('active')) {
      app.emit('UIPlayback', 'repeatOn');
    } else {
      app.emit('UIPlayback', 'repeatOff');
    }
  });
};

/**
 * Bind search bar
 * @param {Q.App} QPlayer
 */
Q.UISearch = function(app) {
  
  //Grooveshark filter
  $('#gsBtn').click(function() {
    $(this).toggleClass('gs-active');
    $(this).toggleClass('gs-disabled');
    if($(this).hasClass('gs-active')) {
      app.emit('UISearchFilter', { grooveshark: true });
    } else {
      app.emit('UISearchFilter', { grooveshark: false });
    }
  });
  
  //Youtube filter
  $('#ytBtn').click(function() {
    $(this).toggleClass('yt-active');
    $(this).toggleClass('yt-disabled');
    if($(this).hasClass('yt-active')) {
      app.emit('UISearchFilter', { youtube: true });
    } else {
      app.emit('UISearchFilter', { youtube: false });
    }
  });
  
  //Soundcloud filter
  $('#scBtn').click(function() {
    $(this).toggleClass('sc-active');
    $(this).toggleClass('sc-disabled');
    if($(this).hasClass('sc-active')) {
      app.emit('UISearchFilter', { soundcloud: true });
    } else {
      app.emit('UISearchFilter', { soundcloud: false });
    }
  });
  
  var filterMap = app.ui.filterMap = {
    'soundcloud': 'sc',
    'youtube': 'yt',
    'grooveshark': 'gs'
  };
  
  app.ui.setFilters = function(obj) {
    var keys = Object.keys(obj);
    for(var i = 0; i < keys.length; i++) {
      var shrt = filterMap[keys[i]];
      if(obj[keys[i]]) {
        $('#'+shrt+'Btn').addClass(shrt+'-active')
           .removeClass(shrt+'-disabled');
      } else {
        $('#'+shrt+'Btn').removeClass(shrt+'-active')
           .addClass(shrt+'-disabled');
      }
    };
  };
  
  //Search input
  var search = function() {
    if($('#searchBox').val() != "") {
      app.emit('UISearchValue', $('#searchBox').val());
    }
  }
  
  $('#searchBox').keypress(function(e) {
    if(e.which == 13) {
      search();
    }
  });
  $('#searchBtn').click(search);
  
  //Indicator
  app.ui.setSearchStatus = function(ongoing) {
    if(ongoing) {
      $('#searchBox').addClass('ongoing');
    } else {
      $('#searchBox').removeClass('ongoing');
    }
  }
};

/**
 * Bind generic small objects
 * @param {Q.App} QPlayer
 */
Q.UIGeneric = function(app) {

  //Popup window
  $('#miniBtn').click(function() {
    var width = 250;
    var height = 500;
    app.popup = window.open('popup.html', 
      'Player', 'menubar=no,location=no,resizable=no,scrollbars=no,status=no,'
      + 'width=' + width + ',height=' + height + ',left=' + (window.outerWidth - (width+33))
      + ',top=' + (window.screen.height - window.screen.availHeight+55));
  });
  
  app.ui.setStatus = function(ready) {
    if(ready) {
      $('#status').addClass('ready');
    } else {
      $('#status').removeClass('ready');
    }
  };
  
  app.ui.setMetadata = function(metadata) {
    console.log(metadata);
    if(metadata.title.indexOf(metadata.artist) == -1) {
      metadata.title = metadata.artist + ' - ' + metadata.title;
    }    
    $('#tracktitle').html(metadata.title);
    $('#albumtitle').html(metadata.album);
    if(metadata.coverart) {
      $('#albumart').css('background', 'url('+metadata.coverart+') no-repeat center center');
    } else {
      $('#albumart').css('background', 'url(../img/disc.png) no-repeat center center');
    }
  };
};