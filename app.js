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

router.post('/collect', udid.collect);

router.get('/show', udid.show);

router.post('/create', integration.create);

router.post('/upload', udid.upload);

// router.get('/udid/*', function *(){
// 	yield this.render('collect');
// });

app
  .use(router.routes())
  .use(router.allowedMethods());

app.use(fileServer(__dirname + '/public'));

app.listen(3000);
