'use strict';

const _       = require('lodash');
const co      = require('co');
const Realm   = require('realm');
const Uuid    = require('uuid');
// const bcrypt  = require('bcrypt');
const schemas = require('../config/schema.json');
const config  = require('../config/config.json');
const pokemon = require('../lib/pokemon.js');
const appCryp = require('../lib/appCrypto.js');

const jwtlib  = require('../lib/jwtlib.js');

const NAME = 'User';
const HASH_ALGORITHM = 'aes-256-ctr';

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
  return co(function *() {
    const isUnique = _this.isUniqueEmail(email);
    if (!isUnique) return null;
/*
    if (name === null) {
      const pk = yield pokemon.getRand();
      name = pk.name;
    }
*/
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

  const isAuth = compare(item.password, password);
  if (isAuth) {
    return jwtlib.sign(_.omit(item, 'password', 'created_at', 'updated_at'));
  }
  return false;
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
    return appCryp.encode(text);
  } catch(err) {
    throw new Error(err);
  }
};

const compare = (hash, text) => {
  const isCompare = appCryp.compare(text, hash);
  console.log('isCompare:', isCompare);
  return isCompare;
};

const hashedBcrypt = (text) => {
  try {
    const salt = bcrypt.genSaltSync(config.auth.rounds);
    const hash = bcrypt.hashSync(text, salt);
    return hash;
  } catch(err) {
    throw new Error(err);
  }
};

const compareBcrypt = (text) => {
  const hash = hashed(text);
  return bcrypt.compareSync(text, hash);
};

module.exports = new Model;
