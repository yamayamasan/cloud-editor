'use strict';

const _       = require('lodash');
const Realm   = require('realm');
const Uuid    = require('uuid');
const bcrypt  = require('bcrypt');
const schemas = require('../config/schema.json');
const config  = require('../config/config.json');
const pokemon = require('../lib/pokemon.js');

const jwtlib  = require('../lib/jwtlib.js');

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
  const _this = this;
  co(function *() {
  const isUnique = _this.isUniqueEmail(email);
  if (!isUnique) return null;

  if (name === null) {
    const pk = yield pokemon.getRand();
    name = pk.name;
  }

  const time = new Date();
  const data = {
    uuid: uuid,
    name: name,
    password: hashed(password),
    email: email,
    created_at: time,
    updated_at: time
  };

  _this.realm.write(() => {
    _this.realm.create(NAME, data);
  });

  return jwtlib.sign(_.omit(data, 'password', 'created_at', 'updated_at'));
  });
};

Model.prototype.login = function(password, email) {
  const items = this.getUserByEmail(email);
  if (items.length <= 0) return false;
  const item = items[0];

  const isAuth = compare(item.password);
  if (isAuth) {
    return jwtlib.sign(_.omit(item, 'password', 'created_at', 'updated_at'));
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
