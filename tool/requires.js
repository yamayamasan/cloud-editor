'use strict';

const fs  = require('fs');
const fse = require('fs-extra');
const readline = require('readline');

function requires(root = null) {
  if (root === null) process.exit(1);

  const files = fse.walkSync(root);

  const list = [];
  files.map((filepath, idx) => {
    let rs = fs.ReadStream(filepath);
    let rl = readline.createInterface({'input': rs, 'output': {}});
    rl.on('line', (line) => {
      if (line.match('require')) {
        const mat = line.match(/require\((.*)\)/);
        if (mat === null) return null;

        if (!mat[1].match(/^\'\./)) {
          list.push(mat[1]);
        }
      }
    });
    rl.resume();
  });
  console.log(list);
}

const root = "/home/as-smt/Devs/src/electron/cloud-editor/server";
requires(root);
