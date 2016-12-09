'use strict';

const fs           = require('fs');
const fsExtra      = require('fs-extra');
const nodeUuid     = require('node-uuid');
const pty          = require('pty.js');
const tree         = require('../lib/filelist2json.js');
const history      = require('../models/history.js');
const terminalUser = require('../models/terminalUser.js');

const config = require('../config/config.json');
const DIR = config.dir;
const HIS_DIR = `${__dirname}/../history`;

const terminals = {};
const logs = {};

const postTerminals = function *() {
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

  const user = 'user';
  const userId = 1;
  terminalUser.active(nodeUuid.v4(), user, userId, term.pid);

  this.body = {pid: term.pid.toString()};
};

const allTerminalsPid = function *(pid, next) {
  const term = terminals[parseInt(pid)];

  terminalUser.ext((_this) => {
    _this.realm.objects('TerminalUser').addListener((p, c) => {
      c.insertions.forEach((idx) => {
        console.log('ist', p[idx]);
      });

      c.modifications.forEach((idx) => {
        console.log('mod', p[idx]);
      });
    });
  });

  this.websocket.send(logs[term.pid]);
  term.on('data', (data) => {
    try {
      this.websocket.send(data);
    } catch(ex) {
      console.error(ex);
    }
  });
  this.websocket.on('message', (msg) => {
    term.write(msg);
  });
  this.websocket.on('close', () => {
    const cur = terminalUser.termPid(term.pid);
    terminalUser.unActive(cur);
    console.log('close %s', term.pid);
    process.kill(term.pid);
    delete terminals[term.pid];
    delete logs[term.pid];
  });
};

const getFilePath = function *(next){
   const filepath = this.query.p;
   const text = fs.readFileSync(filepath, 'utf8');
   this.body = text;
   yield next;
};

const postFilePath = function *(next){
  const path = this.request.body.path;
  const text = this.request.body.data;
  if (path) {
    const uuid = nodeUuid.v4();

    const lastItem = history.lastVer(path);

    history.ext((_this) => {
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

          fsExtra.copySync(path, `${HIS_DIR}${fileUuid}`);
          fs.writeFileSync(path, text, 'utf8');
        });
      });
     }
    this.body = {'success': true};
    yield next;
};

const getTree = function *(next){
  const r = yield tree(DIR);
  this.body = r;
  yield next;
};

module.exports = {
  terminals: {
    post: postTerminals
  },
  terminalsPid: allTerminalsPid,
  filePath: {
    get: getFilePath,
    post: postFilePath
  },
  tree: {
    get: getTree
  }
};
