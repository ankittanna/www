(function(){
    angular.module('DigitalAR', [
        'ionic',
        'LocalStorageModule'
    ]).config(arRouteConfig)
    .run(initializeWorld);

    arRouteConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider'];

    function arRouteConfig($stateProvider, $urlRouterProvider, $ionicConfigProvider)
    {
        $stateProvider
                .state('homeScreen', {
                    url: '/home',
                    templateUrl: 'components/home/home.html',
                    controller: 'HomeController',
                    controllerAs: 'home'
                })
                .state('productScreen', {
                    url: '/product',
                    templateUrl: 'components/product/product.html',
                    controller: 'ProductController',
                    controllerAs: 'product'
                })
                .state('readMore', {
                                    url: '/readMore',
                                    templateUrl: 'components/readMore/readMore.html',
                                    controller: 'ReadMoreController',
                                    controllerAs: 'readMore'
                                });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/home');

        // Do not cache any screen views
        $ionicConfigProvider.views.maxCache(0);
    }
})();