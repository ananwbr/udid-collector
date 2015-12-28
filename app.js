'use strict';

var app = require('koa')();
var router = require('koa-router')();
var bodyParser = require('koa-bodyparser');
var fileServer = require('koa-static');

var integration = require('./integration');
var udid = require('./udid');

app.use(bodyParser());

router.post('/udid', udid.collect);
router.get('/show', udid.show);

router.post('/create', integration.create);

app
  .use(router.routes())
  .use(router.allowedMethods());

app.use(fileServer(__dirname + '/files'));

app.listen(3000);
