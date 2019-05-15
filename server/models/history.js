'use strict';

const Realm = require('realm');
const schemas = require('../config/schema.json');

function Model() {
  this.realm = new Realm({
    path: 'db/history',
    schema: [schemas.History]
  });
}

Model.prototype.ext = function(cb) {
  cb(this);
};

Model.prototype.add = function(uuid, file, version, auther) {
  // const uuid = nodeUuid.v4();
  const time = new Date();
  const data = {
    uuid: uuid,
    file: file,
    file_uuid: `${file}_${uuid}`,
    created_at: time,
    updated_at: time
  };
  if (auther) data.auther = auther;
  if (version) data.version = version;

  this.realm.write(() => {
    this.realm.create('History', data);
  });
};

Model.prototype.lastVer = function(path){
  const item = this.realm.objects('History').filtered(`file== "${path}"`);
  const items = item.sorted('version');
  let lastItem = null;
  console.log(items);
  if (items.length > 0) {
    const length = items.length;
    lastItem = items[length - 1];
  }
  return lastItem;
};


function toArray(schemas) {
  const array = [];
  Object.keys(schemas).forEach((key) => {
    array.push(schemas[key]);
  });
  return array;
}

module.exports = new Model;
