var _ = require('lodash');
var passport = require('passport');
var request = require('request');
var flash = require('connect-flash');
var fs = require('fs');
var path = require('path');
var querystring = require('querystring');

var ROUTES = function(express, _Io) {
  var spotifyAuthResponse;


  //*********************
  //AUTH
  //*********************


  /*-------------------*/
  //YOUTUBE
  /*-------------------*/
  express.get('/auth/youtube', passport.authenticate('youtube'),
    function(req, res) {});

  express.get('/auth/youtube/callback', function(req, res) {

    console.log("----------------------------------------");
    console.log(req.query);
    var code = req.query.code;
    var redirectUri =process.env.EXPRESS_HOST + "/auth/youtube/callback";
    var formData = {
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri
    };
    var form = {

    };
    var clientUri = process.env.CLIENT_HOST;
    console.log(clientUri);
    var r = request.post({
      url: 'https://accounts.google.com/o/oauth2/token',
      formData: formData
    }, function optionalCallback(err, httpResponse, body) {
      console.log(body)
       res.redirect(clientUri +
         querystring.stringify(JSON.parse(body)));
    });
  });

  /*-------------------*/
//SPOTIFY
/*-------------------*/

express.get('/auth/spotify',
  passport.authenticate('spotify'),
  function(req, res) {
    // The request will be redirected to spotify for authentication, so this
    // function will not be called.
  });

express.get('/auth/spotify/callback', function(req, res) {
  console.log(req.query);
  var code = req.query.code;
  var encodedSecret = new Buffer(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64");
  var formData = {
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
  };
  var qs = {
    grant_type: "authorization_code",
    code: code,
    redirect_uri:  process.env.EXPRESS_HOST + "/auth/spotify/callback"
  };
  var r = request.post({
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'AUthorization': 'Basic ' + encodedSecret
    },
    qs: qs
  }, function optionalCallback(err, httpResponse, body) {
    console.log(body);
    res.redirect("http://" + process.env.CLIENT_HOST + ":" + process.env.CLIENT_PORT + "/auth/spotify/callback?" +
      querystring.stringify(JSON.parse(body)));
  });
});
};

module.exports = ROUTES;
