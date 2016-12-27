'use strict';

const history = require('../models/history.js');
const terminal = require('../models/terminalUser.js');

history.ext((_this) => {
  _this.realm.objects('History').addListener((p, c) => {
    console.log('History');
    console.log(c);
    if (c.insertions.length > 0) {
      // console.log(p);
    }
  });
});

terminal.ext((_this) => {
  _this.realm.objects('TerminalUser').addListener((p, c) => {
    console.log('TerminalUser');
    console.log(c);
    c.insertions.forEach((i, v) => {
      console.log(p[i]);
    });
    if (c.insertions.length > 0) {
      // console.log(p);
    }
  });
});
