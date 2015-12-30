
'use strict';

var util = require('util');
var request = require('request');
var async = require('async');
var path = require('path');
var fs = require('fs');
var q = require('q');

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

module.exports.createTable = function *(req) {
  var success;

  var name = req.body.name

  var option = {
    url: util.format('%s/tables.json', TREATION_API_URL),
    json: true,
    body: {
      name: name,
      access_token: '389eaa2e21d14e50ecf5a33d2582d0852d9bc09c6771bad1d9807814d333e724',
      columns: [
        {editable: false, name: '名字', type: 'singleline'},
        {editable: false, name: '手机号', type: 'singleline'}
      ]
    }
  };

  var deferred = q.defer();

  request.post(option, function(error, response, body) {
    if (response.statusCode == 201) {
      //TODO
      console.log('create success!');
      success = true;
    } else {
      console.log('create failed...');
      success = false;
    }

    deferred.resolve(success);
  });

  success = yield deferred.promise;
  return success;
}
