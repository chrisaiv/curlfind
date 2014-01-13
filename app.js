
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.locals.pretty = true;
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//http://stackoverflow.com/questions/5149545/uploading-images-using-nodejs-express-and-mongo

app.use(express.bodyParser({
	uploadDir: __dirname + '/public/tmp/uploads',
	keepExtensions: true
}));
app.use(express.limit('20mb'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/upload', routes.upload);

var server = http.createServer(app);
server.listen( app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
})

var Socket = require( process.cwd() + "/lib/Socket.js" );
//    Socket.init( server );