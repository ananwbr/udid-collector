'use strict';

var parser = require('xml2js').parseString;
var url = require('url') ;
var async = require('async');
var q = require('q');

var db = require('./db');
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

module.exports.collect = function *(next) {
	var rawData = '';
	var queryString = '';
	var deviceInfo;
	var context = this;
	var deviceId = '';

	var deferred = q.defer();

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
		deferred.resolve(queryString);
	});

	queryString = yield deferred.promise;
	this.status = 301;
	this.redirect('/show?' + queryString);
};

module.exports.show = function *(next) {
	var queryObject = url.parse(this.req.url,true).query;

	yield this.render('collect', {
    deviceInfo : queryObject
	});
}

//http://stackoverflow.com/questions/22037287/can-not-set-header-in-koa-when-using-callback
module.exports.upload = function *(next) {
	var deviceInfo = JSON.parse(this.request.body.deviceInfo);
	deviceInfo['NAME'] = this.request.body.deviceName;

	var deferred = q.defer();

	treation.insertRecord(deviceInfo, null, null, function (success) {
		var message = success ? '上传成功，谢谢 :]' : '失败了，请重试';
		deferred.resolve('<html><body>' + message + '</body></html>');
	});

	this.body = yield deferred.promise;
}