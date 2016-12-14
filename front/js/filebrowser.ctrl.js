

APP.controller('FileBrowserCtrl', ['$scope','$timeout', 'UtilSrv', function($scope, $timeout, UtilSrv) {

  $scope.init = function() {
    getFolderList();
  };

  var getFolderList = function() {
    var url = '/openDir?p=/home/as-smt/Devs/src/electron/cloud-editor&dir=1'
    UtilSrv.http.getJson(url, function() {
      var res = JSON.parse(this.responseText);
      $scope.dirChildren = res.children;
      console.log(res.children);
      $('#left').dynatree({
        onActivate: function(node) {
        },
        persist: false,
        children:$scope.dirChildren
      });
    }, function(status, err){
      console.log(status);
      console.log(err);
    });
  };
}]);
