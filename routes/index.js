
/*
* GET home page.
*/
var fs      = require('fs')
,  path     = require("path")
,  http     = require("https")
,  exec     = require('child_process').exec
,  util     = require('util')
,  async    = require('async')
,  Socket = require( process.cwd() + "/lib/Socket.js" );

var MASHAPE = {
	API_KEY: "WwvoXA8VZ73TfJafX3nvuKBZ0JaQBtnV",
	IMAGE:   "",
	LOCALE:  "en_US",
	LENGTH: ""
}

exports.index = function(req, res){
	res.render('index', { title: 'curlfind' });
};

//http://blog.frankgrimm.net/2010/11/howto-access-http-message-body-post-data-in-node-js/
exports.upload = function(req, res, next){
	//http://stackoverflow.com/questions/11589671/serving-http-1-0-responses-with-node-js-unknown-content-length-chunked-transfe
	res.useChunkedEncodingByDefault = false;
	
	MASHAPE.IMAGE = req.files.file.path;
	fs.stat(MASHAPE.IMAGE, function (err, stat) {
		var img = fs.readFileSync(MASHAPE.IMAGE);
		res.contentType = 'image/png';
		res.contentLength = stat.size;
		res.end(img, 'binary');
		MASHAPE.LENGTH = stat.size
	});
	
	async.waterfall([
		/*
		function render(callback){
			res.render("index", { title: "curlfind" })

			setTimeout(function(){
				callback(null, "dave")
			}, 3000)
		},
		*/
		function curlPOST(callback){
			var c = util.format("curl --include --request POST 'https://camfind.p.mashape.com/image_requests/'  --header 'X-Mashape-Authorization: %s' -F 'image_request[locale]=%s' -F 'image_request[image]=@%s'", MASHAPE.API_KEY, MASHAPE.LOCALE, MASHAPE.IMAGE)

			console.log("curl POST: ", c)
	
			exec(c, curlHandler);
			function curlHandler(err, stdout, stderr) {
				if(err) throw new Error(err);
				var results = new Array();
				var lines = stdout.toString("utf8").split('\n');
				lines.forEach(function(line, idx) {
					try{
						var value = JSON.parse(line)
						if( value.token ){
							console.log("curl RESPONSE: ",  {"status":"success", "token": value.token }, "\n")
							//Add a 1 sec delay for development
							setTimeout(function(){
								callback(null, value);
							}, 100)
						}
					}catch(err){
						//console.warn(err);
					}				
				});
			}
		},
		function getReq(value, callback){
			var p = "image_responses/" + value.token;
			var options = {
			  host: "camfind.p.mashape.com",
			  port: 443,
//			  path: p,
			  path: path.join("image_responses/", value.token),
			  method: 'GET',
			  headers: {
				  "Content-Length": MASHAPE.LENGTH,
				  "X-Mashape-Authorization": MASHAPE.API_KEY,
				  /*
		        'cache-control': 'max-age=0',
		        'accept-encoding': 'gzip,deflate,sdch',
		        'accept-language': 'en-US,en;q=0.8',
		        'accept-charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3'
				  */
			  }			  
			};
			http.request(options, function(res) {
			  console.log('STATUS: ' + res.statusCode);
			  console.log('HEADERS: ' + JSON.stringify(res.headers));
			  //res.setEncoding('utf8');
			  res.on('data', function (chunk) {
			    console.log('BODY: ' + chunk);
			  });
			}).end();	
		},
		function curlGET(token, callback){
			var cam = JSON.stringify("https://camfind.p.mashape.com/image_responses/" + token)
			var header = JSON.stringify("X-Mashape-Authorization: " + MASHAPE.API_KEY)
			var c = util.format('curl --include --request GET %s --header %s -v', cam, header);
			console.log( c );
			
			exec(c, curlHandler);
			function curlHandler(err, stdout, stderr) {
				if(err) throw new Error(err);
				//console.log( "curlGET RESPONSE: ", stdout, "\n" );
				
				var results = new Array();
				var lines = stdout.toString("utf8").split('\n');
				lines.forEach(function(line, idx) {
					try{
						var object = JSON.parse(line)
						if( object.status == "completed" ){
							var searchResult = object.name;
							console.log("curl RESPONSE: ",  object, searchResult, "\n")
							//Add a 1 sec delay for development
							setTimeout(function(){
								callback(null, searchResult );
							}, 200)
						}
					}catch(err){
						//console.warn(err);
					}				
				});
				
			}
		}
		], 
		function (err, results){
			if(err) throw err;
			Socket.onmessage(results)
		});
}