'use strict';

var parser = require('xml2js').parseString;
var url = require('url') ;
var async = require('async');

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

  	callback(queryString, record);
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
	var rawData = '';
	var queryString = '';
	var deviceInfo;
	var context = this;

	async.series([
		function (callback) {
		  context.req.on("data", function(chunk) {
		    rawData += chunk;
		  });
		  context.req.on("end", function() { 
		  	callback();
		  });
		},
		function (callback) {
			parse(rawData, function (result, record) {
					queryString = result;
					deviceInfo = record;
		  		callback();
		  	});
		}
	], function (){
		deviceInfo['NAME'] = 'wbr';
		treation.insertRecord(deviceInfo);

		console.log('queryString:' + queryString);
		context.status = 301;
		context.redirect('/show?' + queryString);
	});
};

module.exports.show = function *(next) {
	var queryObject = url.parse(this.req.url,true).query;

	yield this.render('collect', {
    deviceInfo : queryObject
	});
}