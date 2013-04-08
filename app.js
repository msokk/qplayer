/**
  Boot the application
*/

var playerWin;

chrome.app.runtime.onLaunched.addListener(function(data) {
    if(playerWin) return;
    playerWin = chrome.app.window.create('index.html', {
      id: "qplayer_main",
      width: 960, height: 800,
      frame: 'none', singleton: true
    }, function(appWin) {
      console.debug("qPlayer: window created!");
    });
});

chrome.runtime.onSuspend.addListener(function() {
  console.log("qPlayer: suspending app!");
});

chrome.runtime.onInstalled.addListener(function() {
  console.log("qPlayer: first install!");
});
