$(function() { new Q.App(); });

Q.App = function() {
  Q.Audio = new audioElem('nativePlayer');
  window.qp = new Q.Player([
    new Q.GsPlayer()
  ]);
  
  setTimeout(function() {
  
    qp.loadItem(0);
  }, 2000);

  

  this.bindMisc();
};

Q.App.prototype.bindMisc = function() {
  $('#settingsBtn').click(function() {
    $('.settingsContainer').toggleClass('show');
  });
  
        
  $('#miniBtn').click(function() {
    var width = 250;
    var height = 500;
    window.popWin = window.open('popup.html', 
      'Player', 'menubar=no,location=no,resizable=no,scrollbars=no,status=no,'
      + 'width=' + width + ',height=' + height + ',left=' + (window.outerWidth - (width+33))
      + ',top=' + (window.screen.height - window.screen.availHeight+50));
    console.log(popWin);
  });
};