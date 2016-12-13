'use stirct';

APP.service('EveSrcSrv', ['$http', function($http) {

  var sources = {};

  return {
    init: function (key, url){
      sources[key] = new EventSource(url);
      return sources[key];
    },
    onMessgae: function (key, cb){
      if (sources[key]) {
        sources[key].onmessgae = cb;
      }
    }
  };
}]);
