'use strict';

const jwtlib  = require('./jwtlib.js');

module.exports = (url) => {

  const reg = new RegExp(url);
  return function *appAuth(next) {
    if (reg.test(this.url) && this.url !== '/api/login' && this.url !== '/api/regist') {
      const auth = this.header.authorization;
      if (!auth) this.throw(401, 'JWT-ERROR');

      const token = auth.replace(/^Bearer /, '');

      if (jwtlib.verify(token)) {
        yield next;
      } else {
        this.throw(401, 'JWT-ERROR');
      }
    } else {
      yield next;
    }
  };
};
