$(function() {
  var accent = Q.Storage.get('accent') || 'blue';
  $('#accent').attr('href', 'css/accents/' + accent + '.css');
});

