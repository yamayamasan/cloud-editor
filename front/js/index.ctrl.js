'use strict';

APP.controller('IndexCtrl', ['$scope', '$timeout', 'UtilSrv', function($scope, $timeout, UtilSrv) {

  $scope.nof = {
    title: null,
    msg: null,
    view: false
  };

  $scope.init = function() {
    UtilSrv.set('index:height', $(window).height());
  };

  $scope.$on('load:file', function(e, a){
    $scope.$broadcast('open:file', a);
  });

  $scope.$on('nof:on', function(e, a){
    $scope.nof = {
      title: a.title,
      msg: a.msg,
      view: true
    };
    $timeout(function(){
      $scope.nof = {
        title: null,
        msg: null,
        view: false
      };
    }, 4000);
  });
}]);
