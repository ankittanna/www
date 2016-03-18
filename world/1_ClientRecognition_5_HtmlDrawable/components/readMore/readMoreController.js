(function(){
        angular.module('DigitalAR')
                .controller('ReadMoreController', function($state){
                    console.log("Loading the ReadMore controller");
                    var vm = this;

                    vm.back = function(){
                        $state.go('productScreen');
                    };
                });

})();