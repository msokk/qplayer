
var Q.Audio = function(id) {
  this.playerIndex = 1;
  this.player1 = document.getElementById(id + '1');
  this.player2 = document.getElementById(id + '2');
};

Q.Audio.prototype.load = function(url, cb) {
  if(this.playerIndex == 1) {
    this.playerIndex = 2;
  } else {
    this.playerIndex = 1;
  }
  var player = this['player' + this.playerIndex];
  player.setAttribute('src', url);
  player.addEventListener('load', function() {
    cb && cb();
  });
}; 