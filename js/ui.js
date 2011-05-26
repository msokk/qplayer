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
  this.app.emit('UIVolume', volume);
};

/**
 * Bind settings
 * @param {Q.App} QPlayer
 */
Q.UISettings = function(app) {
  //Settings dialog
  $('#settingsBtn').click(function() {
    $('.settingsContainer').toggleClass('show');
    setTimeout(function() {
      $('#container').one('click', function() {
        $('.settingsContainer').toggleClass('show');
      });
    }, 1000);
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
 * Bind generic small objects
 * @param {Q.App} QPlayer
 */
Q.UIGeneric = function(app) {
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
  
  //Shuffle - Repeat buttons
  $('#shuffle').click(function() {
    $(this).toggleClass('active');
    if($(this).hasClass('active')) {
      app.emit('UIPlayback', 'shuffleOn');
    } else {
      app.emit('UIPlayback', 'shuffleOff');
    }
  });
  
  $('#repeat').click(function() {
    $(this).toggleClass('active');
    if($(this).hasClass('active')) {
      app.emit('UIPlayback', 'repeatOn');
    } else {
      app.emit('UIPlayback', 'repeatOff');
    }
  });
};