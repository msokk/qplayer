/**
  Boot the application
*/
chrome.app.runtime.onLaunched.addListener(function(data) {

    chrome.app.window.create('index.html', {
      id: "qplayer_main",
      width: 800, height: 600,
      frame: 'none', singleton: true
    }, function(appWin) {
      console.debug("qPlayer: window created!");
    });
});
