'use strict';


APP.controller('EditorCtrl', ['$scope','$timeout', 'UtilSrv','AceSrv', function($scope, $timeout, UtilSrv, AceSrv) {

  var editor = null;

  $scope.init = function() {
    var height = UtilSrv.get('index:height');

    $('#left').css('height', height - 80);
    $('#editor').css('height', height - 80 -40);
    // $scope.modelist = AceSrv.modeList();
    // $scope.themelist = AceSrv.themeList();
    /*
    $timeout(() => {
      $('#modelist').select2();
    }, 300);
    */
    AceSrv.init('editor');
  };

  $scope.remove = function() {
    UtilSrv.http.post('remove', {
      path: UtilSrv.get('open_file')
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

  $scope.save = function() {
    var filepath = UtilSrv.get('editor:opend.fil');
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

  $scope.$on('open:file', function(e, args){
    AceSrv.immed().setValue(args, -1);
  });

  var openNewfile = function() {
    AceSrv.immed().setValue('', -1);
    UtilSrv.set('editor:opend.file', 'newfile');
  };
}]);
