'use strict';

APP.service('UtilSrv', ['$http', function($http) {

  /**
   * key name pattern is [ctrlname:action]
   */
  var cache = {};

  return {
    set: function(key, val) {
      cache[key] = val;
    },
    get: function(key) {
      return cache[key];
    },
    getFileExt: function(file){
      var fileArray = file.split('/').pop().split('.');
      if (fileArray.length > 2) {
        var ext = fileArray.pop();
        var file = fileArray.join('.');
        return {
          file: file,
          ext: ext
        };
      }
      return null;
    },
    http: {
      get: function(path, params) {
        return $http({
          method: 'GET',
          url: path,
          params: params
        });
      },
      post: function(path, params) {
        return $http({
          method: 'POST',
          url: path,
          data: params || null,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          },
          transformRequest: function(data) { return $.param(data); }
        });
      },
      getJson: function(path, cb) {
        var http = new XMLHttpRequest();
        http.open('GET', path)
        http.onload = cb;
        http.send(null);
      }
    }
  };
}]);
