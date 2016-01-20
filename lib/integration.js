'use strict';

const randomstring = require('randomstring');
const db = require('./db');
const q = require('q');

const SERVER_NAME = require('../config').severName;

function register(integrationId, tableId, tableToken) {
  const integration = {
    integrationId,
    tableId,
    tableToken,
  };

  db.insert(integration, function (result) {
    console.log('[REGISTER] (%s)', JSON.stringify(result));
  });
}

function checkInegrationIdAvailability(integrationId) {
  const deferred = q.defer();

  db.findByIntegrationId(integrationId)
    .then(function (result) {
      deferred.resolve(result === null);
    })
    .catch(function (err) {
      deferred.resolve(err);
    });

  return deferred.promise;
}

function generateIntegrationId(deferred) {
  let newDeferred = deferred;
  if (!newDeferred) {
    newDeferred = q.defer();
  }

  const integrationId = randomstring.generate();

  checkInegrationIdAvailability(integrationId)
    .then(function (available) {
      if (available) {
        newDeferred.resolve(integrationId);
      } else {
        generateIntegrationId(newDeferred);
      }
    })
    .catch(function (err) {
      newDeferred.reject(err);
    });

  return newDeferred.promise;
}

module.exports.integrate = function *() {
  const deferred = q.defer();

  let tableId = this.request.body.tableId;
  let tableToken = this.request.body.tableToken;

  // TODO
  tableId = '568de306c634d069bd000017';
  tableToken = 'efdd17597104898b1ee785a3d06c21f1';

  db.getIntegrationIdByTableId(tableId)
  .then(function (integrationId) {
    if (integrationId) {
      const url = SERVER_NAME + '/udid/' + integrationId;
      deferred.resolve({ error_message: '该表已集成过', url });
    } else {
      generateIntegrationId()
      .then(function (newIntegrationId) {
        register(newIntegrationId, tableId, tableToken);

        const url = SERVER_NAME + '/udid/' + newIntegrationId;
        deferred.resolve({ url });
      })
      .catch(function () {
        deferred.reject('生成失败');
      });
    }
  })
  .catch(function (err) {
    deferred.resolve({ error_message: err });
  });

  this.body = yield deferred.promise;
};

module.exports.shareUrl = function *() {
  // TODO
  const tableId = '568de306c634d069bd000017';

  const deferred = q.defer();

  db.getIntegrationIdByTableId(tableId)
  .then(function (integrationId) {
    if (integrationId) {
      const url = SERVER_NAME + '/udid/' + integrationId;
      deferred.resolve({ url });
    } else {
      deferred.resolve({ error_message: '不存在该表' });
    }
  })
  .catch(function (err) {
    deferred.resolve({ error_message: err });
  });

  this.body = yield deferred.promise;
};
