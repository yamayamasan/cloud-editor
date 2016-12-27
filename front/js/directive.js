'use strict';

APP.directive('modalInclude', ['$http', '$compile', function($http, $compile){
  return function(scope, element, attr){
    $http.get(attr.modalInclude).then(function(res){
      element.html(res.data);
      $compile(element.contents())(scope);
    });
  };
}]);
