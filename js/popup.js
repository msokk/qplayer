$(function() {
  var accent = Q.Storage.get('accent') || 'blue';
  $('#accent').attr('href', 'css/accents/' + accent + '.css');

  var socket = new io.Socket('qp.sokk.ee', { port: '3000' });

  var playFlag = false;
  $('#playBtn').click(function() {
    if(playFlag) {
      playFlag = false;
      socket.send({ type: 'UIPlayback', state: 'play' });
    } else {
      playFlag = true;
      socket.send({ type: 'UIPlayback', state: 'pause' });
    }
  });
});
