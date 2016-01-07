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
		yield this.render('form', {deviceInfo: queryObject});
	} else {
		yield this.render('done', {message: 'Oops, something wrong happened'});
	}
}

// http://stackoverflow.com/questions/22037287/can-not-set-header-in-koa-when-using-callback
module.exports.upload = function *(next) {
	var deviceInfo = JSON.parse(decodeURIComponent(this.request.body.deviceInfo));
	deviceInfo['NAME'] = this.request.body.deviceName;

	var deferred = q.defer();

	treation.insertRecord(deviceInfo, null, null, function (success) {
		var message = success ? 'It\'s done' : 'Oops, something wrong happened';
		deferred.resolve(message);
	});

	var message = yield deferred.promise;
	yield this.render('done', {message: message});
}

//http://stackoverflow.com/questions/18467620/dynamically-creating-a-file-with-node-js-and-make-it-available-for-download
module.exports.exportdata = function *(next) {
  var deferred = q.defer();

  var tableId = this.request.body.tableId;
  var tableToken = this.request.body.tableToken;

  tableId = '5683b9f897eca675c1000011';
  tableToken = '9e371beeb40967f2defc6706d966f70e';

  treation.getRecords(tableId, tableToken)
  .then(function (records) {
  	var text = 'Device ID	Device Name\n';

  	var finalRecords = [];
    records.forEach(function (item, index, array) {
      var record = item.cells;
      text += record['568c898c97eca63dc20002a4'] + '	' + record['568c898c97eca63dc20002a3'] + '\n';
    });

    deferred.resolve(text);
  })
  .catch(function (err) {
  	deferred.resolve({error_message : err});
  });

  var result = yield deferred.promise;
  if (typeof result === 'string') {
  	this.body = result;

  	this.set({
		  'Content-disposition': 'attachment; filename=multiple-device-upload.txt',
		  'Content-type': 'text/plain',
		});
  } else {
  	this.body = result;
  }
}