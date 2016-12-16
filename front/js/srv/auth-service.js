'use strict';

APP.service('AuthSrv', ['UtilSrv', 'LocalStorageSrv', function(UtilSrv, StorageSrv){

    var url = {
      login: '/login',
      regist: '/regist'
    };
    return {
      isAuthed: function() {
        var token = StorageSrv.get('token');
        if (token) return true;
        return false;
      },
      regist: function(params, cb){
        UtilSrv.http.post(url.regist, params).then(function(res){
          StorageSrv.set('token', res.data.token);
          cb(res);
        });
      },
      login: function(params){
        UtilSrv.http.post(url.login, params).then(function(res){
          if (res.data.token !== null) {
          StorageSrv.set('token', res.data.token);
          }
          cb(null);
        });
      }
    };
}]);
