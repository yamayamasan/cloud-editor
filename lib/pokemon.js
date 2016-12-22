'use strict';

const Pokemon = require('machinepack-pokemon');
const co = require('co');
const _  = require('lodash');

function pokemon() {
}

pokemon.prototype.getRand = function() {
  const _this = this;
  return co(function *(){
    const list = yield _this.setList();
    const n = _.random(0, list.length - 1);
    const id = list[n].id;

  return new Promise((resolve, reject) => {
    const a = Pokemon.getPokemon({id: id}).exec({
      error: (err) => {
        reject(err);
      },
      success: (res) => {
        resolve(res);
      }
    });
  });
  });
};

pokemon.prototype.setList = function() {
  return new Promise((resolve, reject) => {
    Pokemon.listAllPokemon().exec({
      error: (res) => {
        reject(res);
      },
      success: (res) => {
        resolve(res);
      }
    });
  });
};

module.exports = new pokemon;
