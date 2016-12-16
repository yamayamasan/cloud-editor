APP.controller('TreeCtrl', ['$scope', 'UtilSrv', function($scope, UtilSrv) {
  $scope.dirChildren = null;

  $scope.init = function() {
    $scope.loadTree();
  };

  $scope.loadTree = function() {
    UtilSrv.http.getJson('/tree', function() {
      var res = JSON.parse(this.responseText);
      $scope.dirChildren = res.children;
      console.log(res.children);
      $('#left').dynatree({
        onActivate: function(node) {
          // if (node.data.isFolder) return openDir(node);
          if (node.data.isFolder) return ;
          UtilSrv.set('editor:opend.file', node.data.fullpath);
          var file = UtilSrv.getFileExt(node.data.fullpath);
          if (file.ext === 'json') {
            $scope.openJsonFile(node.data.fullpath);
          } else {
            $scope.openFile(node.data.fullpath);
          }
        },
        persist: false,
        children:$scope.dirChildren
      });
    }, function(status, err){
      console.log(status);
      console.log(err);
    });
  };

  $scope.openJsonFile = function(path) {
    UtilSrv.http.getJson('/filepath/?p=' + path,  function(res){
      $scope.$emit('load:file', {
        path: path,
        data: this.responseText
      });
    });
  };

  $scope.openFile = function(path) {
    UtilSrv.http.get('/filepath', {
      p: path
    }).then(function(res){
      $scope.$emit('load:file', {
        path: path,
        data: res.data
      });
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

  var openDir = function(node) {
    UtilSrv.http.get('/opendir', {
      p: node.data.fullpath
    }).then(function(res){
      $(node.li).dynatree({
        childList: res.data.children,
        persist: false
      });
      node.render();
    });
  };

}]);
