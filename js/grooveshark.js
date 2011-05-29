/**
 * GrooveShark.JS for Google Chrome (atm)
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
 * TODO: Remove jQuery dependency (easy) 
 *       and chrome cookie dependency (hard)
 * @private 
 * @param {Function} Callback with ID
 */
GrooveShark.prototype.getSessionID = function(cb) {
  var gsCookie = JSON.parse(window.localStorage.getItem('gsCookie') || '{}');
  if(gsCookie.timestamp && (new Date().getTime() - gsCookie.timestamp) < (86400 * 6)) {
    cb && cb(gsCookie.value);
  } else {
    $.get('http://' + this.DOMAIN + '/', function() {
      chrome.cookies.get({
        name: 'PHPSESSID',
        url: 'http://grooveshark.com'
      }, function(cookie){
        window.localStorage.setItem('gsCookie', JSON.stringify({ 
          timestamp: new Date().getTime(),
          value: cookie.value
        }));
        cb && cb(cookie.value);
      });  
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
  return hex_md5(session);
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
GrooveShark.prototype.generateToken = function(method) {
  var RANDOM_CHARS = '1234567890abcdef';
  var randomChars = '';
  while(6 > randomChars.length) {
    var index = Math.floor(Math.random()*RANDOM_CHARS.length);
    randomChars = randomChars + RANDOM_CHARS[index];
  }
  
  var digest = hex_sha1(method + ':' + this.token + ':quitStealinMahShit:' + randomChars);
  return randomChars + digest;
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
  var that = this;

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
  
  if(type != 'token') {
    postData["header"]["token"] = this.generateToken(method);
  }

  var jsonData = JSON.stringify(postData);
  
  var req = new XMLHttpRequest();
  req.open('POST', 'http://' + that.API_DOMAIN + that.API_ENDPOINT, true);
  req.setRequestHeader('Content-Type', 'application/json');
  req.onreadystatechange = function() {
    if (req.readyState == 4 && req.status == 200) {
      callback && callback(JSON.parse(req.responseText));
    }
  };
  req.send(jsonData);
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