'use strict';

const SERVER_NAME = process.env.PIN_SERVER_NAME || 'http://channel.ananwbr.com:7777';

var randomstring = require('randomstring');
var treation = require('./treation');
var db = require('./db');
var q = require('q');

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

  tableId = '5683b9f897eca675c1000011';
  tableToken = '9e371beeb40967f2defc6706d966f70e';

  db.getIntegrationIdByTableId(tableId)
  .then(function (integrationId) {
    if (integrationId) {
      var url = SERVER_NAME + '/udid/' + integrationId;
      deferred.resolve({error_message : '该表已集成过', url : url});
    } else {
      generateIntegrationId()
      .then(function (integrationId) {
        register(integrationId, tableId, tableToken);

        var url = SERVER_NAME + '/udid/' + integrationId;
        deferred.resolve({url : url});
      });
    }
  })
  .catch(function (err) {
    deferred.resolve({error_message : err});
  });

  this.body = yield deferred.promise;
};
