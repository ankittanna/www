(function(){
        angular.module('DigitalAR')
        .controller('ProductController', function($scope, $ionicPopup, $state, $ionicSlideBoxDelegate, PropertyFactory){
            console.log("Loading the Product controller");

            var vm = this;
            vm.downpaymentRange = 20;

            vm.properties = [];
            vm.currentProperty = {};
            vm.selectedProperty = '2BHK';

            activate();


            function activate()
            {
                PropertyFactory.getProperties().then(function(data){
                    vm.properties = data.properties;
                    vm.currentProperty = vm.properties[0];
                }).catch(function(err){
                    alert(JSON.stringify(err))
                });
            }

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

            var totalPropertyCost = 0;
            var requiredPropertySize = 0;
            var requiredPropertyPerSqFtCost = 0;
            var requiredLoanAmount = 0;
            var emiAmount = 0;

            vm.calculateEMIRange = function(){
                // vm.downpaymentRange
                if(vm.selectedProperty === '2BHK')
                {
                    requiredPropertySize = vm.currentProperty.propertyType[0].size;
                    requiredPropertyPerSqFtCost = vm.currentProperty.propertyType[0].costPerSqFt;

                } else if(vm.selectedProperty === '3BHK')
                {
                    requiredPropertySize = vm.currentProperty.propertyType[1].size;
                    requiredPropertyPerSqFtCost = vm.currentProperty.propertyType[1].costPerSqFt;
                }

                 totalPropertyCost = requiredPropertyPerSqFtCost*requiredPropertySize;
                 requiredLoanAmount = totalPropertyCost - (totalPropertyCost*vm.downpaymentRange)/100;

                 var roi = 9.5/1200;
                 // assuming 20 yrs*12 = 240 months
                 vm.emiAmount = emiAmount = (requiredLoanAmount*roi*(Math.pow(1+roi, 240)))/(Math.pow(1+roi,240-1));

                 console.log(emiAmount + "<----------");

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
                vm.currentProperty = vm.properties[index];
              };

              var tabClasses;

                        function initTabs() {
                          tabClasses = ["","","",""];
                        }

                        $scope.getTabClass = function (tabNum) {
                          return tabClasses[tabNum];
                        };

                        $scope.getTabPaneClass = function (tabNum) {
                          return "tab-pane " + tabClasses[tabNum];
                        }

                        $scope.setActiveTab = function (tabNum) {
                          initTabs();
                          tabClasses[tabNum] = "active";

                          if(tabNum === 1)
                          {
                              vm.selectedProperty = '2BHK';
                          } else if(tabNum === 2)
                          {
                              vm.selectedProperty = '3BHK';
                          }
                        };

                        $scope.tab1 = "This is first section";
                        $scope.tab2 = "This is SECOND section";
                        $scope.tab3 = "This is THIRD section";
                        $scope.tab4 = "This is FOUTRH section";

                        //Initialize
                        initTabs();
                        $scope.setActiveTab(1);
        })
        .controller('TestCtrl', function($scope){

        });
})();