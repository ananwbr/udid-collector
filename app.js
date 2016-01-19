'use strict';

const app = require('koa')();
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
const fileServer = require('koa-static');
const render = require('koa-ejs');

const integration = require('./lib/integration');
const udid = require('./lib/udid');

render(app, {
  root: __dirname + '/views',
  layout: false,
  viewExt: 'html',
  cache: false,
  debug: true,
});

app.use(bodyParser());

router.get('/configfile', udid.configfile);

// .mobileconfig callback
router.post('/collect', udid.collect);

// show device info
router.get('/show', udid.show);

// upload device info to treation
router.post('/upload', udid.upload);

// export device info
router.get('/export', udid.exportdata);

// integrate
router.post('/integrate', integration.integrate);

// get share url
router.get('/shareurl', integration.shareUrl);

router.get('/', function *() {
  const ua = this.headers['user-agent'];
  if (/iPhone|iPod|iPad/.test(ua) && /Safari/.test(ua) && !/CriOS/.test(ua)) {
    yield this.render('get-udid');
  } else {
    yield this.render('device');
  }
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.use(fileServer(__dirname + '/public'));

app.listen(3000);
