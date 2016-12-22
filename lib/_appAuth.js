'use strict';

const session = require('./session.js');
const moment  = require('moment');

module.exports = (url) => {

  const compare = (key) => {
    const ses = session.findByKey(key);
    if (ses.length <= 0) return false;

    const is =  !moment().isAfter(moment(ses[0].exp_date));
    return is;
  };

  const reg = new RegExp(url);
  return function *appAuth(next) {
    if (reg.test(this.url) && this.url !== '/api/login') {
      const auth = this.header.authorization;
      if (!auth) this.throw(401);

      const token = auth.replace(/^Bearer /, '');

      if (compare(token)) {
        yield next;
      } else {
        this.throw(401);
      }
    } else {
      yield next;
    }
  };
};
