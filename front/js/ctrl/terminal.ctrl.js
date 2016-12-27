'use strict';


APP.controller('TerminalCtrl', ['$scope','$timeout', '$rootScope', 'UtilSrv', 'EveSrcSrv', 
    function($scope, $timeout, $rootScope, UtilSrv, EveSrcSrv) {

  var terminal = document.getElementById('terminal');
  var term = null;
  var termOpts = {
    cols: 80,
    rows: 24
  };
  var termPid = null;
  var socket = null;
  var event = null;
  var CLOSE_CODE = 4500;

  $scope.activeUsers = null;

  $rootScope.$on('$routeChangeSuccess', function(ev, toState, fromState){
    if (socket && toState.loadedTemplateUrl !== 'views/terminal.html') {
      socket.close(CLOSE_CODE);
      termPid = null;
      socket = null;
    }
  });

  $scope.init = function() {
    UtilSrv.http.get('/me').then((res) => {
      if (res !== null) {
        createTerminal();
        eventWs();
      }
    });
  };

  var eventWs = function() {
    var protocol= getWsProtcol();
    var socketURL = getWsUrl(protocol, '/event/');
    event = new WebSocket(socketURL);
    event.onmessage = function(ev) {
      var data = JSON.parse(ev.data, undefined);
      if (data.active_users) {
        var users = [];
        angular.forEach(data.active_users, function(val, key){
          users.push(val);
        });
        $scope.$evalAsync(function(){
          console.log(users);
          $scope.activeUsers = users;
        });
      }
    };
  };

  var createTerminal = function() {
    while (terminal.children.length) {
      terminal.removeChild(terminal.children[0]);
    }
    var protocol= getWsProtcol();
    var socketURL = getWsUrl(protocol, '/terminals/');
    var endpoint = '/terminals?cols='+termOpts.cols+'&rows='+termOpts.rows;

    term = new Terminal({
      cursorBlink: true
    });
    term.open(terminal);
    term.fit();

    UtilSrv.http.post(endpoint).then(function(res){
      termPid = res.data.pid;
      socketURL += termPid;
      socket = new WebSocket(socketURL);
      socket.onopen = runRealTerminal;
      socket.onclose = closeTerminal;
      socket.onerror = errorTerminal;
    });
  };

  var runRealTerminal = function() {
    term.attach(socket);
    term._initialized = true;
  };

  var closeTerminal = function(e, a) {
    if (e.code !== CLOSE_CODE) {
      console.log('close');
      $scope.$emit('nof:on', {
        title: 'Disconnected Server',
        msg: 'Communication with the server has been disconnected'
      });
    }
  };

  var errorTerminal = function() {
    console.error('error');
  };

  var getWsProtcol = function() {
    return (location.protocol === 'https') ? 'wss://' : 'ws://';
  };

  var getWsUrl = function(protocol, path) {
    return protocol + location.hostname + ((location.port)? (':' + location.port) : '') + path;
  };

}]);
