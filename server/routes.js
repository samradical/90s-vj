var _ = require('lodash');
var passport = require('passport');
var request = require('request');
var flash = require('connect-flash');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var ROUTES = function(exp, _Io) {
	var express = exp;

	//auth
	require('./routes/authentication')(express, _Io);
	require('./routes/echonest')(express, _Io);
	require('./routes/youtube')(express, _Io);

	//*********************
	//POST
	//*********************

	express.post('/signup', function(req, res, next) {
		passport.authenticate('local-signup', function(err, user, info) {
			if (err) {
				return next(err); // will generate a 500 error
			}
			if (!user) {
				return res.send({
					success: false,
					message: info['message']
				});
			}
			return res.send({
				success: true,
				user: user
			});
		})(req, res, next);
	});

	express.post('/login', function(req, res, next) {
		passport.authenticate('local-login', function(err, user, info) {
			if (err) {
				return next(err); // will generate a 500 error
			}
			if (!user) {
				return res.send({
					success: false,
					message: info['message']
				});
			}
			return res.send({
				success: true,
				user: user
			});
		})(req, res, next);
	});

	////////////////////////
	//PUBLIC
	////////////////////////

};

module.exports = ROUTES;
