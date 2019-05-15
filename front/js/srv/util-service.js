'use strict';

APP.service('UtilSrv', ['$http', 'LocalStorageSrv', function($http, LocalStorageSrv) {

  /**
   * key name pattern is [ctrlname:action]
   */
  var cache = {};

  var setHeaderToken = function(config) {
    var token = LocalStorageSrv.get('token');
    if (!config || !token) return config;

    var tokenHeader = 'Bearer ' + token;
    if (config.headers) {
      config.headers.Authorization = tokenHeader;
    } else {
      config.headers = {
        Authorization: tokenHeader
      };
    }
    console.log(config);
    return config;
  };

  var getApiPath = function(path) {
    return '/api/' + path.replace(/^\//, '');
  };
  return {
    set: function(key, val) {
      cache[key] = val;
    },
    get: function(key) {
      return cache[key];
    },
    getFileExt: function(file){
      var fileArray = file.split('/').pop().split('.');
      if (fileArray.length > 1) {
        var ext = fileArray.pop();
        var file = fileArray.join('.');
        return {
          file: file,
          ext: ext
        };
      }
     return {
      file: fileArray[0],
      ext: null
     };
    },
    http: {
      get: function(path, params) {
        var config = {
          method: 'GET',
          url: getApiPath(path),
          params: params
        };
        return $http(setHeaderToken(config)).then((res) => {
          return res;
        }, (res) => {
          if (res.status === 401) {
            location.href = "/login.html";
            return null;
          }
          return res;
        });
      },
      post: function(path, params) {
        var config = {
          method: 'POST',
          url: getApiPath(path),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          },
        };
        if (params) {
          config.data = params;
          config.transformRequest = function(data) { 
            return $.param(data); 
          }
        }
        console.log(setHeaderToken(config));
        return $http(setHeaderToken(config));
      },
      getJson: function(path, cb) {
        var http = new XMLHttpRequest();
        var token = LocalStorageSrv.get('token');
        http.open('GET', getApiPath(path));
        if (token) {
          http.setRequestHeader('Authorization', 'Bearer ' + token);
        }
        http.onload = cb;
        http.send(null);
      }
    }
  };
}]);
