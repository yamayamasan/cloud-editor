'use strict';

const co = require('co');
const pokemon = require('../lib/pokemon.js');

co(function *() {
  const pk = yield pokemon.getRand();
  console.log('pk', pk);
}).catch(function(err) {
  console.log(err);
});
