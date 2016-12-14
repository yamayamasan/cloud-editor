const fs = require('fs');
const path = require('path');

const imgpath = '/img/icons/48px/';
const frontpath = `${__dirname}/../front`;

let onlyDir = false;
const walk = function(p, callback){
  const results = [];

  fs.readdir(p, function (err, files) {
    if (err) throw err;

    var pending = files.length;
    if (!pending) return callback(null, results); //全てのファイル取得が終わったらコールバックを呼び出す

    files.map(function (file) { //リスト取得
      return path.join(p, file);
    }).filter(function (file) {
      if(fs.statSync(file).isDirectory()) walk(file, function(err, res) { //ディレクトリだったら再帰
        results.push({title:path.basename(file), isFolder: true, children:res}); //子ディレクトリをchildrenインデックス配下に保存
        if (!--pending) callback(null, sort(results));
      });
      return fs.statSync(file).isFile();
    }).forEach(function (file) { //ファイル名を保存
      if (!onlyDir) {
      var stat = fs.statSync(file);
      var icon = setIconPath(file);
      results.push({title:path.basename(file), size:stat.size, fullpath: file, icon: icon});
      }
      if (!--pending) callback(null, sort(results));
    });

  });
};

const sort = (results) => {
  let dirs  = [];
  let files = [];
  results.forEach((res) => {
    if (res.isFolder) {
      dirs.push(res);
    } else {
      files.push(res);
    }
  });
  return dirs.concat(files);
};

const setIconPath = (file) => {
  const ext = path.extname(file).replace(/^\./, '');
  const iconPath = `${imgpath}${ext}.png`;
  try {
    const stat = fs.statSync(`${frontpath}${iconPath}`);
    return iconPath;
  } catch(e) {}
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
