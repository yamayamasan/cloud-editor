'use strict';

const auth = require('basic-auth');
const assert = require('assert');

module.exports = (url, opts) => {
  opts = opts || {};

  assert(opts.name, 'basic auth .name required');
  assert(opts.pass, 'basic auth .pass required');

  const reg = new RegExp(url);
  return function *basicAuth(next) {
    const user = auth(this);

    if (!reg.test(this.url)) {
      if (user && user.name == opts.name && user.pass == opts.pass) {
        yield next;
      } else {
        this.throw(401);
      }
    }
    yield next;
  };
};
