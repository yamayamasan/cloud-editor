'use strict';

const JavaScript = require('machinepack-javascript');
const program = require('commander');
const _ = require('lodash');
const fs = require('fs');

program
    .version('1.0.0')
    .option('-m, --minify [value]', 'minify')
    .parse(process.argv);

const funcs = {
  minify: (args) => {
    const path = args;
    try {
      fs.statSync(path);
    } catch(e) {
      console.log(e);
      process.exit(1);
    }
    const data = fs.readFileSync(path).toString();
    const minified = JavaScript.minify({
      javascript: data
    }).execSync();

    console.log(minified);
  }
};


_.forEach(funcs, (func, key) => {
  if (program[key]) func(program[key]);
});

