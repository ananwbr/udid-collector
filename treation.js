
'use strict';

var util = require('util');
var request = require('request');
var async = require('async');
var path = require('path');
var fs = require('fs');

const TREATION_API_URL = 'http://service.treation.com/api/v1';

function insertRecord(tableId, tableToken, cells) {
  var options = {
    url: util.format('%s/tables/%s/records.json', TREATION_API_URL, tableId),
    json: true,
    body: {
      table_id: tableId,
      table_token: tableToken,
      cells: cells
    }
  };

  request.post(options, function(error, response, body) {
    if (response.statusCode == 201) {
      console.log('record: insert success');
    } else {
      console.log('record: insert failed');
    }
  });
}

module.exports.createTable = function *() {
//   var name = this.request.body['name'];

//   var option = {
//     url: util.format('%s/tables.json', TREATION_API_URL),
//     json: true,
//     body: {
//       name: name
//       columns: webhookPlugins[webhookType]['columns']
//     }
//   };

//   request.post(option, function(error, response, body) {
//     if (response.statusCode == 201) {
//       console.log('columns: insert done.');
//       callback(body);
//     }
//   });
// }
  console.log('createTable api called...');

  var tableId = '567dff35c634d0678c00001f';
  var tableToken = '6ef99b500881a22a0f8ac05d2a4e04b3';

  var url = util.format('%s/tables/%s/columns.json', TREATION_API_URL, tableId);
  console.log('url:' + url);

  var option = {
    url: url,
    json: true,
    body: {
      table_id: tableId,
      table_token: tableToken,
      columns: [
        {editable: false, name: 'NAME', type: 'singleline'},
        {editable: false, name: 'UDID', type: 'singleline'},
        {editable: false, name: 'IMEI', type:'singleline'},
        {editable: false, name: 'VERSION', type: 'singleline'},
        {editable: false, name: 'PRODUCT', type: 'singleline'}
      ]
    }
  };

  request.post(option, function(error, response, body) {
    console.log('response:' + response.statusCode);
    if (response.statusCode == 201) {
      console.log('columns: insert done.');
    }
  });

  console.log('after create column');
  return [tableId, tableToken];
}
