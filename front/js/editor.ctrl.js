'use strict';


APP.controller('EditorCtrl', ['$scope','$timeout',  'UtilSrv','AceSrv', function($scope, $timeout, UtilSrv, AceSrv) {

  var editor = null;

  $scope.init = function() {
    var height = UtilSrv.get('height');
    $('#left').css('height', height - 80);
    $('#editor').css('height', height - 80 -40);
    $scope.modelist = AceSrv.modeList();
    // $scope.themelist = AceSrv.themeList();
    $timeout(() => {
      $('#modelist').select2();
    }, 300);
    AceSrv.init('editor');
  };

  $scope.remove = function() {
    var filepeth = UtilSrv.get('open_file');
    UtilSrv.postHttp('/remove', {
      path: filepath
    }, function(res){
      $scope.$emit('nof:on', {
        title: 'Remove File',
        msg: 'Success Remove File'
      });
      UtilSrv.set('open_file', 'newfile');
      AceSrv.immed().setValue('', -1);
    });
  };

  $scope.newfile = function() {
    AceSrv.immed().setValue('', -1);
    UtilSrv.set('open_file', 'newfile');
  };

  $scope.save = function() {
    var filepath = UtilSrv.get('open_file');
    if (filepath === 'newfile') {
    
    } else {
      var text = AceSrv.immed().getValue();
      UtilSrv.postHttp('/filepath', {
       path: filepath,
       data: text
      }, function(res){
        $scope.$emit('nof:on', {
          title: 'Saved File',
          msg: 'Success Save File'
        });
      });
    }
  };

  $scope.$on('open:file', function(e, args){
    AceSrv.immed().setValue(args, -1);
  });
}]);
