'use strict';

const _          = require('lodash');
const koa        = require('koa');
// const logger     = require('koa-logger');
const compress   = require('koa-compress');
const bodyParser = require('koa-bodyparser');
const route      = require('koa-route');
const serve      = require('koa-static');
const websockify = require('koa-websocket');
const mkdirp     = require('mkdirp');
const config     = require('./config/config.json');

const basicAuth  = require('./lib/basicAuth.js');
const appAuth    = require('./lib/appAuth.js');

const srv = require('./service/service.js');

const app = websockify(koa());

const PROP_DIR = `${__dirname}/history${config.dir}`;

// app.use(logger());
app.use(bodyParser());

const routes = [];
_.forEach(srv, (item, path) => {
  if (path === 'init' || typeof item === 'function') return;
  _.forEach(item, (fnc, method) => {
    routes.push(route[method](`/api/${path}`, fnc));
  });
});

routes.map((_route) => {app.use(_route);});
// all
app.use(function *(next){
  try {
    yield next;
  } catch(err) {
    console.log(err.status);
    console.log(err.message);
    if (err.status && err.message == 'JWT-ERROR') {
      this.status = 401;
      this.set('WWW-Authenticate', 'Bearer');
      this.body = 'Unauthorized';
    } else if (err.status == 401) {
      this.status = 401;
      this.set('WWW-Authenticate', 'Basic');
      this.body = 'Unauthorized';
    } else {
      throw err;
    }
  }
});

// app auth
app.use(appAuth('/api/*'));
// basic auth
app.use(basicAuth('/api/*', config.basic));
// websocket
app.ws.use(route.all('/terminals/:pid', srv.terminalsPid));
// app.ws.use(route.get('/event', srv.event.get));

app.use(compress());
app.use(serve(`${__dirname}/front/`));

app.listen(config.port, () => {
  mkdirp(PROP_DIR, (err) => {
    if (err) console.log(err);
  });
  srv.init();
  console.log('start: %s', config.port);
});
