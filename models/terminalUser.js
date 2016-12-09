'use strict';

const Realm = require('realm');
const schemas = require('../config/schema.json');

const NAME = 'TerminalUser';
function Model() {
  this.realm = new Realm({
    path: 'db/terminal',
    schema: [schemas.TerminalUser]
  });
}

Model.prototype.ext = function(cb) {
  cb(this);
};

Model.prototype.active = function(uuid, user, userId, termPid) {
  const time = new Date();
  const data = {
    uuid: uuid,
    user: user,
    user_id: userId,
    term_pid: termPid.toString(),
    active: true,
    created_at: time,
    updated_at: time
  };

  this.realm.write(() => {
    this.realm.create(NAME, data);
  });
};

Model.prototype.activeUsers = function(){
  return this.realm.objects(NAME).filtered(`active == true`);
};

Model.prototype.termPid = function(pid){
  const item = this.realm.objects(NAME).filtered(`term_pid == "${pid}"`);
  if (item.length > 0) return item[0];
  return null;
};

Model.prototype.unActive = function(user) {
  this.realm.write(() => {
    user.active = false;
    user.updated_at = new Date();
  });
};


module.exports = new Model;
