chrome.app.runtime.onLaunched.addListener(function(data) {
    chrome.app.window.create('index.html', {width: 800, height: 600, frame: 'none'});
    console.debug("Squareplayer launched!");
});
