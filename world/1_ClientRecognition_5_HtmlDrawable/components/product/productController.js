(function(){
        angular.module('DigitalAR')
        .controller('ProductController', function($scope, $ionicPopup, $state, $ionicSlideBoxDelegate){
            console.log("Loading the Product controller");

            var vm = this;

            vm.requestCallback = function(){
               $ionicPopup.alert({
                    title: 'Request Received!',
                    template: 'Thank you for reaching out to us! We will get back to you!'
                });
            };

            vm.customize = function(){

            };

            vm.readMore = function(){
                $state.go('readMore');
            };

            vm.backToHome = function(){
                $state.go('homeScreen');
            };

              $scope.next = function() {
                $ionicSlideBoxDelegate.next();
              };
              $scope.previous = function() {
                $ionicSlideBoxDelegate.previous();
              };

              // Called each time the slide changes
              $scope.slideChanged = function(index) {
                $scope.slideIndex = index;
              };
        });
})();