'use strict';

var app = require('koa')();
var router = require('koa-router')();
var bodyParser = require('koa-bodyparser');
var fileServer = require('koa-static');
var render = require('koa-ejs');

var integration = require('./lib/integration');
var udid = require('./lib/udid');

render(app, {
  root: __dirname + '/views',
  layout: false,
  viewExt: 'html',
  cache: false,
  debug: true
});

app.use(bodyParser());

//.mobileconfig callback
router.post('/collect', udid.collect);

//show device info
router.get('/show', udid.show);

//upload device info to treation
router.post('/upload', udid.upload);

//export device info 
router.get('/export', udid.exportdata);

//integrate
router.post('/integrate', integration.integrate);

//get share url
router.get('/shareurl', integration.shareUrl);

app
  .use(router.routes())
  .use(router.allowedMethods());

app.use(fileServer(__dirname + '/public'));

app.listen(3000);
