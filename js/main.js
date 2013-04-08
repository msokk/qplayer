Q.Player = new Player();
Q.attachUI();

Q.on('emitter.event', function(event, arg1) {
  console.log('DEBUG: ', event, arg1);
});


LocalMusic.scanLibrary(function(songs) {

  songs.forEach(function(song) {
    song.getObjectUrl(function(url) {
      $('.player-list ul').append(
        '<li>' + song.artist + ' - ' + song.title +'<br><audio controls src="' + url + '" /></li>');
    });
  });
});
