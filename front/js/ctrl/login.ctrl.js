
var APP = angular.module('cloud-editor', []);

APP.controller('LoginCtrl', ['$scope','$timeout', 'UtilSrv', 'AuthSrv', function($scope, $timeout, UtilSrv, AuthSrv) {

    $scope.formMsg = 'aa';
    $scope.isRegist = false;
    $scope.user = {
      email: null,
      password: null,
      cfnpassword: null
    };
    var msg = {
      login: 'Register a new membership',
      regist: 'Login member'
    };

    $scope.init = function() {
      $scope.toggleFormMsg();
    };

    $scope.submit = function(user) {
      var toHome = function(res) {
        if (res.success === true) location.href = '/'; 
      };
      if ($scope.isRegist) {
        AuthSrv.regist({
          email: user.email,
          password: user.password
        }, toHome);
      } else {
        AuthSrv.login({
          email: user.email,
          password: user.password
        }, toHome);
      }
    }

    $scope.toggleForm = function() {
      $scope.isRegist = !$scope.isRegist;
      $scope.toggleFormMsg();
    };

    $scope.toggleFormMsg = function() {
      $scope.formMsg = ($scope.isRegist)? msg.regist : msg.login;
    };
}]);
