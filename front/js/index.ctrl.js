'use strict';

APP.controller('IndexCtrl', ['$scope', 'UtilSrv', function($scope, UtilSrv) {

  $scope.init = function() {
    UtilSrv.set('index:height', $(window).height());
  };

}]);
