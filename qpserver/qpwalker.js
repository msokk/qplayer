var fs = require('fs'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
    musicmetadata = require('musicmetadata');

/**
 * Gathers song data
 * @param {String} Scan Path
 */
QPWalker = function(path) {
  EventEmitter.call(this);
  this.root = path;
  if(path[path.length-1] != '/') {
    path += '/';
  }
  this.walk(path);
};
util.inherits(QPWalker, EventEmitter);


/**
 * Directory walker
 * @param {
 */
QPWalker.prototype.walk = function(path) {
  var that = this;
  if(path) {
    fs.readdir(path, function(err, files) {
      if(files) {
        for(var i = 0; i < files.length; i++) {
          that.checkType(path, files[i]);
        }
      }
    });
  }
};

QPWalker.prototype.checkType = function(path, filename) {
  var that = this;
  if(path[path.length-1] != '/') {
    path += '/';
  }
  var newPath = path + filename;
  fs.stat(newPath, function(err, stats) {
    if(stats && stats.isDirectory()) {
      that.walk(newPath);
    } else if(stats && stats.isFile()) {
      if(newPath.substr(-3, 3) == 'mp3') {
        that.readSong(newPath);
      }
    }
  });
};


QPWalker.prototype.readSong = function(filepath) {
  var that = this;
  var parser = new musicmetadata(fs.createReadStream(filepath));
  parser.on('metadata', function(result) {
  delete result.picture;
  result.url = filepath.substr(that.root.length);
  console.log(result);
});
};

module.exports = QPWalker;
