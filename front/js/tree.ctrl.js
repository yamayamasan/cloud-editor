APP.controller('TreeCtrl', ['$scope', 'UtilSrv', function($scope, UtilSrv) {
  $scope.init = function() {
    $scope.loadTree();
  };

  $scope.loadTree = function() {
    UtilSrv.http.getJson('/tree', function() {
      var res = JSON.parse(this.responseText);
      $('#left').dynatree({
        onActivate: function(node) {
          if (node.data.isFolder) return;
          UtilSrv.set('tree:openfile', node.data.fullpath);
          var file = UtilSrv.getFileExt(node.data.fullpath);
          if (file.ext === 'json') {
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
    UtilSrv.http.getJson('/filepath/?p=' + path,  function(res){
      $scope.$emit('load:file', {
        data: this.responseText
      });
    });
  };

  $scope.openFile = function(path) {
    UtilSrv.http.get('/filepath', {
      p: path
    }).then(function(res){
      $scope.$emit('load:file', res);
      if (path.split('.').length > 0) {
        var arr = path.split('/');
        $scope.$emit('load:file:name', arr[arr.length - 1]);
      }
    }, function(err){
      $scope.$emit('nof:on', {
        title: 'Failed Open File',
        msg: 'Failed Open File:[' + path + ']'
      });
    });
  };

}]);
