'use strict';

const parser = require('xml2js').parseString;
const url = require('url');
const q = require('q');
const fs = require('fs');

const treation = require('./treation');
const SERVER_NAME = require('../config').severName;

function parseData(data) {
  const deferred = q.defer();

  let plist;
  const xmlData = /(<dict>[^]*<\/dict>)/.exec(data.toString());
  if (xmlData) {
    plist = xmlData[0];

    parser(plist, function (err, result) {
      if (err) {
        deferred.reject(err);
      } else {
        let querystring = '';
        const keys = result.dict.key;
        const values = result.dict.string;

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const value = values[i];

          querystring += (key + '=' + encodeURIComponent(value));
          if (i < keys.length - 1) {
            querystring += '&';
          }
        }

        deferred.resolve(querystring);
      }
    });
  } else {
    deferred.reject(new Error('Can not get device info'));
  }

  return deferred.promise;
}

function readData(req) {
  const deferred = q.defer();

  let rawData = '';
  req.on('data', function (chunk) {
    rawData += chunk;
  });

  req.on('end', function () {
    deferred.resolve(rawData);
  });

  req.on('error', function (error) {
    deferred.reject(error);
  });

  return deferred.promise;
}

module.exports.collect = function *(next) {
  const deferred = q.defer();

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

  const querystring = yield deferred.promise;
  this.status = 301;
  this.redirect('/show' + querystring);
};

module.exports.show = function *(next) {
  if (this.request.querystring.length > 0) {
    const queryObject = url.parse(this.req.url, true).query;
    yield this.render('form', { deviceInfo: queryObject });
  } else {
    yield this.render('done', { message: 'Oops, something wrong happened' });
  }
};

// http://stackoverflow.com/questions/22037287/can-not-set-header-in-koa-when-using-callback
module.exports.upload = function *() {
  const deviceInfo = JSON.parse(decodeURIComponent(this.request.body.deviceInfo));
  deviceInfo.NAME = this.request.body.deviceName;

  const deferred = q.defer();

  // TODO
  const tableId = '568de306c634d069bd000017';
  const tableToken = 'efdd17597104898b1ee785a3d06c21f1';

  treation.insertRecord(deviceInfo, tableId, tableToken)
  .then(function (success) {
    const message = success ? 'It\'s done' : 'Oops, something wrong happened';
    deferred.resolve(message);
  })
  .catch(function () {
    deferred.resolve('Oops, something wrong happened');
  });

  const message = yield deferred.promise;
  yield this.render('done', { message });
};

// http://stackoverflow.com/questions/18467620/dynamically-creating-a-file-with-node-js-and-make-it-available-for-download
module.exports.exportdata = function *() {
  const deferred = q.defer();

  let tableId = this.request.body.tableId;
  let tableToken = this.request.body.tableToken;

  // TODO
  tableId = '568de306c634d069bd000017';
  tableToken = 'efdd17597104898b1ee785a3d06c21f1';

  treation.getRecords(tableId, tableToken)
  .then(function (records) {
    let text = 'Device ID	Device Name\n';

    records.forEach(function (item, index, array) {
      const record = item.cells;
      text += `${record['568e3a16c634d069c1000054']}	${record['568e3a16c634d069c1000053']}\n`;
    });

    deferred.resolve(text);
  })
  .catch(function (err) {
    deferred.resolve({ error_message: err });
  });

  const result = yield deferred.promise;
  if (typeof result === 'string') {
    this.body = result;
    this.set({
      'Content-disposition': 'attachment; filename=multiple-device-upload.txt',
      'Content-type': 'text/plain',
    });
  } else {
    this.body = result;
  }
};

module.exports.configfile = function *(next) {
  const template = fs.readFileSync('udid.mobileconfig', 'utf8');

  this.body = template.replace('URL_PLACEHOLDER', SERVER_NAME + '/collect');
  this.set({
    'Content-type': 'application/x-apple-aspen-config',
  });
};
