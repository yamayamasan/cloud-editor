'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/config.json');

function JwtLib() {
  this.secret = config.auth.secret;
}

JwtLib.prototype.sign = function(data, expire = null){
  if (expire === null) expire = (60 * 60 * 24) * 7;

  const token = jwt.sign({token: JSON.stringify(data)}, this.secret, {expiresIn: expire});

  return token;
};

JwtLib.prototype.verify = function(token) {
  try {
    const decoded = jwt.verify(token, this.secret);
    return JSON.parse(decoded.token);
  } catch(e) {
    return false;
  }
};

module.exports = new JwtLib;
