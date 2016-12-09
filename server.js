'use strict';

const fs         = require('fs');
const fsExtra    = require('fs-extra');
const koa        = require('koa');
const logger     = require('koa-logger');
const compress   = require('koa-compress');
const bodyParser = require('koa-bodyparser');
const routing    = require('koa-routing');
const koaRoute   = require('koa-route');
const serve      = require('koa-static');
const websockify = require('koa-websocket');
const mkdirp     = require('mkdirp');
const nodeUuid   = require('node-uuid');
const pty        = require('pty.js');
const os         = require('os');
const tree       = require('./lib/filelist2json.js');
const model      = require('./model.js');
const config     = require('./config/config.json');

// const app        = koa();
const app = websockify(koa());

const dir        = config.dir;
const hisDir     = `${__dirname}/history`;
const propath    = `${hisDir}${dir}`;

const terminals = {};
const logs = {};
// app.use(logger());
app.use(bodyParser());

app.use(routing(app));

app.route('/terminals').post(function *(){
  const cols = this.query.cols;
  const rows = this.query.rows;
  const term = pty.spawn(process.platform === 'win32' ? 'cmd.exe' : 'bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.pwd,
    env: process.env
  });
  terminals[term.pid] = term;
  logs[term.pid] = '';
  term.on('data', (data) => {
    logs[term.pid] += data;
  });
  console.log('terminals');
  this.body = {pid: term.pid.tostring()};
});

const terminalsPid = function *(pid, next) {
  // const term = terminals[parseInt(this.request.body.pid)];
  const term = terminals[parseInt(pid)];

  this.websocket.send(logs[term.pid]);
  term.on('data', (data) => {
    try {
      this.websocket.send(data);
    } catch(ex) {
    
    }
  });
  this.websocket.on('message', (msg) => {
    term.write(msg);
  });
  this.websocket.on('close', () => {
    process.kill(term.pid);
    delete terminals[term.pid];
    delete logs[term.pid];
  });
};

// websocketがkoa-routingだと上手くいかなかったので、
app.ws.use(koaRoute.all('/terminals/:pid', terminalsPid));
/*
app.ws.use('/terminals/:pid', function *(next){
  console.log('terminals/pid');
  const term = terminals[parseInt(this.request.body.pid)];

  this.websocket.send(logs[term.pid]);
  term.on('data', (data) => {
    try {
      this.websocket.send(data);
    } catch(ex) {
    
    }
  });
  this.websocket.on('message', (msg) => {
    term.write(msg);
  });
  this.websocket.on('close', () => {
    process.kill(term.pid);
    delete terminals[term.pid];
    delete logs[term.pid];
  });
});
*/
const api = app.route('/api');
api.nested('/filepath')
   .get(function *(next){
     const filepath = this.query.p;
     const text = fs.readFileSync(filepath, 'utf8');
     this.body = text;
     yield next;
   })
   .post(function *(next){
     const path = this.request.body.path;
     const text = this.request.body.data;
     if (path) {
       const uuid = nodeUuid.v4();

       const lastItem = model.lastVer(path);

       model.ext((_this) => {
         const time = new Date();
         const fileUuid = `${path}_${uuid}`;
         const data = {
           uuid: uuid,
           file: path,
           file_uuid: fileUuid,
           version: 1,
           created_at: time,
           updated_at: time
         };
        // if (auther) data.auther = auther;
         if (lastItem && lastItem.version) data.version = lastItem.version + 1;
         _this.realm.write(() => {
           _this.realm.create('History', data);

           fsExtra.copySync(path, `${hisDir}${fileUuid}`);
           fs.writeFileSync(path, text, 'utf8');
         });
       });
     }
     this.body = {'success': true};
     yield next;
   });

api.nested('/tree')
   .get(function *(next){
     const r = yield tree(dir);
     this.body = r;
     yield next;
   });

app.use(compress());
app.use(serve(`${__dirname}/app/`));

app.listen(8919, () => {
  mkdirProjcet();
  console.log('start: 8919');
});

function mkdirProjcet() {
  mkdirp(propath, (err) => {
    if (err) console.log(err);
  });
}

