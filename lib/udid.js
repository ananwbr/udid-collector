'use strict';

const SERVER_NAME = process.env.PIN_SERVER_NAME || 'http://channel.ananwbr.com:7777';

var parser = require('xml2js').parseString;
var url = require('url') ;
var q = require('q');

var db = require('./db');
var treation = require('./treation');

function parseData (data) {
	var deferred = q.defer();

	var plist;
	var xmlData = /(<dict>[^]*<\/dict>)/.exec(data.toString());
	if (xmlData != null) {
  	plist = xmlData[0];

  	parser(plist, function (err, result) {
			if (err) {
				deferred.reject(err);
			} else {
				var querystring = '';
				var keys = result.dict.key;
				var values = result.dict.string;

				for (var i = 0; i < keys.length; i++) {
					var key = keys[i];
					var value = values[i];

					querystring += (key + "=" + encodeURIComponent(value));
					if (i < keys.length - 1) {
						querystring += '&';
					};
				};

				deferred.resolve(querystring);
			}
		});
	} else {
		deferred.reject(new Error('Can not get device info'));
	}

	return deferred.promise;
}

function readData (req) {
	var deferred = q.defer();

	var rawData = '';
	req.on("data", function(chunk) {
		rawData += chunk;
	});

	req.on("end", function() {
		deferred.resolve(rawData);
	});

	req.on("error", function(error) {
		deferred.reject(error);
	});

	return deferred.promise;
}

module.exports.collect = function *(next) {	
	var deferred = q.defer();

	readData(this.req)
	.then(function (data) {
		return parseData(data);
	})
	.then(function (result) {
		deferred.resolve('?' + result);
	})
	.catch(function (error) {
		deferred.resolve('');
  });

  var querystring = yield deferred.promise;
  this.status = 301;
  this.redirect('/show' + querystring);
}

module.exports.show = function *(next) {
	if (this.request.querystring.length > 0) {
		var queryObject = url.parse(this.req.url,true).query;
		yield this.render('collect', {
	    deviceInfo : queryObject
		});
	} else {
		this.body = '<html><body>获取 UDID 失败，请重试。</body></html>';
	}
}

// http://stackoverflow.com/questions/22037287/can-not-set-header-in-koa-when-using-callback
module.exports.upload = function *(next) {
	var deviceInfo = JSON.parse(decodeURIComponent(this.request.body.deviceInfo));
	deviceInfo['NAME'] = this.request.body.deviceName;

	var deferred = q.defer();

	treation.insertRecord(deviceInfo, null, null, function (success) {
		var message = success ? '上传成功，谢谢 :]' : '失败了，请重试';
		deferred.resolve('<html><body>' + message + '</body></html>');
	});

	this.body = yield deferred.promise;
}

module.exports.shareUrl = function *(next) {
	var ctx = this;
	var tableId = '5683b9f897eca675c1000010';

	var deferred = q.defer();

	db.getIntegrationIdByTableId(tableId)
	.then(function (integrationId) {
		if (integrationId) {
			var url = SERVER_NAME + '/udid/' + integrationId;
			deferred.resolve({url : url});
		} else {
			deferred.resolve({error_message : '不存在该表'});
		}
	})
	.catch(function (err) {
		deferred.resolve({error_message : err});
	});

	this.body = yield deferred.promise;
}

