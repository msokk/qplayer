
Q.Player = function(backends) {
  backends = backends || [];
  this.backends = {};
  this.currentBackend = '';
  this.currentPlaylist = [
    {
      metadata: {
        title: 'On The Road',
        artist: 'WildCookie',
        length: '',
        album: ''
      
      },
      resource: {
        type: 'grooveshark',
        songId: 29345932 
      }
    }
  ];
  
  this.currentItem = {};
  for(var i = 0; i < backends.length; i++) {
    this.registerBackend(backends[i]);
  }
  

 
  this.bindUI();
};
Q.inherit(Q.Player, Q.Event);


Q.Player.prototype.bindUI = function() {
  var that = this;
  $('#control-btns button').first().click(function() {
    that.getBackend().play();
  });
  
  $('#control-btns button').last().click(function() {
    that.getBackend().pause();
  });

};

Q.Player.prototype.registerBackend = function(backend) {
  if(typeof backend.init == 'function') {
    backend.init();
  }  
  this.backends[backend.name] = backend;
};

Q.Player.prototype.loadItem = function(index) {
  var item = this.currentItem = this.currentPlaylist[index];
  switch(item.resource.type) {
    case 'grooveshark':
      this.currentBackend = 'grooveshark';
      this.getBackend().load(item.resource.songId);
  }
};

Q.Player.prototype.loadPlaylist = function(playlist) {
  
};

Q.Player.prototype.getBackend = function() {
  return this.backends[this.currentBackend];
};


Q.Player.prototype.go = function(offset) {

};


//HTML5 audio wrapper
var audioElem = function(id) {
  this.playerIndex = 1;
  this.player1 = document.getElementById(id + '1');
  this.player2 = document.getElementById(id + '2');
};

audioElem.prototype.load = function(url, cb) {
  var player = this['player' + this.playerIndex];
  player.addEventListener('canplay', function() {
    player.removeEventListener('canplay', this, false);
    cb && cb(player);
    
  });
  player.setAttribute('src', url);
  if(this.playerIndex == 1) {
    this.playerIndex = 2;
  } else {
    this.playerIndex = 1;
  }
};

audioElem.prototype.elem = function() {
  return this['player' + this.playerIndex];
}