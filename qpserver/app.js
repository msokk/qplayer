var gsapi = require(__dirname +'/gs');
var express = require('express');

var GrooveShark = gsapi.api;
var GrooveSharkSong = gsapi.song;

var gs = new GrooveShark(function() {
  var that = this;
  console.log('GrooveShark Authenticated!');
  var app = express.createServer(); 
  
  app.get('/gs/search/:query', function(req, res){
    this.getSearchResults(req.params.query, function(result) {
      res.send(result);
    });
  });

  app.get('/gs/streamurl/:songid', function(req, res){
    new GrooveSharkSong(that, req.params.songid).getStreamURL(function(url) {
      res.send(url);
    });
  });
  
  app.listen(3000);
});