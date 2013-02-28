// Move window
(function() {

  var currentWin = chrome.app.window.current();
  var lastX = null;
  var lastY = null;

  var dragWindow = function(e) {

    if(lastX && lastY) {
      var bounds = currentWin.getBounds();
      var deltaX = e.screenX - lastX;
      var deltaY = e.screenY - lastY;
      currentWin.moveTo(bounds.left + deltaX, bounds.top + deltaY - 22); // HACK: Always moves 22 pixels down?
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

  // Close the window
  $('.close').click(function() {currentWin.hide();});

})();
