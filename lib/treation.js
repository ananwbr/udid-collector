
'use strict';

var util = require('util');
var request = require('request');
var async = require('async');
var path = require('path');
var fs = require('fs');

const TREATION_API_URL = 'http://service.treation.com:8080/api/v1';

function parseCells(columnsDefinition, deviceInfo) {
  var cells = {};

  for (var column in columnsDefinition) {
    cells[columnsDefinition[column]] = deviceInfo[column];
  }

  return cells;
}

module.exports.insertRecord = function (deviceInfo, tableId, tableToken, callback) {
  tableId = '5683b9f897eca675c1000010';
  tableToken = '9e371beeb40967f2defc6706d966f70e';

  var rawData;
  var columnsDefinition = {};
  var success;

  async.series([
    function(callback) {
      var options = {
        url: util.format('%s/tables/%s.json', TREATION_API_URL, tableId),
        qs: {
          table_token: tableToken
        }
      };

      request.get(options, function(err, response, body) {
        rawData = JSON.parse(body);
        callback();
      });
    },
    function(callback) {
      rawData['table']['columns'].forEach(function(column) {
        var columnId = column['id'];
        var columnName = column['name'];

        columnsDefinition[columnName] = columnId;
      });
      callback();
    },
    function(callback) {
      var cells = parseCells(columnsDefinition, deviceInfo);
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
          success = true;
        } else {
          success = false;
        }
        callback();
      });
    }], function (){
      callback(success);
    });
};

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

  var tableId = '5683b9f897eca675c1000010';
  var tableToken = '9e371beeb40967f2defc6706d966f70e';

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
