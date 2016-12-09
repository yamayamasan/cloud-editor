APP.controller('TreeCtrl', ['$scope', 'UtilSrv', function($scope, UtilSrv) {
  $scope.init = function() {
    $scope.loadTree();
  };

  $scope.loadTree = function() {
    UtilSrv.getHttp('/tree', {}, function(res) {
      $('#left').dynatree({
        onActivate: function(node) {
          if (node.data.isFolder) return;
          UtilSrv.set('open_file', node.data.fullpath);
          var ext = UtilSrv.ext(node.data.fullpath);
          if (ext == 'json') {
            $scope.openJsonFile(node.data.fullpath);
          } else {
            $scope.openFile(node.data.fullpath);
          }
        },
        persist: false,
        children: res.children
      });
    }, function(status, err){
      console.log(status);
      console.log(err);
    });
  };

  $scope.openJsonFile = function(path) {
    UtilSrv.getJson('/filepath/?p=' + path,  function(res){
      $scope.$emit('load:file', res);
    });
  };

  $scope.openFile = function(path) {
    UtilSrv.getHttp('/filepath', {
      p: path
    }, function(res) {
      $scope.$emit('load:file', res);
      if (path.split('.').length > 0) {
        var arr = path.split('/');
        $scope.$emit('load:file:name', arr[arr.length - 1]);
      }
    }, function(){
      $scope.$emit('nof:on', {
        title: 'Failed Open File',
        msg: 'Failed Open File:[' + path + ']'
      });
    });
  };

}]);
