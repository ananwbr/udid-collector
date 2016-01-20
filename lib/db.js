'use strict';

const MongoClient = require('mongodb').MongoClient;
const q = require('q');
const url = 'mongodb://localhost:27017/udid-collector';
const collection = 'udid';

function connect() {
  const deferred = q.defer();

  MongoClient.connect(url, function (err, db) {
    if (err) {
      deferred.reject('数据库连接失败');
    } else {
      deferred.resolve(db);
    }
  });

  return deferred.promise;
}

function findOne(db, condition) {
  const deferred = q.defer();

  db.collection(collection).findOne(condition, function (err, document) {
    db.close();

    if (err) {
      deferred.reject('数据库查询出错');
    } else {
      deferred.resolve(document);
    }
  });

  return deferred.promise;
}

module.exports.insert = function (document, callback) {
  const deferred = q.defer();

  connect()
    .then(function (db) {
      db.collection('udid').insertOne(document, function (err) {
        db.close();

        if (err) {
          deferred.reject('数据库插入失败');
        } else {
          deferred.resolve(document);
        }
      });
    })
    .catch(function (err) {
      deferred(err);
    });

  deferred.promise.nodeify(callback);
  return deferred.promise;
};

module.exports.findByIntegrationId = function (integrationId, callback) {
  const deferred = q.defer();

  connect()
    .then(function (db) {
      findOne(db, { integrationId })
        .then(function (document) {
          deferred.resolve(document);
        });
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  deferred.promise.nodeify(callback);
  return deferred.promise;
};

module.exports.getIntegrationIdByTableId = function (tableId, callback) {
  const deferred = q.defer();

  connect()
    .then(function (db) {
      findOne(db, { tableId })
        .then(function (document) {
          if (document) {
            deferred.resolve(document.integrationId);
          } else {
            deferred.resolve(document);
          }
        });
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  deferred.promise.nodeify(callback);
  return deferred.promise;
};
