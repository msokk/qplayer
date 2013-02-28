var LocalMusic = {};

LocalMusic.scanLibrary = function(cb) {
  this.getAudioFs(function(fs) {
    this.populateEntries([fs], function(paths) {
      this.parseTracks(fs, paths, cb);
    }.bind(this));
  }.bind(this));
};

// Get audio filesystem from Chrome Media Galleries API
LocalMusic.getAudioFs = function(cb) {
  chrome.mediaGalleries.getMediaFileSystems({ interactive : 'if_needed' }, function(filesystems) {
    filesystems.forEach(function(filesystem) {
      if(JSON.parse(filesystem.name).name === 'Music') {
        cb && cb(filesystem.root);
        return;
      }
    });
  });
};

// Recursively scan the audio filesystem
LocalMusic.populateEntries = function(entries, cb) {
  var paths = [];
  var branches = 0;

  var scan = function(entries ) {
    for(var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      if(entry.isFile) {
        paths.push(entry.fullPath);
      } else if(entry.isDirectory) {
        var reader = entry.createReader();
        reader.readEntries(scan);
        branches++;
      }
    }

    if(--branches === -1) cb && cb(paths);
  };

  scan(entries);
};

// Parse metadata from tracks
LocalMusic.parseTracks = function(fs, paths, cb) {
  var count = paths.length;
  var result = [];

  paths.forEach(function(path) {
    fs.getFile(path, {create: false}, function(fileEntry) {
      fileEntry.file(function(file) {
        ID3.loadTags({file: file, success: function(tags) {
          tags.path = path;
          result.push(new Song(tags));

          if(--count === 0) cb && cb(result);
        }});
      });
    });

  });
};


LocalMusic.scanLibrary(function(songs) {
  console.log(songs);
});
