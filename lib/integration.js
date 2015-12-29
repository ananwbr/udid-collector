'use strict';

const SERVER_NAME = process.env.PIN_SERVER_NAME || 'http://channel.ananwbr.com:7777';

var randomstring = require('randomstring');
var treation = require('./treation');
var db = require('./db');

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

module.exports.create = function *() {
  var tableInfo = yield treation.createTable();
  var tableId = tableInfo[0];
  var tableToken = tableInfo[1];

  var integrationId = randomstring.generate();
  register(integrationId, tableId, tableToken);
  console.log('after register');

  var url = SERVER_NAME + '/udidcollector' + '/' + integrationId;
  this.body = '<html><body>' + url + '</body></html>';
};