'use strict';

const loki = require('lokijs');
const jsonpath = `${__dirname}/../session/store.json`;
function Session() {
  const db = new loki();
  this.user = db.addCollection('user');
}

Session.prototype.insert = function(key, val) {
  val.key = key;
  this.user.insert(val);
};

Session.prototype.findByKey = function(key){
  return this.user.find({'key': key});
};

module.exports = new Session;
