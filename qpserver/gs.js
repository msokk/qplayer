var http = require('http'),
    querystring = require('querystring'),
    crypto = require('crypto');

/**
 * GrooveShark.JS for Node.JS
 * TODO: User login, Playlists
 * @constructor
 * @param {Function} ready callback
 */
var GrooveShark = function(callback) {
  var that = this;
  this.DOMAIN = 'grooveshark.com';
  this.API_DOMAIN = 'cowbell.' + this.DOMAIN;
  this.API_ENDPOINT = '/more.php';
  this.CLIENT_NAME = 'gslite';
  this.CLIENT_VERSION = '20101012.37';
  this.RANDOM_CHARS = '1234567890abcdef';
  
  this.clientUUID = this.makeUUID();
  
  this.getSessionID(function(sessid) { //Fetch Session ID
    that.sessionId = sessid;

    that.getToken(function(result) { //Fetch first Token
      that.token = result;
      callback && callback.call(that); //Session is ready
    });
  });

};    


/*******************
 * PRIVATE METHODS *
 *******************/

/**
 * Fetch PHP session ID from mainpage cookie
 * @private 
 * @param {Function} Callback with ID
 */
GrooveShark.prototype.getSessionID = function(cb) {
  var gsCookie = global.gsCookie || '{}';
  if(gsCookie.timestamp && (new Date().getTime() - gsCookie.timestamp) < (86400 * 6)) {
    cb && cb(gsCookie.value);
  } else {
    http.get({
      host: this.DOMAIN,
      port: 80,
      path: '/'
    }, function(res) {
      var cookies = res.headers['set-cookie'];
      var sessID = querystring.parse(cookies[0], ';');
      global.gsCookie = { 
        timestamp: new Date().getTime(),
        value: sessID['PHPSESSID']
      };
      cb && cb(sessID['PHPSESSID']);
    });
  }
};


/**
 * Generates secret key from session md5
 * @private
 * @param {String} Session ID
 * @returns {String} Secret Key
 */
GrooveShark.prototype.makeSecretKey = function(session) {
  var md5 = crypto.createHash('md5');
  md5.update(session);
  return md5.digest('hex');
};


/**
 * RFC Standard implementation of UUID
 * @private
 * @returns {String} UUID
 */
GrooveShark.prototype.makeUUID = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  .replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  }).toUpperCase();
};


/**
 * Generates request token
 * @private
 * @param {String} API Method
 * @returns {String} Request Token 
 */
GrooveShark.prototype.generateToken = function(method, cb) {
  var randomChars = '';
  while(6 > randomChars.length) {
    var index = Math.floor(Math.random()*this.RANDOM_CHARS.length);
    randomChars = randomChars + this.RANDOM_CHARS[index];
  }
  
  var sha1 = crypto.createHash('sha1');
  sha1.update(method + ':' + this.token + ':quitStealinMahShit:' + randomChars);
  cb && cb(randomChars + sha1.digest('hex'));
};


/**
 * Fetches communication token
 * @private
 * @param {Function} Callback with comm token
 */
GrooveShark.prototype.getToken = function(cb) {
  this.makeRequest({ 'secretKey': this.makeSecretKey(this.sessionId) },
    'getCommunicationToken', 'token', function(data) {
    cb && cb(data['result']);
  });
};


/**
 * Makes requests to API
 * @private
 * @param {Object} Params to send
 * @param {String} API Method
 * @param {String} Request type (used for comm. token)
 * @param {Function} Callback JSON Data
 */
GrooveShark.prototype.makeRequest = function(params, method, type, callback) {
  var options = {
    host: this.API_DOMAIN,
    port: 80,
    path: this.API_ENDPOINT,
    method: 'POST'
  };
  
  var postData = {
    "header": {
      "client": this.CLIENT_NAME,
      "clientRevision": this.CLIENT_VERSION,
      "uuid": this.clientUUID,
      "session": this.sessionId
    },
    "country": { 
      "IPR":"1021", 
      "ID":"223", 
      "CC1":"0", 
      "CC2":"0", 
      "CC3":"0", 
      "CC4":"2147483648" 
    },
    "privacy": 1,
    "parameters": params,
    "method": method
  };

  var request = function() {
    var req = http.request(options, function(res) {

      res.setEncoding('utf8');
      var buffer = '';
      res.on('data', function(chunk) {
        buffer += chunk;
      });
      
      res.on('end', function() {
        callback && callback(JSON.parse(buffer));
      });
    });
    var jsonData = JSON.stringify(postData);
    
    req.setHeader('Content-Length', jsonData.length);
    req.setHeader('Content-Type', 'application/json');
    req.setHeader('User-Agent', 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; '
        +'rv:1.9.2.12) Gecko/20101026 Firefox/3.6.12 (.NET CLR 3.5.30729)');
    req.setHeader('Referer', 'http://listen.grooveshark.com/main.swf?cowbell=fe87233106a6cef919a1294fb2c3c05f');


    req.write(jsonData);
    req.end();
  };
  if(type != 'token') {
    this.generateToken(method, function(token) {
      postData["header"]["token"] = token;
      request();
    });
  } else {
    request();
  }
};


/******************
 * PUBLIC METHODS *
 ******************/

/**
 * Queries the API
 * @public
 * @param {Object} Params to send
 * @param {String} API Method
 * @param {Function} Callback JSON Data
 */
GrooveShark.prototype.Query = function(params, method, callback) {
  this.makeRequest(params, method, '', callback);
};


/**
 * Get 500 most popular songs
 * @public
 * @param {Function} Callback JSON Data
 */
GrooveShark.prototype.getPopularSongs = function(callback) {
  this.Query({}, 'popularGetSongs', function(data) {
    var songs = data['result']['Songs'];
    callback && callback(songs, songs.length);
  });
};


/**
 * Search with freetext
 * @public
 * @param {String} Querystring
 * @param {String} Search type (defaults to Songs)
 * @param {Function} Callback JSON Data
 */
GrooveShark.prototype.getSearchResults = function(query, type, callback) {
  type = type || 'Songs';
  if(typeof type == 'function') {
    callback = type;
    type = 'Songs';
  }

  this.Query({ "query": query, "type": type },
    'getSearchResultsEx', function(data) {
    callback(data['result']['result']);
  });
};

/**
 * END OF GrooveShark
 */

 
/**
 * GrooveShark Song object
 * @param {GrooveShark} API object
 * @param {String} SongId
 * @constructor
 */
var GrooveSharkSong = function(api, songid) {
  this.api = api;
  this.songId = songid;
  this.details = 'inactive';
};


/**
 * Fetches stream details (stored in object)
 * @public
 * @param {Function} Callback with details
 */
GrooveSharkSong.prototype.getStreamDetails = function(cb) {
  var that = this;
  this.details = 'active';
  this.api.Query({
    "songID": this.songId,
    "prefetch": false,
    "mobile": false,
    "country": {"IPR":"1021","ID":"223", "CC1":"0", "CC2":"0", "CC3":"0", "CC4":"2147483648"}
  }, 'getStreamKeyFromSongIDEx', function(data) {
    that.lastStreamKey = data['result']['streamKey'];
    that.lastStreamServer = data['result']['ip'];
    that.lastStreamServerID = data['result']['streamServerID'];
    that.details = 'done';
    cb && cb(that.lastStreamKey, that.lastStreamServer, that.lastStreamServerID);
  });
};


/**
 * Constructs stream URL (fetches details if needed)
 * @public
 * @param {Function} Callback with URL
 */
GrooveSharkSong.prototype.getStreamURL = function(callback) {
  var that = this;
  if(this.details != 'done') {
    this.getStreamDetails(function() {
      that.getStreamURL(callback);
    });
  } else {
    callback && callback('http://' + that.lastStreamServer 
      + '/stream.php?streamKey=' + that.lastStreamKey);
  }
};

exports.api = GrooveShark;
exports.song = GrooveSharkSong;