var APP = angular.module('cloudeditor', ['ngRoute']);
APP.config(['$routeProvider', function($router){
  $router.when('/', {
    redirectTo: 'editor'
  }).when('/editor', {
    templateUrl: 'views/editor.html',
    controller: 'EditorCtrl'
  }).when('/terminal', {
    templateUrl: 'views/terminal.html',
    controller: 'TerminalCtrl'
  }).otherwise({
    redirectTo: '/'
  });
}]);
