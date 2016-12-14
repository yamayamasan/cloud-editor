var APP = angular.module('cloudeditor', ['ngRoute']);
APP.config(['$routeProvider', function($router){
  $router.when('/', {
    redirectTo: 'editor'
  }).when('/login', {
    templateUrl: 'views/login.html',
    controller: 'LoginCtrl'
  }).when('/filebrowser', {
    templateUrl: 'views/filebrowser.html',
    controller: 'FileBrowserCtrl'
  }).when('/editor', {
    templateUrl: 'views/editor.html',
    controller: 'EditorCtrl'
  }).when('/terminal', {
    templateUrl: 'views/terminal.html',
    controller: 'TerminalCtrl'
  }).when('/settings', {
    templateUrl: 'views/settings.html',
    controller: 'SettingsCtrl'
  }).otherwise({
    redirectTo: '/'
  });
}]);
