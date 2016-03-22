(function(){
        angular.module('DigitalAR')
                .controller('ReadMoreController', function($state, PropertyFactory){
                    console.log("Loading the ReadMore controller");
                    var vm = this;
                    vm.currentAmenityDescription = '';

                    vm.currentAmenityDescription = PropertyFactory.getAmenityDescription();

                    vm.back = function(){
                        $state.go('productScreen');
                    };
                });

})();