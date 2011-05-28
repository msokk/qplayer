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
  
  //Change name
  $('#treeview #list li').live('dblclick', function(e) {
    
    if($(this).hasClass('clicked')) {
      var oldname = $(this).html();
      var that = this;
      $(this).html('<input class="editBox" id="editPlaylist" type="text" value="'+oldname+'" /> X');
      $('#editPlaylist').select();
      var editOne = function() {
        if($('#editPlaylist').length != 0 && $('#editPlaylist').val() != oldname) {
          app.emit('UIEditPlaylist', $(that).data('id'));
        }
        $(that).html($('#editPlaylist').val());
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
  $('#treeview #list li').live('mousedown', function(e) {
    var that = this;
    var orig = e;
    var itemDrag = function(e) {
      if(Math.abs(orig.pageY - e.pageY) > 15) {
        var centerY = e.pageY - ($(that).height() / 2);
        $(that).css({ 
          'width': $(that).width(),
          'position': 'absolute',
          'top': centerY,
          'z-index': 1000
        });
      }
    };
    
    var itemRelease = function(e) {
      $(that).css({ 
        'position': '',
        'width': '',
        'top': '',
        'z-index': ''
      });
      $(document).unbind('mousemove', itemDrag);
      $(document).unbind('mouseup', itemRelease);
    };
    
    $(document).bind('mousemove', itemDrag);
    $(document).bind('mouseup', itemRelease);
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
  //Sort
  $('#tracklist tr').live('mousedown', function(e) {
    var orig = e;
    var that = $(this);
    var hasCloned = false;
    var playListid = null;
    
    //Is it on a playlist
    var playlistOver = function(e) {
      console.log(e);
    };
    
    var playlistOut = function(e) {
      console.log(e);
    };
    
    //Drag along
    var itemDrag = function(e) {
      if(Math.abs(orig.pageX - e.pageX) > 20 || Math.abs(orig.pageY - e.pageY) > 20) {
        var centerY = e.pageY - (that.height() / 2);
        var centerX = e.pageX - (that.height() / 2);
        that.css({
          'top': centerY,
          'left': centerX
        });
      }
    };
    
    //Delete on release
    var itemRelease = function(e) {
      if(hasCloned) {
        that.remove();
      }
      $(document).unbind('mousemove', itemClone);
      $(document).unbind('mousemove', itemDrag);
      $(document).unbind('mouseup', itemRelease);
      $('#treeview li').unbind('mouseover', playlistOver);
      $('#treeview li').unbind('mouseout', playlistOut);
    };
    
    //Make a duplicate
    var itemClone = function(e) {
      if(Math.abs(orig.pageX - e.pageX) > 20 || Math.abs(orig.pageY - e.pageY) > 20) {
        var centerY = e.pageY - (that.height() / 2);
        var centerX = e.pageX - (that.height() / 2);
        that = that.clone();
        that.find('td:first').prepend('<span class="plus"></span>');
        hasCloned = true;
        $('#tracklist').append(that);
        that.css({
          'position': 'absolute',
          'z-index': 1000,
          'top': centerY,
          'left': centerX
        });
        
        $('#treeview li').bind('mouseover', playlistOver);
        $('#treeview li').bind('mouseout', playlistOut);
        $(document).unbind('mousemove', itemClone);
      }
    };
    

    
    $(document).bind('mousemove', itemClone);
    $(document).bind('mousemove', itemDrag);
    $(document).bind('mouseup', itemRelease);
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
};