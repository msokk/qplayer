$('.playpause').click(function() {
  $(this).toggleClass('icon-play').toggleClass('icon-pause');
});

$('.track').click(function(e) {
  var perc = e.offsetX / $(this).width() * 100;
  $(this).find('.position').width(perc + '%');
});

var currentWin = chrome.app.window.current();


$('.close').click(function() {currentWin.close();});



// Resize window
var lastX;
var lastY;
var dragWindow = function(e) {

  if(lastX && lastY) {
    var bounds = chrome.app.window.current().getBounds();
    var deltaX = e.screenX - lastX;
    var deltaY = e.screenY - lastY;
    currentWin.moveTo(bounds.left + deltaX, bounds.top + deltaY - 22); // Always moves 22 pixels down?
  }

  lastX = e.screenX;
  lastY = e.screenY;
};

$('.player-header').mousedown(function() {
  $(window).on('mousemove', dragWindow);
});

$(window, '.player-header').mouseup(function() {
  $(window).off('mousemove', dragWindow);
  lastX = null;
  lastY = null;
});


var getAudioFs = function(cb) {
  chrome.mediaGalleries.getMediaFileSystems({ interactive : 'if_needed' }, function(filesystems) {
    filesystems.forEach(function(filesystem) {
      if(JSON.parse(filesystem.name).name === 'Music') {
        cb && cb(filesystem.root);
        return;
      }
    });
  });
};


getAudioFs(function(fs) {
  console.log(fs);
})
