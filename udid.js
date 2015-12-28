'use strict';

var parser = require('xml2js').parseString;
var url = require('url') ;
var treation = require('./treation');

function parse(data, callback) {
	var plist;
	var xml = /(<dict>[^]*<\/dict>)/.exec(data.toString());
	if (xml != null) {
  	plist = xml[0];
	}

	parser(plist, function (err, result) {
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

		record['NAME'] = 'wbr';
		console.log('record' + record);
		treation.insertRecord(record);

  	callback(queryString);
	});
}

function readStreamAsMap(stream, callback) {
  var data = "";
  stream.on("data", function(chunk) {
    data += chunk;
  });
  stream.on("end", function() { 
  	parse(data, function (queryString) {
  		callback(queryString);
  	});
  });
}

module.exports.collect = function *(next) {
	var context = this;
	readStreamAsMap(this.req, function (query){
		var queryString = '';
		if (query != null) {
			queryString = '?' + query;
		};

		console.log('queryString:' + queryString);
		context.status = 301;
		context.redirect('/show' + queryString);
	});
}

module.exports.show = function *(next) {
	var queryObject = url.parse(this.req.url,true).query;

	var list = '';
	for (var key in queryObject) {
	  list += '<li>' + key + ' : ' + queryObject[key] + '</li>';
	}

	var message = '已上传到 Treation ，谢谢 :]';
	this.body = '<html><body>' + message + '\n<ul>' + list + '</ul></body></html>';
}