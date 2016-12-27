'use strict';

const jwtlib  = require('./jwtlib.js');

module.exports = (url) => {

  const reg = new RegExp(url);
  return function *appAuth(next) {
    if (reg.test(this.url) && this.url !== '/api/login' && this.url !== '/api/regist') {
      const auth = this.header.authorization;
      if (!auth) this.throw(401);

      const token = auth.replace(/^Bearer /, '');

      console.log('token:', token);
      console.log(jwtlib.verify(token));
      if (jwtlib.verify(token)) {
        yield next;
      } else {
        this.throw(401);
      }
    } else {
      yield next;
    }
  };
};
