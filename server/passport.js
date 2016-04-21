// config/passport.js

// load all the things we need
var YoutubeStrategy = require('passport-youtube-v3').Strategy;
var SpotifyStrategy = require('passport-spotify').Strategy;

// load up the user model
var User = require('./user');
var _ = require('lodash');

// expose this function to our app using module.exports
module.exports = function(passport) {


  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });


  passport.use(new YoutubeStrategy({
      clientID: process.env.YOUTUBE_CLIENT_ID,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
      callbackURL: process.env.EXPRESS_HOST + "/auth/youtube/callback",
      scope: ['https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.force-ssl'
      ]
    },
    function(accessToken, refreshToken, profile, done) {
      var resp = {
        access_token: accessToken,
        refresh_token: refreshToken,
        profile: profile
      };
      console.log(resp);
      return done(null, resp);
    }
  ));

  //spotify
  passport.use(new SpotifyStrategy({
      clientID: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      callbackURL: process.env.EXPRESS_HOST + "/auth/spotify/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      console.log(accessToken, refreshToken);
      process.nextTick(function() {
        // To keep the example simple, the user's spotify profile is returned to
        // represent the logged-in user. In a typical application, you would want
        // to associate the spotify account with a user record in your database,
        // and return that user instead.
        return done(null, profile);
      });
    }));

};