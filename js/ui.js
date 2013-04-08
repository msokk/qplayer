Q.attachUI = function() {

  // Play pause button
  Q.on('state', function(state) {
    if(state === 'pause') {
      $('.playpause').removeClass('icon-play').addClass('icon-pause');
    } else {
      $('.playpause').addClass('icon-play').removeClass('icon-pause');
    }
  });

  $('.playpause').click(function() {
    if($(this).hasClass('icon-play')) {
      Q.trigger('state', 'pause');
    } else {
      Q.trigger('state', 'play');
    }
  });



  $('.track').click(function(e) {
    var perc = e.offsetX / $(this).width() * 100;
    $(this).find('.position').width(perc + '%');
  });

  $('.player-sidebar ul li').click(function(e) {
    $(this).addClass('selected').siblings().removeClass('selected');
  });


  var colors = ['purple', 'green', 'peach', 'yellow'];
  var idx = 0;
  $('.color').click(function() {
    $('body').toggleClass(colors[idx % colors.length]);
    idx++;
    $('body').toggleClass(colors[idx % colors.length]);
  });
};
