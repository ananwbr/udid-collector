'use strict';

const request = require('request');
const q = require('q');

const TREATION_API_URL = require('../config').treationApiUrl;

function getRequest(url, qs) {
  const deferred = q.defer();

  const options = {
    url,
    qs,
  };

  request.get(options, function (err, response, body) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(JSON.parse(body));
    }
  });

  return deferred.promise;
}

function postRequest(url, body) {
  const deferred = q.defer();

  const options = {
    url,
    json: true,
    body,
  };

  request.post(options, function (err, response) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(response);
    }
  });

  return deferred.promise;
}

function parseCells(columnsDefinition, deviceInfo) {
  const cells = {};

  for (const column in columnsDefinition) {
    if (columnsDefinition.hasOwnProperty(column)) {
      cells[columnsDefinition[column]] = deviceInfo[column];
    }
  }

  return cells;
}

module.exports.insertRecord = function (deviceInfo, tableId, tableToken, callback) {
  const deferred = q.defer();

  const tableUrl = `${TREATION_API_URL}/tables/${tableId}.json`;
  getRequest(tableUrl, { table_token: tableToken })
  .then(function (data) {
    const columnsDefinition = {};

    data.table.columns.forEach(function (column) {
      const columnId = column.id;
      const columnName = column.name;
      columnsDefinition[columnName] = columnId;
    });

    return columnsDefinition;
  })
  .then(function (columns) {
    const cells = parseCells(columns, deviceInfo);
    const recordUrl = `${TREATION_API_URL}/tables/${tableId}/records.json`;
    const body = {
      table_id: tableId,
      table_token: tableToken,
      cells,
    };

    postRequest(recordUrl, body)
    .then(function (response) {
      if (response.statusCode === 201) {
        deferred.resolve(true);
      } else {
        deferred.resolve(false);
      }
    });
  })
  .catch(function (err) {
    deferred.reject(err);
  });

  deferred.promise.nodeify(callback);
  return deferred.promise;
};

module.exports.createTable = function *(req) {
  const deferred = q.defer();

  const name = req.body.name;
  const tableUrl = `${TREATION_API_URL}/tables.json`;

  postRequest(tableUrl, {
    name,
    access_token: '389eaa2e21d14e50ecf5a33d2582d0852d9bc09c6771bad1d9807814d333e724',
    columns: [
      { editable: false, name: 'NAME', type: 'singleline' },
      { editable: false, name: 'UDID', type: 'singleline' },
      { editable: false, name: 'PRODUCT', type: 'singleline' },
    ],
  })
  .then(function (response) {
    if (response.statusCode === 201) {
      deferred.resolve(true);
    } else {
      deferred.resolve(false);
    }
  })
  .catch(function (err) {
    deferred.reject(err);
  });

/* create column
  var tableId = '568de306c634d069bd000017';
  var tableToken = 'efdd17597104898b1ee785a3d06c21f1';

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
*/
};

module.exports.getRecords = function (tableId, tableToken, callback) {
  const deferred = q.defer();

  const recordUrl = `${TREATION_API_URL}/tables/${tableId}/records.json`;

  getRequest(recordUrl, { table_token: tableToken })
  .then(function (data) {
    deferred.resolve(data.records);
  })
  .catch(function (err) {
    deferred.reject(err);
  });

  deferred.promise.nodeify(callback);
  return deferred.promise;
};
