'use strict';


APP.controller('EditorCtrl', ['$scope','$timeout', 'UtilSrv','AceSrv', function($scope, $timeout, UtilSrv, AceSrv) {

  var editor = null;
  $scope.sldmode = {
    name: null,
    object: null
  };
  $scope.sldtheme = null;

  $scope.init = function() {
    var height = UtilSrv.get('index:height');
    $('#editor').css('height', height - 91);
    $('.sidebar').slimScroll({
      height: height - 40
    });
    initSettings();
    /*
    $timeout(function() {
      $('#modelist').select2();
    }, 300);
    */
    AceSrv.init('editor');
  };

  $scope.remove = function() {
    UtilSrv.http.post('remove', {
      path: UtilSrv.get('editor:open.file')
    }).then(function(res){
      $scope.$emit('nof:on', {
        title: 'Remove File',
        msg: 'Success Remove File'
      });
      openNewfile();
    });
  };

  $scope.newfile = function() {
    openNewfile();
  };

  $scope.modal = function() {
    $('#modal').modal();
  };

  $scope.save = function() {
    var filepath = UtilSrv.get('editor:opend.file');
    if (angular.equals(filepath, 'newfile')) {

    } else {
      UtilSrv.http.post('/filepath',{
       path: filepath,
       data: AceSrv.immed().getValue()
      }).then(function(res){
        $scope.$emit('nof:on', {
          title: 'Saved File',
          msg: 'Success Save File'
        });
      });
    }
  };

  $scope.exec = function() {
    var text = AceSrv.immed().getValue();
    UtilSrv.http.post('/exec_code', {
      text: text
    }).then(function(res){
      console.log(res);
    });
  }

  $scope.$watch('sldmode', function(e){
    if (e.object === null) return;
    AceSrv.immed().getSession().setMode(e.object.mode);
  });

  $scope.$watch('sldtheme', function(e){
    if (e === null) return;
    var theme = $scope.themelist.themesByName[e];
    AceSrv.immed().setTheme(theme.theme);
  });

  $scope.$on('open:file', function(e, args){
    var path = UtilSrv.get('editor:opend.file');
    var mode = AceSrv.getModePath(path);
    // http://blog.all-in.xyz/2015/12/26/understanding-angulars-apply-and-digest/
    $scope.$evalAsync(function() {
      $scope.sldmode = {
        name: mode.name,
        object: mode
      };
      AceSrv.immed().setValue(toStr(args.data), -1);
    });
  });

  var initSettings = function() {
    $scope.modelist = AceSrv.modeList();
    $scope.themelist = AceSrv.themeList();
  }

  var openNewfile = function() {
    AceSrv.immed().setValue('', -1);
    UtilSrv.set('editor:opend.file', 'newfile');
  };

  var toStr = function(org) {
    var r = org;
    switch (typeof org) {
      case 'object':
        r = JSON.stringify(org, undefined, 2);
      break;
    }
    return r;
  };
}]);
