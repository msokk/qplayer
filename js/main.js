$('.playpause').click(function() {
  $(this).toggleClass('icon-play').toggleClass('icon-pause');
});

$('.track').click(function(e) {
  var perc = e.offsetX / $(this).width() * 100;
  $(this).find('.position').width(perc + '%');
});

var colors = ['purple', 'green', 'peach', 'yellow'];
var idx = 0;
$('.color').click(function() {
  $('body').toggleClass(colors[idx % colors.length]);
  idx++;
  $('body').toggleClass(colors[idx % colors.length]);
});

