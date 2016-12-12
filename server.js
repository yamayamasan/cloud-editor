'use strict';

const koa        = require('koa');
// const logger     = require('koa-logger');
const compress   = require('koa-compress');
const bodyParser = require('koa-bodyparser');
const route      = require('koa-route');
const serve      = require('koa-static');
const websockify = require('koa-websocket');
const mkdirp     = require('mkdirp');
const config     = require('./config/config.json');

const srv = require('./service/service.js');

const app = websockify(koa());

const PROP_DIR = `${__dirname}/history${config.dir}`;

// app.use(logger());
app.use(bodyParser());

const routes = [
  route.post('/terminals', srv.terminals.post),
  route.get('/filepath', srv.filePath.get),
  route.post('/filepath', srv.filePath.post),
  route.get('/tree', srv.tree.get)
];

routes.map((_route) => {app.use(_route);});

// websocket
app.ws.use(route.all('/terminals/:pid', srv.terminalsPid));

app.use(compress());
app.use(serve(`${__dirname}/front/`));

app.listen(config.port, () => {
  mkdirp(PROP_DIR, (err) => {
    if (err) console.log(err);
  });
  srv.init();
  console.log('start: %s', config.port);
});
