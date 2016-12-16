'use strict';

const Realm = require('realm');
const Uuid    = require('uuid');
const bcrypt  = require('bcrypt');
const schemas = require('../config/schema.json');
const config  = require('../config/config.json');
const session = require('../lib/session.js');

const NAME = 'User';
function Model() {
  this.realm = new Realm({
    path: 'db/user',
    schema: [schemas.User]
  });
}

Model.prototype.ext = function(cb) {
  cb(this);
};

Model.prototype.add = function(uuid, name, password, email) {
  const isUnique = this.isUniqueEmail(email);
  if (!isUnique) return null;

  const time = new Date();
  const data = {
    uuid: uuid,
    name: name,
    password: hashed(password),
    email: email,
    created_at: time,
    updated_at: time
  };

  this.realm.write(() => {
    this.realm.create(NAME, data);
  });
  
  console.log(this.getUserByEmail(email));

  const sessionKey = Uuid.v1();
  session.insert(sessionKey, {uuid: uuid, name: name});
  return sessionKey;
};

Model.prototype.login = function(password, email) {
  const items = this.getUserByEmail(email);
  if (items.length <= 0) return null;
  const item = items[0];

  const isAuth = compare(item.password);
  if (isAuth) {
    const sessionKey = Uuid.v1();
    session.insert(sessionKey, {uuid: item.uuid, name: item.name});
    return sessionKey;
  }
  return null;
};

Model.prototype.isUniqueEmail = function(email) {
  const item = this.getUserByEmail(email);
  if (item.length > 0) return false;
  return true;
};

Model.prototype.getUserByEmail = function(email) {
  const cond = `email == "${email}" AND is_delete == false`;
  return this.realm.objects(NAME).filtered(cond);
};

const hashed = (text) => {
  try {
    const salt = bcrypt.genSaltSync(config.auth.rounds);
    const hash = bcrypt.hashSync(text, salt);
    return hash;
  } catch(err) {
    throw new Error(err);
  }
};

const compare = (text) => {
  const hash = hashed(text);
  return bcrypt.compareSync(text, hash);
};

module.exports = new Model;
