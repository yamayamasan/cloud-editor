'use strict';
/*
const jwtlib = require('../lib/jwtlib.js');

const token = jwtlib.sign({
  id: 12,
  name: "name"
});

setTimeout(() => {
  const data = jwtlib.verify(token);
  console.log(data);
}, 4000);
*/
const jwt = require('jsonwebtoken');

const token = jwt.sign({
  token: JSON.stringify({id: 1, name: "name"})
}, 'secret', {expiresIn: 3});

console.log(token);
setTimeout(() => {
  try {
    const de = jwt.verify(token, 'secret');
    console.log(de);
  } catch(e) {
    console.log('e:', e);
  }
}, 6000);
