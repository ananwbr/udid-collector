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

module.exports.insertRecord = function (deviceInfo, sheetId, sheetToken, callback) {
  const deferred = q.defer();

  const sheetUrl = `${TREATION_API_URL}/sheets/${sheetId}/read.json`;
  getRequest(sheetUrl, { table_token: sheetToken })
  .then(function (data) {
    const columnsDefinition = {};
    data.columns.forEach(function (column) {
      const columnId = column.id;
      const columnName = column.name;
      columnsDefinition[columnName] = columnId;
    });

    console.log(columnsDefinition);
    return columnsDefinition;
  })
  .then(function (columns) {
    const cells = parseCells(columns, deviceInfo);
    const recordUrl = `${TREATION_API_URL}/sheets/${sheetId}/records.json`;
    const body = {
      sheet_id: sheetId,
      table_token: sheetToken,
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
    console.log(err);
    deferred.reject(err);
  });

  deferred.promise.nodeify(callback);
  return deferred.promise;
};

module.exports.createSheet = function* (req) {
  const deferred = q.defer();

  const name = req.body.name;
  const sheetUrl = `${TREATION_API_URL}/sheets.json`;

  postRequest(sheetUrl, {
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
  var sheetId = '568de306c634d069bd000017';
  var sheetToken = 'efdd17597104898b1ee785a3d06c21f1';

  var url = util.format('%s/sheets/%s/columns.json', TREATION_API_URL, sheetId);
  console.log('url:' + url);

  var option = {
    url: url,
    json: true,
    body: {
      sheet_id: sheetId,
      table_token: sheetToken,
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

module.exports.getRecords = function (sheetId, sheetToken, callback) {
  const deferred = q.defer();

  const recordUrl = `${TREATION_API_URL}/sheets/${sheetId}/records.json`;

  getRequest(recordUrl, { table_token: sheetToken })
  .then(function (data) {
    deferred.resolve(data);
  })
  .catch(function (err) {
    deferred.reject(err);
  });

  deferred.promise.nodeify(callback);
  return deferred.promise;
};
