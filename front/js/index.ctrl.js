'use strict';

APP.controller('IndexCtrl', ['$scope', 'UtilSrv', function($scope, UtilSrv) {

  $scope.init = function() {
    UtilSrv.set('index:height', $(window).height());
  };

  $scope.$on('load:file', function(e, a){
    $scope.$broadcast('open:file', a.data);
  });
}]);
