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
};
Q.inherit(Q.App, Q.Event);

Q.App.prototype.initUI = function() {
  Q.UISettings(this); //Settings btn, tab
  Q.UIVolume(this); //Volume bar
  Q.UISeekbar(this); //Seek bar
  Q.UIGeneric(this); //Generic
  
        
  $('#miniBtn').click(function() {
    var width = 250;
    var height = 500;
    window.popWin = window.open('popup.html', 
      'Player', 'menubar=no,location=no,resizable=no,scrollbars=no,status=no,'
      + 'width=' + width + ',height=' + height + ',left=' + (window.outerWidth - (width+33))
      + ',top=' + (window.screen.height - window.screen.availHeight+55));
    console.log(popWin);
  });
  
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
  
  $('#treeview .new').click(function() {
    $(this).html('+ <input id="newPlaylist" type="text" value="New Playlist" />');
    $('#newPlaylist').select();
    $('#newPlaylist').blur(function() {
      $('#treeview .new').html('+ New Playlist');
    });
  });
  
  $('#treeview li').click(function() {
    $('#treeview li').removeClass('clicked');
    $(this).toggleClass('clicked');
  });
  
  $('#treeview li').dblclick(function() {
    $('#treeview li').removeClass('selected');
    $(this).removeClass('clicked');
    $(this).toggleClass('selected');
  });

};