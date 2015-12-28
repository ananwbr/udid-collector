'use strict';

var app = require('koa')();
var router = require('koa-router')();
var bodyParser = require('koa-bodyparser');
var fileServer = require('koa-static');
var parser = require('xml2js').parseString;
var url = require('url') ;

var integration = require('./integration');

function parse(data, callback) {
	var plist;
	var xml = /(<dict>[^]*<\/dict>)/.exec(data.toString());
	if (xml != null) {
  	plist = xml[0];
	}

	parser(plist, function (err, result) {
		console.log('sq:2');
		var keys = result.dict.key;
		var values = result.dict.string;

		var record = {};
		var queryString = '';

		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var value = values[i];

			record[key] = value;

			queryString += key + "=" + encodeURIComponent(value);
			if (i < keys.length - 1) {
				queryString += '&';
			};
		};

		console.log('record' + record);
		base('udid').create(record, function(err, record) {
	  	if (err) { 
	  		console.log(err); 
	  	}
	  	return;
		});

  	callback(queryString);
	});
}

function readStreamAsMap(stream, callback) {
	console.log('sq:1');
  var data = "";
  stream.on("data", function(chunk) {
    data += chunk;
  });
  stream.on("end", function() { 
  	parse(data, function (queryString) {
  		console.log('sq:3');
  		callback(queryString);
  	});
  });
}


app.use(bodyParser());

router.post('/udid', function *(next) {
	console.log('udid...');
	var context = this;
	console.log('sq:0');
	readStreamAsMap(this.req, function (query){
		console.log('info:' + query);
		console.log('sq:4');

		var queryString = '';
		if (query != null) {
			queryString = '?' + query;
		};

		console.log('queryString:' + queryString);
		context.status = 301;
		console.log('sq:5');
		context.redirect('/loading' + queryString);
	});
});

router.get('/loading', function *(next) {
	var queryObject = url.parse(this.req.url,true).query;
	console.log(queryObject);

	var list = '';
	var fail = false;
	for (var key in queryObject) {
		if (key == 'fail') {
			fail = true;
		};
	  list += '<li>' + key + ' : ' + queryObject[key] + '</li>';
	}

	var message = fail == true ? '上传失败' : '已上传到 Airtable ，谢谢 :]';
	this.body = '<html><body>' + message + '\n<ul>' + list + '</ul></body></html>';
});

router.post('/create', integration.create);

app
  .use(router.routes())
  .use(router.allowedMethods());

app.use(fileServer(__dirname + '/files'));

app.listen(3000);
