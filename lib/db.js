'use strict';

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var q = require('q');
var url = 'mongodb://localhost:27017/udid-collector';
var collection = 'udid';

module.exports.insert = function(document, callback) {
  MongoClient.connect(url, function(err, db) {
    assert.equal(err, null);
    db.collection('udid').insertOne(document, function(err, result) {
      assert.equal(err, null);
      callback(document);
      db.close();
    });
  });
};

module.exports.findByIntegrationId = function(integrationId, callback) {
  var deferred = q.defer();

  connect()
  .then(function (db) {
    db.collection(collection).findOne({integrationId: integrationId}, function(err, document) {
      db.close();

      if (err) {
        deferred.reject('数据库查询出错');
      } else {
        deferred.resolve(document);
      }
    });
  })
  .catch(function (err) {
    deferred.reject('数据库连接失败');
  });

  return deferred.promise;
};

module.exports.insertDeviceInfo = function (deviceInfo, callback) {
  MongoClient.connect(url, function(err, db) {
    assert.equal(err, null);
    db.collection('device').insertOne(deviceInfo, function(err, result) {
      assert.equal(err, null);
      callback(deviceInfo);
      db.close();
    });
  });
};

module.exports.getIntegrationIdByTableId = function (tableId, callback) {
  var deferred = q.defer();

  connect()
  .then(function (db) {
    db.collection(collection).findOne({tableId: tableId}, function(err, document) {
      db.close();

      if (err) {
        deferred.reject('数据库查询出错');
      } else if (document){
        deferred.resolve(document.integrationId);
      } else {
        deferred.resolve(document);
      }
    });
  })
  .catch(function (err) {
    deferred.reject('数据库连接失败');
  });

  deferred.promise.nodeify(callback);
  return deferred.promise;
}

function connect () {
  var deferred = q.defer();

  MongoClient.connect(url, function (err, db) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(db);
    }
  });

  return deferred.promise;
}