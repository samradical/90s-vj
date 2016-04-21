var _ = require('lodash');
var passport = require('passport');
var request = require('request');
var flash = require('connect-flash');
var fs = require('fs');
var path = require('path');
var multiparty = require('multiparty');
var Q = require('bluebird');
var Emitter = require('../events');
var xray = require('x-ray');

var trendingTodayPlaylist = "PLbpi6ZahtOH7h9OULR1AVb4i8zo0ctwEr";
var YT = require('../services/youtube');
var SIDX = require('node-youtube-dash-sidx');
var CHANNEL_UPLOADS = 'https://www.youtube.com/channel/';

module.exports = function(express, io) {
  var spotifyAuthResponse;
  var x = new xray();

  var playlistItems = {

  };
  var nextYoutubeQuery = [];

  function chooseRandom(list) {
    var v = undefined;
    while (!v) {
      var r = Math.floor(Math.random() * list.length - 1);
      v = list[r];
    }
    return v;
  }

  function getQueudSearchTerm() {
    var q;
    if (nextYoutubeQuery.length > 0) {
      q = nextYoutubeQuery.shift();
    }
    return q;
  }

  Emitter.emitter.on('video:search', function(val) {
    nextYoutubeQuery.push(val);
  });


  express.get('/youtube/search', function(req, res) {
    YT.search(req.query.q).then(function(data) {
      res.send(data);
    });
  });

  express.get('/youtube/playlistitems', function(req, res) {
    YT.playlistItems(req.query).then(function(data) {
      res.send(JSON.parse(data.body));
    });
  });

  express.get('/youtube/video/related', function(req, res) {
    console.log("-----------------------")
    console.log(nextYoutubeQuery.length)
    console.log("-----------------------")
    var queuedTerm = getQueudSearchTerm();
    if (queuedTerm) {
      YT.search(q).then(function(data) {
        res.send(data);
      });
    } else {
      YT.videoRelated(req.query.id).then(function(data) {
        res.send(data);
      });
    }
  });

  express.get('/getNextVideo', function(req, res) {
    console.log("-----------------------")
    console.log(nextYoutubeQuery.length)
    console.log("Using this id:", req.query.id)
    console.log("-----------------------")
    var queuedTerm = getQueudSearchTerm();
    if (queuedTerm) {
      console.log(queuedTerm)
      YT.search(queuedTerm).then(function(data) {
        res.send(data);
      });
    } else if (!req.query.id) {
      YT.playlistItems(trendingTodayPlaylist)
        .then(function(data) {
          res.send(JSON.parse(data.body));
        });
    } else {
      YT.videoRelated(req.query).then(function(data) {
        res.send(JSON.parse(data.body));
      });
    }
  });

  express.get('/channelUploads', function(req, res) {
    var url = CHANNEL_UPLOADS + req.query.channelId + '/videos?sort=dd&view=0&shelf_id=0';
    //if the content text contains 'by' then it is a liked video
    console.log(url);
    x(url, '.channels-content-item', [{content:'.yt-lockup-content', img:'img@src'}])(function(err, info) {
      res.send(info);
    });
  });

  express.get('/getNextVideoFromPlaylist', function(req, res) {
    console.log("----------------------- getNextVideoFromPlaylist")
    console.log(nextYoutubeQuery.length)
    console.log("Using this id:", req.query.videoId)
    console.log("-----------------------")
    var pId = req.query.playlistId;
    if (!playlistItems[pId]) {
      YT.playlistItems(pId).then(function(data) {
        playlistItems[pId] = JSON.parse(data.body);
        res.send(playlistItems[pId].items[0]);
      });
    } else {
      var nextItem;
      var previousItem;
      _.each(playlistItems[pId].items, (item) => {
        if (previousItem) {
          if (previousItem.snippet.resourceId.videoId === req.query.videoId) {
            nextItem = item;
          }
        }
        previousItem = item;
      });
      nextItem = nextItem || playlistItems[pId].items[0];
      res.send(nextItem);
    }
  });

  express.get('/getVideoSidx', function(req, res) {
    SIDX.start(req.query).then(function(data) {
      res.send(data);
    }).catch(function(e) {
      console.log("Failed to get ",req.query, e);
      res.send({
        status: 500
      });
    });
  });

  express.post('/getVideo', function(req, res) {
    var form = new multiparty.Form();
    form.parse(req, function(err, data, files) {
      var url = data.url + '&range=' + data.byteRange;
      res.writeHead(206, {
        'Content-Range': 'bytes ' + data.byteRange + '/' + data.byteLength,
        //'Content-Range': 'bytes ' + range + '/27908',
        //'Content-Length': '27908',
        'X-Accel-Buffering': 'no',
        'Content-Length': data.byteLength,
        'Accept-Ranges': 'bytes',
        'Content-Type': 'video/mp4',
        "Access-Control-Allow-Origin": "*"
      });
      var r = request({
        url: url
      }).pipe(res);

      r.on('error', function(err) {
        console.log(err);
      });
    });
  });

  express.post('/getVideoIndex', function(req, res) {
    var form = new multiparty.Form();
    form.parse(req, function(err, data, files) {
      var url = data.url + '&range=' + data.indexRange;
      res.writeHead(206, {
        'Content-Range': 'bytes ' + data.indexRange,
        'X-Accel-Buffering': 'no',
        'Content-Length': data.indexLength,
        'Accept-Ranges': 'bytes',
        'Content-Type': 'video/mp4',
        "Access-Control-Allow-Origin": "*"
      });
      var r = request({
        url: url,
      }).pipe(res);

      r.on('error', function(err) {
        console.log(err);
      });
    });
  });
};
