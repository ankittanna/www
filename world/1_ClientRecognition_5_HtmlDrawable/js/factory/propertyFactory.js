(function(){
    angular.module('DigitalAR')
    .factory('PropertyFactory', function($http){
        var propertyDescription = '';

        function setAmenityDescription(description)
        {
            propertyDescription = description;
        }

        function getAmenityDescription()
        {
            return propertyDescription;
        }

        function getProperties(){
            return $http.get('assets/properties.json')
                        .then(function(response) {
                            return response.data;
                        });
        }

        return {
            getProperties: getProperties,
            setAmenityDescription: setAmenityDescription,
            propertyDescription: propertyDescription,
            getAmenityDescription: getAmenityDescription
        };
    });

})();
