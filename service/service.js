'use strict';

const _            = require('lodash');
const fs           = require('fs');
const fsExtra      = require('fs-extra');
const uuid         = require('uuid');
const pty          = require('pty.js');
const EventEmitter = require('events').EventEmitter;
const tree         = require('../lib/filelist2json.js');
// const tree         = require('../lib/n_filelist2json.js');
const history      = require('../models/history.js');
const terminalUser = require('../models/terminalUser.js');
const ev           = new EventEmitter();

const config = require('../config/config.json');
const DIR = config.dir;
const HIS_DIR = `${__dirname}/../history`;

const terminals = {};
const logs = {};

const init = function() {
  const users = terminalUser.activeUsers();
  terminalUser.unActives(users);
};

const postTerminals = function *() {
  const term = pty.spawn(process.platform === 'win32' ? 'cmd.exe' : 'bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: config.home || process.env.HOME,
    env: process.env
  });
  terminals[term.pid] = term;
  logs[term.pid] = '';
  term.on('data', (data) => {
    logs[term.pid] += data;
  });

  const user = 'user';
  const userId = 1;
  terminalUser.active(uuid.v4(), user, userId, term.pid);

  const users = terminalUser.activeUsers();
  this.body = JSON.stringify({
    pid: term.pid.toString(),
    active_users: users
  });
};

const allTerminalsPid = function *(pid, next) {
  const term = terminals[parseInt(pid)];

  fs.watch(`${__dirname}/../config/config.json`, (ev, fname) => {
    console.log(ev, fname);
  });

  this.websocket.send(logs[term.pid]);
  term.on('data', (data) => {
    try {
      this.websocket.send(data);
    } catch(ex) {
      console.error(ex);
    }
  });
  let line = '';
  this.websocket.on('message', (msg) => {
    if (msg.match(/[\r|\r\n]/)) {
      line = '';
    } else {
      line = `${line}${msg}`;
    }
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

// deprecated
const getOpenDir = function *(next) {
   const dirpath = this.query.p;
   const list = yield tree(dirpath);
   this.body = list;
   yield next;
};

const postFilePath = function *(next){
  const path = this.request.body.path;
  const text = this.request.body.data;
  if (path) {
    const uuid = uuid.v4();

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

const postExecCode = function *(next) {
  const text = this.request.body.text;
  const exec = require('child_process').execSync;

  let r = null;
  try {
    fs.writeFileSync('/tmp/1234.js', text);
    r = exec('node /tmp/1234.js');
    r = r.toString();
  } catch(e) {
    r = e.stderr.toString();
  } finally {
    fs.unlinkSync('/tmp/1234.js');
  }
  this.body = r;
};

const getTree = function *(next){
  const r = yield tree(DIR);
  this.body = r;
  yield next;
};

const getEvent = function *(next) {
  terminalUser.ext((_this) => {
    _this.realm.objects('TerminalUser').filtered('active == true').addListener((p, c, d) => {
      if (c.insertions.length > 0) {
      }
      if (c.modifications.length > 0) {
      }
    });
  });

  this.websocket.on('message', (msg) => {
    this.body = msg;
  });
  this.websocket.on('close', () => {
  });
};

module.exports = {
  init: init,
  terminals: {
    post: postTerminals
  },
  terminalsPid: allTerminalsPid,
  filePath: {
    get: getFilePath,
    post: postFilePath
  },
  openDir: {
    get: getOpenDir
  },
  tree: {
    get: getTree
  },
  execCode: {
    post: postExecCode
  },
  event: {
    get: getEvent
  }
};
