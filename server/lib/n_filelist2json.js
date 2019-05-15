'use stirct';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

function list(dir) {
  const dirs = fs.readdirSync(dir);
  const items = [];
  _.forEach(dirs, (val, idx) => {
    const fullpath = path.join(dir, val);
    const stats = fs.statSync(fullpath);
    
    items.push({
      title: val,
      fullpath: fullpath,
      isFolder: stats.isDirectory()
    });
  });
  return items;
}

module.exports = (dir) => {
  return new Promise((resolve, reject) => {
    const children = list(dir);
    const data = {
      name: 'root',
      children: children
    }
    resolve(data);
  });
}
