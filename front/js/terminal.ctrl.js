'use strict';


APP.controller('TerminalCtrl', ['$scope','$timeout', '$rootScope', 'UtilSrv', function($scope, $timeout, $rootScope, UtilSrv) {

  var terminal = document.getElementById('terminal');
  var term = null;
  var termOpts = {
    cols: 80,
    rows: 24
  };
  var termPid = null;
  var socket = null;

  $rootScope.$on('$routeChangeSuccess', function(ev, toState, fromState){
    if (toState.loadedTemplateUrl !== 'views/terminal.html') {
      socket.close(4500);
      termPid = null;
      socket = null;
    }
  });

  $scope.init = function() {
    createTerminal();
  };

  var createTerminal = function() {
    while (terminal.children.length) {
      terminal.removeChild(terminal.children[0]);
    }
    var protocol = (location.protocol === 'https') ? 'wss://' : 'ws://';
    var socketURL = protocol + location.hostname + ((location.port)? (':' + location.port) : '') + '/terminals/';
    var endpoint = '/terminals?cols='+termOpts.cols+'&rows='+termOpts.rows;

    term = new Terminal();
    term.open(terminal);
    term.fit();

    UtilSrv.http.post(endpoint).then(function(res){
      console.log(res);
      termPid = res.pid;
      socketURL += termPid;
      console.log(socketURL);
      socket = new WebSocket(socketURL);
      socket.onopen = runRealTerminal;
      socket.onclose = closeTerminal;
      socket.onerror = errorTerminal;
      socket.onmessage = function(e) {
        console.log(e);
      }
    });
  };

  var runRealTerminal = function() {
    term.attach(socket);
    term._initialized = true;
  };

  var closeTerminal = function() {
    console.log('close');
  };

  var errorTerminal = function() {
    console.error('error');
  };

}]);
