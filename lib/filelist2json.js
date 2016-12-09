const fs = require('fs');
const path = require('path');
const dir = process.argv[2] || '.'; //引数が無いときはカレントディレクトリを対象とする

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
        if (!--pending) callback(null, results);
      });
      return fs.statSync(file).isFile();
    }).forEach(function (file) { //ファイル名を保存
      var stat = fs.statSync(file);
      results.push({title:path.basename(file), size:stat.size, fullpath: file});
      if (!--pending) callback(null, results);
    });

  });
};

module.exports = function(dir){
  return new Promise((resolve, reject) => {
    walk(dir, function(err, results) {
      if (err) throw err;
      var data = {name:'root', children:results};
      resolve(JSON.stringify(data));
    });
  });
};
