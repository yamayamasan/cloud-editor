'use strict';

const terminal = require('../models/terminalUser.js');
const program = require('commander');

program
    .version('1.0.0')
    .option('-l, --list [value]', 'add item')
    .option('-f, --filter [value]', 'get item')
    .option('-q, --quit', 'get item')
    .parse(process.argv);


if (program.filter) {
  let users;
  switch(program.filter) {
      case 'active':
        users = terminal.activeUsers();
      break;
      case 'not':
        users = terminal.unActiveUsers();
      break;
  }
  console.log(users);
}

if (program.quit) {
  process.exit();
}
