var _ = require('lodash');
var request = require('request');
var fs = require('fs');
var path = require('path');

var BASE = 'http://developer.echonest.com/api/v4/track/profile';
module.exports = function(express) {

  express.post('/echonest/search', function(req, res) {
    request({
      url: BASE,
      qs: {
        api_key: process.env.ECHONEST_API,
        format: 'json',
        id: req.body.id,
        bucket: 'audio_summary'
      }
    }).on('response', function(data) {
      console.log(data);
      res.send(data);
    });
  });
};