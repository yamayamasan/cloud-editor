'use strict';

const _            = require('lodash');
const co           = require('co');
const fs           = require('fs');
const fsExtra      = require('fs-extra');
const Uuid         = require('uuid');
const pty          = require('pty.js');
const EventEmitter = require('events').EventEmitter;
const tree         = require('../lib/filelist2json.js');
const toTree       = require('../lib/filelist.js');
// const tree         = require('../lib/n_filelist2json.js');
const history      = require('../models/history.js');
const terminalUser = require('../models/terminalUser.js');
const user         = require('../models/User.js');
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
  terminalUser.active(Uuid.v4(), user, userId, term.pid);

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

// deprecated
const getOpenDir = function *(next) {
   const dirpath = this.query.p;
   const list = yield tree(dirpath);
   this.body = list;
   yield next;
};
const getFileTree = function *(next) {
   const dirpath = this.query.p;
   const totree = new toTree(dirpath);
   this.body = totree.fileList();
   yield next;
};
const getDirTree = function *(next) {
   const dirpath = this.query.p;
   const totree = new toTree(dirpath);
   this.body = totree.dirList();
   yield next;
};
const getAllTree = function *(next) {
   const dirpath = this.query.p;
   const totree = new toTree(dirpath);
   this.body = totree.allList();
   yield next;
};

const postFilePath = function *(next){
  const path = this.request.body.path;
  const text = this.request.body.data;
  if (path) {
    const uuid = Uuid.v4();

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
/*
const postRegister = function *(next) {
  const _this = this;
  co(function *(){
    const params = _this.request.body;
    const token = yield user.add(Uuid.v4(), null, params.password, params.email);

    _this.body = JSON.stringify({
      'success': true,
      'token': token,
    });
    yield next;
  });
};
*/
const postRegister = function *(next) {

    const params = this.request.body;
    const token = yield user.add(Uuid.v4(), null, params.password, params.email);

    this.body = JSON.stringify({
      'success': true,
      'token': token,
    });
    yield next;
};

const postLogin = function *(next) {
  const params = this.request.body;
  const token = user.login(params.password, params.email);

  console.log('post:', token);
  const res = {'success': null};
  if (token === false) {
    res.success = false;
    res.message = 'Auth error';
  } else {
    res.success = true;
    res.token   = token;
  }

  this.body = JSON.stringify(res);
  yield next;
};

const getMe = function *(next) {
  this.body = JSON.stringify({"success": true});
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
  filepath: {
    get: getFilePath,
    post: postFilePath
  },
  filetree: {
    get: getFileTree
  },
  dirtree: {
    get: getDirTree
  },
  alltree: {
    get: getAllTree
  },
  opendir: {
    get: getOpenDir
  },
  tree: {
    get: getTree
  },
  regist: {
    post: postRegister
  },
  login: {
    post: postLogin
  },
  me: {
    get: getMe
  },
  execcode: {
    post: postExecCode
  },
  event: {
    get: getEvent
  }
};
