var Song = function(data) {
  this.artist = 'Unknown';
  this.title  = 'Untitled';
  this.album  = 'Unknown';
  this.source = 'local';

  jQuery.extend(this, data);
};

