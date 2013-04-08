var Song = function(data) {
  this.artist = 'Unknown';
  this.title  = 'Untitled';
  this.album  = 'Unknown';
  this.source = 'local';

  jQuery.extend(this, data);
};



Song.prototype.getObjectUrl = function(cb) {
  if(this.fs) {
    this.fs.getFile(this.path, {create: false}, function(fileEntry) {
      fileEntry.file(function(file) {
        cb && cb(window.URL.createObjectURL(file));
      });
    });
  }
};
