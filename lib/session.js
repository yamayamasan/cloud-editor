'use strict';

const moment = require('moment');

const loki = require('lokijs');
const jsonpath = `${__dirname}/../session/store.json`;
function Session() {
  const db = new loki();
  this.user = db.addCollection('user');
}

Session.prototype.insert = function(key, val) {
  val.key = key;
  val.exp_date = getTime();
  this.user.insert(val);
};

Session.prototype.findByKey = function(key){
  return this.user.find({'key': key});
};

const getTime = () => {
  return moment().add('days', 30).format('YYYY-MM-DD');
};

module.exports = new Session;
