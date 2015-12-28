'use strict';

const SERVER_NAME = process.env.PIN_SERVER_NAME || 'http://localhost:3000';

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
  treation.createTable(function (tableId, tableToken){
    var integrationId = randomstring.generate();
    register(integrationId, tableId, tableToken);

    var url = SERVER_NAME + '/udidcollector' + '/' + integrationId;
    console.log('urlurlurl:' + url)
    // callback(url);
  });
};