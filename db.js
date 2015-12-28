'use strict';

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
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

module.exports.find = function(integrationId, callback) {
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection(collection).findOne({integrationId: integrationId}, function(err, document) {
      assert.equal(err, null);
      console.log('in db find:' + document);
      callback(document);
      db.close();
    });
  });
};
