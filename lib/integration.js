'use strict';

var randomstring = require('randomstring');
var treation = require('./treation');
var db = require('./db');
var q = require('q');

const serverName = require('../config').severName;

function register(integrationId, tableId, tableToken) {
  var integration = {
    integrationId: integrationId,
    tableId: tableId,
    tableToken: tableToken
  };

  db.insert(integration, function(integration) {
    console.log('[REGISTER] (%s)(%s)', JSON.stringify(integration));
  });
}

function checkInegrationIdAvailability (integrationId) {
  var deferred = q.defer();

  db.findByIntegrationId(integrationId)
    .then(function (result) {
      deferred.resolve(result == null);
    })
    .catch(function (err){
      deferred.resolve(false);
    });

  return deferred.promise;
}

function generateIntegrationId (deferred) {
  if (deferred == null) {
    deferred = q.defer();
  }

  var integrationId = randomstring.generate();

  checkInegrationIdAvailability(integrationId)
  .then(function (avalible) {
    if (avalible) {
      deferred.resolve(integrationId);
    } else {
      generateIntegrationId(deferred);
    }
  });

  return deferred.promise;
}

module.exports.integrate = function *() {
  var deferred = q.defer();

  var tableId = this.request.body.tableId;
  var tableToken = this.request.body.tableToken;

  //TODO
  tableId = '568de306c634d069bd000017';
  tableToken = 'efdd17597104898b1ee785a3d06c21f1';

  db.getIntegrationIdByTableId(tableId)
  .then(function (integrationId) {
    if (integrationId) {
      var url = serverName + '/udid/' + integrationId;
      deferred.resolve({error_message : '该表已集成过', url : url});
    } else {
      generateIntegrationId()
      .then(function (integrationId) {
        register(integrationId, tableId, tableToken);

        var url = serverName + '/udid/' + integrationId;
        deferred.resolve({url : url});
      });
    }
  })
  .catch(function (err) {
    deferred.resolve({error_message : err});
  });

  this.body = yield deferred.promise;
};

module.exports.shareUrl = function *(next) {
  //TODO
  var tableId = '568de306c634d069bd000017';

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
