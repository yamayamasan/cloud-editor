'use strict';

const _          = require('lodash');
const koa        = require('koa');
// const logger     = require('koa-logger');
const compress   = require('koa-compress');
const bodyParser = require('koa-bodyparser');
const route      = require('koa-route');
const serve      = require('koa-static');
const websockify = require('koa-websocket');
const basicauth  = require('koa-basic-auth');
const mkdirp     = require('mkdirp');
const config     = require('./config/config.json');

const srv = require('./service/service.js');

const app = websockify(koa());

const PROP_DIR = `${__dirname}/history${config.dir}`;

// app.use(logger());
app.use(bodyParser());

const routes = [];
_.forEach(srv, (item, path) => {
  if (path === 'init' || typeof item === 'function') return;
  _.forEach(item, (fnc, method) => {
    routes.push(route[method](`/${path}`, fnc));
  });
});

/*
const routes = [
  route.post('/terminals', srv.terminals.post),
  route.get('/filepath', srv.filepath.get),
  route.post('/filepath', srv.filepath.post),
  route.get('/openDir', srv.opendir.get),
  route.get('/tree', srv.tree.get),
  route.post('/exec_code', srv.execcode.post),
  route.get('/filetree', srv.filetree.get),
  route.get('/dirtree', srv.dirtree.get),
  route.get('/alltree', srv.alltree.get),
  route.get('/me', srv.me.get),
 // route.get('/event', srv.event.get)
];
*/
routes.map((_route) => {app.use(_route);});
// all
app.use(function *(next){
  try {
    yield next;
  } catch(err) {
    if (err.status == 401) {
      this.status = 401;
      this.set('WWW-Authenticate', 'Basic');
      this.body = 'Unauthorized';
    } else {
      throw err;
    }
  }
});

// basic auth
app.use(basicauth(config.basic));
// websocket
app.ws.use(route.all('/terminals/:pid', srv.terminalsPid));
app.ws.use(route.get('/event', srv.event.get));

app.use(compress());
app.use(serve(`${__dirname}/front/`));

app.listen(config.port, () => {
  mkdirp(PROP_DIR, (err) => {
    if (err) console.log(err);
  });
  srv.init();
  console.log('start: %s', config.port);
});
