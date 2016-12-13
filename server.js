'use strict';

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

const routes = [
  route.post('/terminals', srv.terminals.post),
  route.get('/filepath', srv.filePath.get),
  route.post('/filepath', srv.filePath.post),
  route.get('/openDir', srv.openDir.get),
  route.get('/tree', srv.tree.get),
 // route.get('/event', srv.event.get)
];

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
app.use(serve(`bower_components/`));

app.listen(config.port, () => {
  mkdirp(PROP_DIR, (err) => {
    if (err) console.log(err);
  });
  srv.init();
  console.log('start: %s', config.port);
});
