var Q = require('bluebird');
var request = require('request');
var _ = require('lodash');
var rq = Q.promisify(request);

var YT_KEY = "AIzaSyCebfDVAnfQw4wocPjNo7Czwndt7z9ArvA";


module.exports = (function() {
  function search(q) {

    var params = {
      part: 'snippet',
      q: q,
      videoDuration: 'any',
      maxResults: 50,
      type: 'video',
      safeSearch: 'none',
      key: YT_KEY
    };

    return rq({
      url: 'https://www.googleapis.com/youtube/v3/search',
      qs: params
    });
  }

  function video(options) {
    var id = options.id;

    var params = {
      part: 'snippet',
      maxResults:50,
      safeSearch:'none',
      key: YT_KEY
    };

    var qs = _.assign({}, params, options);
    console.log(qs);
    return rq({
      url: 'https://www.googleapis.com/youtube/v3/videos',
      qs: qs
    });
  }

  function videoRelated(options) {
    var id = options.id;

    delete options.id;

    var params = {
      part: 'snippet',
      relatedToVideoId: id,
      videoDuration: 'any',
      maxResults: 50,
      type: 'video',
      safeSearch: 'none',
      key: YT_KEY
    };

    var qs = _.assign({}, params, options);
    console.log(qs);
    return rq({
      url: 'https://www.googleapis.com/youtube/v3/search',
      qs: qs
    });

  }

   function commentThread(id) {

    var params = {
      part: 'snippet',
      videoId: id,
      videoDuration: 'any',
      maxResults: 100,
      type: 'video',
      safeSearch: 'none',
      key: YT_KEY
    };

    return rq({
      url: 'https://www.googleapis.com/youtube/v3/commentThreads',
      qs: params
    });
  }

  /*"contentDetails": {
    "relatedPlaylists": {
     "uploads": "UUuXBZauLea9yLDnJ7L6iVJg"
    },
    "googlePlusUserId": "100154776634307706201"
   }*/

  function channel(id) {

    var params = {
      part: 'contentDetails',
      id: id,
      videoDuration: 'any',
      maxResults: 50,
      safeSearch: 'none',
      key: YT_KEY
    };

    return rq({
      url: 'https://www.googleapis.com/youtube/v3/channels',
      qs: params
    });
  }

  function playlistItems(options) {
    var params = _.assign({}, {
      part: 'snippet',
      videoDuration: 'any',
      maxResults: 50,
      type: 'video',
      safeSearch: 'none',
      key: YT_KEY
    }, options)

    return rq({
      url: 'https://www.googleapis.com/youtube/v3/playlistItems',
      qs: params
    });

  }

  return {
    search: search,
    video: video,
    videoRelated: videoRelated,
    commentThread: commentThread,
    channel: channel,
    playlistItems: playlistItems
  }
})();
