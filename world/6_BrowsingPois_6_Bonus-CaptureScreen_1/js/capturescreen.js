function initializeWorld($state)
{
		var PoiRadar = {

    		hide: function hideFn() {
    			AR.radar.enabled = false;
    		},

    		show: function initFn() {

    			// the div defined in the index.htm
    			AR.radar.container = document.getElementById("radarContainer");

    			// set the back-ground image for the radar
    			AR.radar.background = new AR.ImageResource("assets/radar_bg.png");

    			// set the north-indicator image for the radar (not necessary if you don't want to display a north-indicator)
    			AR.radar.northIndicator.image = new AR.ImageResource("assets/radar_north.png");

    			// center of north indicator and radar-points in the radar asset, usually center of radar is in the exact middle of the bakground, meaning 50% X and 50% Y axis --> 0.5 for centerX/centerY
    			AR.radar.centerX = 0.5;
    			AR.radar.centerY = 0.5;

    			AR.radar.radius = 0.3;
    			AR.radar.northIndicator.radius = 0.0;

    			AR.radar.enabled = true;
    		},

    		updatePosition: function updatePositionFn() {
    			if (AR.radar.enabled) {
    				AR.radar.notifyUpdateRadarPosition();
    			}
    		},

    		// you may define some custom action when user pressed radar, e.g. display distance, custom filtering etc.
    		clickedRadar: function clickedRadarFn() {
    			alert("Radar Clicked");
    		},

    		setMaxDistance: function setMaxDistanceFn(maxDistanceMeters) {
    			AR.radar.maxDistance = maxDistanceMeters;
    		}
    	};
	// information about server communication. This sample webservice is provided by Wikitude and returns random dummy places near given location
    var ServerInformation = {
    	POIDATA_SERVER: "https://example.wikitude.com/GetSamplePois/",
    	POIDATA_SERVER_ARG_LAT: "lat",
    	POIDATA_SERVER_ARG_LON: "lon",
    	POIDATA_SERVER_ARG_NR_POIS: "nrPois",
    	POIDATA_SERVER_2: "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

    };

    // implementation of AR-Experience (aka "World")
    var World = {

    	//  user's latest known location, accessible via userLocation.latitude, userLocation.longitude, userLocation.altitude
    	userLocation: null,

    	// you may request new data from server periodically, however: in this sample data is only requested once
    	isRequestingData: false,

    	// true once data was fetched
    	initiallyLoadedData: false,

    	// true when world initialization is done
    	initialized: false,

    	// different POI-Marker assets
    	markerDrawable_idle: null,
    	markerDrawable_selected: null,
    	markerDrawable_directionIndicator: null,

    	// list of AR.GeoObjects that are currently shown in the scene / World
    	markerList: [],

    	// The last selected marker
    	currentMarker: null,

    	locationUpdateCounter: 0,
    	updatePlacemarkDistancesEveryXLocationUpdates: 10,

    	// called to inject new POI data
    	loadPoisFromJsonData: function loadPoisFromJsonDataFn(poiData) {
    		// destroys all existing AR-Objects (markers & radar)
    		AR.context.destroyAll();

    		// show radar & set click-listener
    		PoiRadar.show();
    		$('#radarContainer').unbind('click');
    		$("#radarContainer").click(PoiRadar.clickedRadar);

    		// empty list of visible markers
    		World.markerList = [];

    		// start loading marker assets
    		World.markerDrawable_idle = new AR.ImageResource("assets/marker_idle.png");
    		World.markerDrawable_selected = new AR.ImageResource("assets/marker_selected.png");
    		World.markerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");

    		// loop through POI-information and create an AR.GeoObject (=Marker) per POI
    		for (var currentPlaceNr = 0; currentPlaceNr < poiData.length; currentPlaceNr++) {
    		     console.log("In For loop" + poiData.length);
    			console.log("Data " + poiData[currentPlaceNr].id);
    			var singlePoi = {
    				"id": poiData[currentPlaceNr].id,
    				"latitude": parseFloat(poiData[currentPlaceNr].geometry.location.lat),
    				"longitude": parseFloat(poiData[currentPlaceNr].geometry.location.lng),
    				"altitude": 100,
    				"title": ""/*poiData[currentPlaceNr].name*/,
    				"description": "" /*+ poiData[currentPlaceNr].vicinity*/
    			};

    			World.markerList.push(new Marker(singlePoi));
    		}

    		// updates distance information of all placemarks
    		World.updateDistanceToUserValues();

    		World.updateStatusMessage(currentPlaceNr + ' places loaded');

    		// set distance slider to 100%
    		$("#panel-distance-range").val(100);
    		$("#panel-distance-range").slider("refresh");

    		World.initialized = true;
    	},

    	// sets/updates distances of all makers so they are available way faster than calling (time-consuming) distanceToUser() method all the time
    	updateDistanceToUserValues: function updateDistanceToUserValuesFn() {
    		for (var i = 0; i < World.markerList.length; i++) {
    			World.markerList[i].distanceToUser = World.markerList[i].markerObject.locations[0].distanceToUser();
    		}
    	},

    	// updates status message shon in small "i"-button aligned bottom center
    	updateStatusMessage: function updateStatusMessageFn(message, isWarning) {

    		var themeToUse = isWarning ? "e" : "c";
    		var iconToUse = isWarning ? "alert" : "info";

    		$("#status-message").html(message);
    		$("#popupInfoButton").buttonMarkup({
    			theme: themeToUse
    		});
    		$("#popupInfoButton").buttonMarkup({
    			icon: iconToUse
    		});
    	},

    	/*
    		It may make sense to display POI details in your native style.
    		In this sample a very simple native screen opens when user presses the 'More' button in HTML.
    		This demoes the interaction between JavaScript and native code.
    	*/
    	// user clicked "More" button in POI-detail panel -> fire event to open native screen
    	onPoiDetailMoreButtonClicked: function onPoiDetailMoreButtonClickedFn() {
    		var currentMarker = World.currentMarker;
    		var architectSdkUrl = "architectsdk://markerselected?id=" + encodeURIComponent(currentMarker.poiData.id) + "&title=" + encodeURIComponent(currentMarker.poiData.title) + "&description=" + encodeURIComponent(currentMarker.poiData.description);
    		/*
    			The urlListener of the native project intercepts this call and parses the arguments.
    			This is the only way to pass information from JavaSCript to your native code.
    			Ensure to properly encode and decode arguments.
    			Note: you must use 'document.location = "architectsdk://...' to pass information from JavaScript to native.
    			! This will cause an HTTP error if you didn't register a urlListener in native architectView !
    		*/
    		document.location = architectSdkUrl;
    	},

    	// location updates, fired every time you call architectView.setLocation() in native environment
    	locationChanged: function locationChangedFn(lat, lon, alt, acc) {

    		// store user's current location in World.userLocation, so you always know where user is
    		World.userLocation = {
    			'latitude': lat,
    			'longitude': lon,
    			'altitude': alt,
    			'accuracy': acc
    		};


    		// request data if not already present
    		if (!World.initiallyLoadedData) {
    			World.requestDataFromServer(lat, lon);
    			World.initiallyLoadedData = true;
    		} else if (World.locationUpdateCounter === 0) {
    			// update placemark distance information frequently, you max also update distances only every 10m with some more effort
    			World.updateDistanceToUserValues();
    		}

    		// helper used to update placemark information every now and then (e.g. every 10 location upadtes fired)
    		World.locationUpdateCounter = (++World.locationUpdateCounter % World.updatePlacemarkDistancesEveryXLocationUpdates);
    	},

    	// fired when user pressed marker in cam
    	onMarkerSelected: function onMarkerSelectedFn(marker) {
    		World.currentMarker = marker;

    		// update panel values
    		// $("#poi-detail-title").html(marker.poiData.title);
    		// $("#poi-detail-description").html(marker.poiData.description);

    		var distanceToUserValue = (marker.distanceToUser > 999) ? ((marker.distanceToUser / 1000).toFixed(2) + " km") : (Math.round(marker.distanceToUser) + " m");

    		//$("#poi-detail-distance").html(distanceToUserValue);

    		// show panel
    		//$("#panel-poidetail").panel("open", 123);

    		//$(".ui-panel-dismiss").unbind("mousedown");
			$state.go('productScreen');

    		/*$("#panel-poidetail").on("panelbeforeclose", function(event, ui) {
    			World.currentMarker.setDeselected(World.currentMarker);
    		});*/
    	},

    	// screen was clicked but no geo-object was hit
    	onScreenClick: function onScreenClickFn() {
    		// you may handle clicks on empty AR space too

    	},

    	// returns distance in meters of placemark with maxdistance * 1.1
    	getMaxDistance: function getMaxDistanceFn() {

    		// sort palces by distance so the first entry is the one with the maximum distance
    		World.markerList.sort(World.sortByDistanceSortingDescending);

    		// use distanceToUser to get max-distance
    		var maxDistanceMeters = World.markerList[0].distanceToUser;

    		// return maximum distance times some factor >1.0 so ther is some room left and small movements of user don't cause places far away to disappear
    		return maxDistanceMeters * 1.1;
    	},

    	// udpates values show in "range panel"
    	updateRangeValues: function updateRangeValuesFn() {

    		// get current slider value (0..100);
    		var slider_value = $("#panel-distance-range").val();

    		// max range relative to the maximum distance of all visible places
    		var maxRangeMeters = Math.round(World.getMaxDistance() * (slider_value / 100));

    		// range in meters including metric m/km
    		var maxRangeValue = (maxRangeMeters > 999) ? ((maxRangeMeters / 1000).toFixed(2) + " km") : (Math.round(maxRangeMeters) + " m");

    		// number of places within max-range
    		var placesInRange = World.getNumberOfVisiblePlacesInRange(maxRangeMeters);

    		// update UI labels accordingly
    		$("#panel-distance-value").html(maxRangeValue);
    		$("#panel-distance-places").html((placesInRange != 1) ? (placesInRange + " Places") : (placesInRange + " Place"));

    		// update culling distance, so only palces within given range are rendered
    		AR.context.scene.cullingDistance = Math.max(maxRangeMeters, 1);

    		// update radar's maxDistance so radius of radar is updated too
    		PoiRadar.setMaxDistance(Math.max(maxRangeMeters, 1));
    	},

    	// returns number of places with same or lower distance than given range
    	getNumberOfVisiblePlacesInRange: function getNumberOfVisiblePlacesInRangeFn(maxRangeMeters) {

    		// sort markers by distance
    		World.markerList.sort(World.sortByDistanceSorting);

    		// loop through list and stop once a placemark is out of range ( -> very basic implementation )
    		for (var i = 0; i < World.markerList.length; i++) {
    			if (World.markerList[i].distanceToUser > maxRangeMeters) {
    				return i;
    			}
    		};

    		// in case no placemark is out of range -> all are visible
    		return World.markerList.length;
    	},

    	handlePanelMovements: function handlePanelMovementsFn() {

    		$("#panel-distance").on("panelclose", function(event, ui) {
    			$("#radarContainer").addClass("radarContainer_left");
    			$("#radarContainer").removeClass("radarContainer_right");
    			PoiRadar.updatePosition();
    		});

    		$("#panel-distance").on("panelopen", function(event, ui) {
    			$("#radarContainer").removeClass("radarContainer_left");
    			$("#radarContainer").addClass("radarContainer_right");
    			PoiRadar.updatePosition();
    		});
    	},

    	// display range slider
    	showRange: function showRangeFn() {
    		if (World.markerList.length > 0) {

    			// update labels on every range movement
    			$('#panel-distance-range').change(function() {
    				World.updateRangeValues();
    			});

    			World.updateRangeValues();
    			World.handlePanelMovements();

    			// open panel
    			$("#panel-distance").trigger("updatelayout");
    			$("#panel-distance").panel("open", 1234);
    		} else {

    			// no places are visible, because the are not loaded yet
    			World.updateStatusMessage('No places available yet', true);
    		}
    	},

    	/*
    		This sample shows you how to use the function captureScreen to share a snapshot with your friends. C
    		oncept of interaction between JavaScript and native code is same as in the POI Detail page sample but the urlListener now handles picture sharing instead.
    		The "Snapshot"-button is on top right in the title bar.
    		Once clicked the current screen is captured and user is prompted to share it (Handling of picture sharing is done in native code and cannot be done in JavaScript)
    	*/
    	// reload places from content source
    	captureScreen: function captureScreenFn() {
    		if (World.initialized) {
    			document.location = "architectsdk://button?action=captureScreen";
    		}
    	},

    	// request POI data
    	requestDataFromServer: function requestDataFromServerFn(lat, lon) {

    		// set helper var to avoid requesting places while loading
    		World.isRequestingData = true;
    		World.updateStatusMessage('Requesting places from web-service');
    //https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=18.51903714927169,73.94746008125912&radius=5000&type=atm&name=state%20bank%20of%20india&key=AIzaSyDsTndewFA_hXxXNXgia_8BZRG9Z1tJfQQ
    		// server-url to JSON content provider
    		//var serverUrl = ServerInformation.POIDATA_SERVER + "?" + ServerInformation.POIDATA_SERVER_ARG_LAT + "=" + lat + "&" + ServerInformation.POIDATA_SERVER_ARG_LON + "=" + lon + "&" + ServerInformation.POIDATA_SERVER_ARG_NR_POIS + "=20";
    		var serverUrl = ServerInformation.POIDATA_SERVER_2 + "?location=" + lat + ","  + lon + "&radius=2000&type=fast-food&name=mcdonalds&key=AIzaSyDsTndewFA_hXxXNXgia_8BZRG9Z1tJfQQ";
    		console.log("POI_SERVER " + serverUrl );
    		var jqxhr = $.getJSON(serverUrl, function(data) {
    				console.log(data);
    				World.loadPoisFromJsonData(data.results);
    			})
    			.error(function(err) {
    				/*
    					Under certain circumstances your web service may not be available or other connection issues can occur.
    					To notify the user about connection problems a status message is updated.
    					In your own implementation you may e.g. use an info popup or similar.
    				*/
    				World.updateStatusMessage("Invalid web-service response.", true);
    				World.isRequestingData = false;
    			})
    			.complete(function() {
    				World.isRequestingData = false;
    			});
    	},

    	// helper to sort places by distance
    	sortByDistanceSorting: function(a, b) {
    		return a.distanceToUser - b.distanceToUser;
    	},

    	// helper to sort places by distance, descending
    	sortByDistanceSortingDescending: function(a, b) {
    		return b.distanceToUser - a.distanceToUser;
    	}

    };


    /* forward locationChanges to custom function */
    AR.context.onLocationChanged = World.locationChanged;

    /* forward clicks in empty area to World */
    AR.context.onScreenClick = World.onScreenClick;



    var kMarker_AnimationDuration_ChangeDrawable = 500;
    var kMarker_AnimationDuration_Resize = 1000;

    function Marker(poiData) {

        this.poiData = poiData;
        this.isSelected = false;

        /*
            With AR.PropertyAnimations you are able to animate almost any property of ARchitect objects. This sample will animate the opacity of both background drawables so that one will fade out while the other one fades in. The scaling is animated too. The marker size changes over time so the labels need to be animated too in order to keep them relative to the background drawable. AR.AnimationGroups are used to synchronize all animations in parallel or sequentially.
        */

        this.animationGroup_idle = null;
        this.animationGroup_selected = null;


        // create the AR.GeoLocation from the poi data
        var markerLocation = new AR.GeoLocation(poiData.latitude, poiData.longitude, poiData.altitude);

        // create an AR.ImageDrawable for the marker in idle state
        this.markerDrawable_idle = new AR.ImageDrawable(World.markerDrawable_idle, 2.5, {
            zOrder: 0,
            opacity: 1.0,
            /*
                To react on user interaction, an onClick property can be set for each AR.Drawable. The property is a function which will be called each time the user taps on the drawable. The function called on each tap is returned from the following helper function defined in marker.js. The function returns a function which checks the selected state with the help of the variable isSelected and executes the appropriate function. The clicked marker is passed as an argument.
            */
            onClick: Marker.prototype.getOnClickTrigger(this)
        });

        // create an AR.ImageDrawable for the marker in selected state
        this.markerDrawable_selected = new AR.ImageDrawable(World.markerDrawable_selected, 2.5, {
            zOrder: 0,
            opacity: 0.0,
            onClick: null
        });

        // create an AR.Label for the marker's title
        this.titleLabel = new AR.Label(poiData.title.trunc(10), 1, {
            zOrder: 1,
            offsetY: 0.55,
            style: {
                textColor: '#FFFFFF',
                fontStyle: AR.CONST.FONT_STYLE.BOLD
            }
        });

        // create an AR.Label for the marker's description
        this.descriptionLabel = new AR.Label(poiData.description.trunc(15), 0.8, {
            zOrder: 1,
            offsetY: -0.55,
            style: {
                textColor: '#FFFFFF'
            }
        });

        /*
            Create an AR.ImageDrawable using the AR.ImageResource for the direction indicator which was created in the World. Set options regarding the offset and anchor of the image so that it will be displayed correctly on the edge of the screen.
        */
        this.directionIndicatorDrawable = new AR.ImageDrawable(World.markerDrawable_directionIndicator, 0.1, {
            enabled: false,
            verticalAnchor: AR.CONST.VERTICAL_ANCHOR.TOP
        });

        /*
            The representation of an AR.GeoObject in the radar is defined in its drawables set (second argument of AR.GeoObject constructor).
            Once drawables.radar is set the object is also shown on the radar e.g. as an AR.Circle
        */
        this.radarCircle = new AR.Circle(0.03, {
            horizontalAnchor: AR.CONST.HORIZONTAL_ANCHOR.CENTER,
            opacity: 0.8,
            style: {
                fillColor: "#ffffff"
            }
        });

        /*
            Additionally create circles with a different color for the selected state.
        */
        this.radarCircleSelected = new AR.Circle(0.05, {
            horizontalAnchor: AR.CONST.HORIZONTAL_ANCHOR.CENTER,
            opacity: 0.8,
            style: {
                fillColor: "#0066ff"
            }
        });

        this.radardrawables = [];
        this.radardrawables.push(this.radarCircle);

        this.radardrawablesSelected = [];
        this.radardrawablesSelected.push(this.radarCircleSelected);

        /*
            Note that indicator and radar-drawables were added
        */
        this.markerObject = new AR.GeoObject(markerLocation, {
            drawables: {
                cam: [this.markerDrawable_idle, this.markerDrawable_selected, this.titleLabel, this.descriptionLabel],
                indicator: this.directionIndicatorDrawable,
                radar: this.radardrawables
            }
        });

        return this;
    }

    Marker.prototype.getOnClickTrigger = function(marker) {

        /*
            The setSelected and setDeselected functions are prototype Marker functions.
            Both functions perform the same steps but inverted.
        */
        return function() {

            if (!Marker.prototype.isAnyAnimationRunning(marker)) {
                if (marker.isSelected) {

                    Marker.prototype.setDeselected(marker);

                } else {
                    Marker.prototype.setSelected(marker);
                    try {
                        World.onMarkerSelected(marker);
                    } catch (err) {
                        alert(err);
                    }

                }
            } else {
                AR.logger.debug('a animation is already running');
            }


            return true;
        };
    };

    /*
        Property Animations allow constant changes to a numeric value/property of an object, dependent on start-value, end-value and the duration of the animation. Animations can be seen as functions defining the progress of the change on the value. The Animation can be parametrized via easing curves.
    */

    Marker.prototype.setSelected = function(marker) {

        marker.isSelected = true;

        if (marker.animationGroup_selected === null) {

            // create AR.PropertyAnimation that animates the opacity to 0.0 in order to hide the idle-state-drawable
            var hideIdleDrawableAnimation = new AR.PropertyAnimation(marker.markerDrawable_idle, "opacity", null, 0.0, kMarker_AnimationDuration_ChangeDrawable);
            // create AR.PropertyAnimation that animates the opacity to 1.0 in order to show the selected-state-drawable
            var showSelectedDrawableAnimation = new AR.PropertyAnimation(marker.markerDrawable_selected, "opacity", null, 1.0, kMarker_AnimationDuration_ChangeDrawable);

            // create AR.PropertyAnimation that animates the scaling of the idle-state-drawable to 1.2
            var idleDrawableResizeAnimation = new AR.PropertyAnimation(marker.markerDrawable_idle, 'scaling', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
                amplitude: 2.0
            }));
            // create AR.PropertyAnimation that animates the scaling of the selected-state-drawable to 1.2
            var selectedDrawableResizeAnimation = new AR.PropertyAnimation(marker.markerDrawable_selected, 'scaling', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
                amplitude: 2.0
            }));
            // create AR.PropertyAnimation that animates the scaling of the title label to 1.2
            var titleLabelResizeAnimation = new AR.PropertyAnimation(marker.titleLabel, 'scaling', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
                amplitude: 2.0
            }));
            // create AR.PropertyAnimation that animates the scaling of the description label to 1.2
            var descriptionLabelResizeAnimation = new AR.PropertyAnimation(marker.descriptionLabel, 'scaling', null, 1.2, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
                amplitude: 2.0
            }));

            /*
                There are two types of AR.AnimationGroups. Parallel animations are running at the same time, sequentials are played one after another. This example uses a parallel AR.AnimationGroup.
            */
            marker.animationGroup_selected = new AR.AnimationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, [hideIdleDrawableAnimation, showSelectedDrawableAnimation, idleDrawableResizeAnimation, selectedDrawableResizeAnimation, titleLabelResizeAnimation, descriptionLabelResizeAnimation]);
        }

        // removes function that is set on the onClick trigger of the idle-state marker
        marker.markerDrawable_idle.onClick = null;
        // sets the click trigger function for the selected state marker
        marker.markerDrawable_selected.onClick = Marker.prototype.getOnClickTrigger(marker);

        // enables the direction indicator drawable for the current marker
        marker.directionIndicatorDrawable.enabled = true;

        marker.markerObject.drawables.radar = marker.radardrawablesSelected;

        // starts the selected-state animation
        marker.animationGroup_selected.start();
    };

    Marker.prototype.setDeselected = function(marker) {

        marker.isSelected = false;

        marker.markerObject.drawables.radar = marker.radardrawables;

        if (marker.animationGroup_idle === null) {

            // create AR.PropertyAnimation that animates the opacity to 1.0 in order to show the idle-state-drawable
            var showIdleDrawableAnimation = new AR.PropertyAnimation(marker.markerDrawable_idle, "opacity", null, 1.0, kMarker_AnimationDuration_ChangeDrawable);
            // create AR.PropertyAnimation that animates the opacity to 0.0 in order to hide the selected-state-drawable
            var hideSelectedDrawableAnimation = new AR.PropertyAnimation(marker.markerDrawable_selected, "opacity", null, 0, kMarker_AnimationDuration_ChangeDrawable);
            // create AR.PropertyAnimation that animates the scaling of the idle-state-drawable to 1.0
            var idleDrawableResizeAnimation = new AR.PropertyAnimation(marker.markerDrawable_idle, 'scaling', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
                amplitude: 2.0
            }));
            // create AR.PropertyAnimation that animates the scaling of the selected-state-drawable to 1.0
            var selectedDrawableResizeAnimation = new AR.PropertyAnimation(marker.markerDrawable_selected, 'scaling', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
                amplitude: 2.0
            }));
            // create AR.PropertyAnimation that animates the scaling of the title label to 1.0
            var titleLabelResizeAnimation = new AR.PropertyAnimation(marker.titleLabel, 'scaling', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
                amplitude: 2.0
            }));
            // create AR.PropertyAnimation that animates the scaling of the description label to 1.0
            var descriptionLabelResizeAnimation = new AR.PropertyAnimation(marker.descriptionLabel, 'scaling', null, 1.0, kMarker_AnimationDuration_Resize, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
                amplitude: 2.0
            }));

            /*
                There are two types of AR.AnimationGroups. Parallel animations are running at the same time, sequentials are played one after another. This example uses a parallel AR.AnimationGroup.
            */
            marker.animationGroup_idle = new AR.AnimationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, [showIdleDrawableAnimation, hideSelectedDrawableAnimation, idleDrawableResizeAnimation, selectedDrawableResizeAnimation, titleLabelResizeAnimation, descriptionLabelResizeAnimation]);
        }

        // sets the click trigger function for the idle state marker
        marker.markerDrawable_idle.onClick = Marker.prototype.getOnClickTrigger(marker);
        // removes function that is set on the onClick trigger of the selected-state marker
        marker.markerDrawable_selected.onClick = null;

        // disables the direction indicator drawable for the current marker
        marker.directionIndicatorDrawable.enabled = false;
        // starts the idle-state animation
        marker.animationGroup_idle.start();
    };

    Marker.prototype.isAnyAnimationRunning = function(marker) {

        if (marker.animationGroup_idle === null || marker.animationGroup_selected === null) {
            return false;
        } else {
            if ((marker.animationGroup_idle.isRunning() === true) || (marker.animationGroup_selected.isRunning() === true)) {
                return true;
            } else {
                return false;
            }
        }
    };

    // will truncate all strings longer than given max-length "n". e.g. "foobar".trunc(3) -> "foo..."
    String.prototype.trunc = function(n) {
        return this.substr(0, n - 1) + (this.length > n ? '...' : '');
    };




}