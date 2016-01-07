'use strict';

var app = require('koa')();
var router = require('koa-router')();
var bodyParser = require('koa-bodyparser');
var fileServer = require('koa-static');
var render = require('koa-ejs');

var integration = require('./lib/integration');
var udid = require('./lib/udid');

const SERVER_NAME = require('./config').severName;
console.log(SERVER_NAME);

render(app, {
  root: __dirname + '/views',
  layout: false,
  viewExt: 'html',
  cache: false,
  debug: true
});

app.use(bodyParser());

router.get('/configfile', udid.configfile);

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

router.get('/', function *() {
	var ua = this.headers['user-agent'];
  console.log('user-agent:' + ua);
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
