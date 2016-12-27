'use strict';

APP.service('LocalStorageSrv', [function() {

  return {
    get: function(key) {
      return localStorage.getItem(key);
    },
    set: function(key, val) {
      if (typeof val === 'object') {
        val = JSON.stringify(val);
      }
      return localStorage.setItem(key, val);
    },
    remove: function(key) {
      localStorage.removeItem(key); 
    }
  };
}]);
