const fs = require('fs');
const path = require('path');

const imgpath = '/img/icons/48px/';
const frontpath = `${__dirname}/../front`;

const ctrl = function(dir) {
  this.dir = dir;
};

ctrl.prototype.dirList = function() {
  return getdirs(this.dir);
}

ctrl.prototype.fileList = function() {
  return getfiles(this.dir);
}

ctrl.prototype.allList = function() {
  const files = getfiles(this.dir);
  const dirs = getdirs(this.dir);

  return dirs.concat(files);
}

const getdirs = function(dir) {
  return fs.readdirSync(dir).filter((file) => {
    const fullpath = path.join(DIR, file);
    return fs.statSync(fullpath).isDirectory();
  }).map((file) => {
    return {
      title: path.basename(file),
      fullpath: path.join(DIR, file),
      isFolder: true
    }
  });
};

const getfiles = function(dir) {
  return fs.readdirSync(dir).filter((file) => {
    const fullpath = path.join(DIR, file);
    return fs.statSync(fullpath).isFile();
  }).map((file) => {
    const icon = setIconPath(file);
    return {
      title: path.basename(file),
      fullpath: path.join(DIR, file),
      icon: icon
    }
  });
};

const setIconPath = (file) => {
  const ext = path.extname(file).replace(/^\./, '');
  const iconPath = `${imgpath}${ext}.png`;
  try {
    const stat = fs.statSync(`${frontpath}${iconPath}`);
    return iconPath;
  } catch(e) {
    return null;
  }
};

module.exports = function(dir, _onlyDir = false){
  return new Promise((resolve, reject) => {
    try {
      onlyDir = _onlyDir;
      const isdir = fs.statSync(dir);
      walk(dir, function(err, results) {
        if (err) throw err;
        const data = {name:'root', children:results};
        resolve(JSON.stringify(data));
      });
    } catch(e) {
      console.log(e);
      reject(e);
    }
  });
};

module.exports = ctrl;
