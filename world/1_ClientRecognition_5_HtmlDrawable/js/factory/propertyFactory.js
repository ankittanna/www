(function(){
    angular.module('DigitalAR')
    .factory('PropertyFactory', function($http){
        function getProperties(){
            return $http.get('assets/properties.json')
                        .then(function(response) {
                            return response.data;
                        });
        }

        return {
            getProperties: getProperties
        };
    });

})();
