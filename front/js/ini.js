.var APP = angul
ar.module('cloud
        editor', ['ngRou
        te']);.// var AP
P = angular.modu
le('cloud-editor
        ', [require('ang
            ular-route')]);.
.APP.config(['$r
        outeProvider', f
        unction($router)
        {.  $router.when
            ('/', {.    redi
                rectTo: 'editor'
                    .  }).when('/edi
                        tor', {.    temp
                            lateUrl: 'views/
                                editor.html',.  
                                  controller: 'E
                                  ditorCtrl'.  }).
                    when('/terminal'
                            , {.    template
                                Url: 'views/term
                                    inal.html',.    
                                    controller: 'Ter
                                    minalCtrl'.  }).
                    otherwise({.    
                        redirectTo: '/'.
                              });.}]);..
