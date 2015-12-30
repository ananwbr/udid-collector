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
  var success = yield treation.createTable(this.request);
  var msg = success ? 'success' : 'fail';
  console.log(msg);
  // var tableInfo = yield treation.createTable();
  var tableId = '111';//tableInfo[0];
  var tableToken = '222';//tableInfo[1];

  if (success) {
    var integrationId = randomstring.generate();
    register(integrationId, tableId, tableToken);

    var url = SERVER_NAME + '/udid' + '/' + integrationId;
    this.response.body = '<html><body>' + url + '</body></html>';
  } else {
    this.response.body = '<html><body>创建表格失败</body></html>'
  }
};
