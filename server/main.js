var express = require('express');
var ip = require('ip');
var cors = require('cors');
var path = require('path');
var busboi = require('connect-busboy');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

require('dotenv').config({
    path: path.join(process.cwd(), './envvars')
});

require('./passport')(passport);


var server;
var app = express();
var io;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json());

// required for passport
app.use(session({
    secret: 'samrad'
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(cors());
console.log(process.env.PORT);
var server = app.listen(process.env.PORT || 9999, function() {
    var host = server.address().address;
    var port = server.address().port;
});

io = require('./socket')(server);

routes = require('./routes')(app, io);

app.get('/', function(req, res) {
    res.status(200).send('Hello, world SAM!');
});


module.exports = app;