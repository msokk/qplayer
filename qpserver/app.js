var gsapi = require('gs');
var GrooveShark = gsapi.api;
var GrooveSharkSong = gsapi.song;


var gs = new GrooveShark(function() {
  var that = this;
  console.log('GrooveShark Authenticated!');
  
  
  var song = null;
  this.getSearchResults('wildcookie heroine', function(result) {
    console.log(result)
    song = new GrooveSharkSong(that, result[0].SongID);

    song.getStreamURL(function(url) {
      console.log(url);
    });
  });
  this.getSearchResults('jamie woon', function(result) {
    console.log(result)
  });    
});