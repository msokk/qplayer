var io = require('socket.io'),
    express = require('express'),
    QPWalker = require(__dirname + '/qpwalker'),
    gsapi = require(__dirname + '/gs');

var GrooveShark = gsapi.api;
var GrooveSharkSong = gsapi.song;


if(process.argv[2]) {
  var walker = new QPWalker(process.argv[2]);
  walker.on('done', function() {
    process.exit();
  });
  return;
}


var gs = new GrooveShark(function() {
  var that = this;
  console.log('GrooveShark Authenticated!');
  var app = express.createServer(); 
  
  app.get('/gs/search/:query', function(req, res){
    that.getSearchResults(req.params.query, function(result) {
      res.send(result);
    });
  });

  app.get('/gs/streamurl/:songid', function(req, res){
    new GrooveSharkSong(that, req.params.songid).getStreamURL(function(url) {
      res.send(url);
    });
  });
  
  app.listen(3000);
  
  var socket = io.listen(app);
  
  socket.on('connection', function(client){
    client.on('message', function(data){
      client.broadcast(data);
    });
  });
});
