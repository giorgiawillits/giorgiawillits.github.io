var map;
var service;
var pos;
var clickTime = "282 2nd Street 4th floor, San Francisco, CA 94105"
var infoWindow;

function initMap() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;

  // Initialize map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 10
  });
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById("directions"));
  infoWindow = new google.maps.InfoWindow({map: map});
  service = new google.maps.places.PlacesService(map);


  // Try HTML5 geolocation.
  getCurrentPosition();

  // Search for Coffee & Donuts nearby
  addressToLocation(clickTime, getCoffeeAndDonuts);

  // Add event listener to calculate directions
  document.getElementById('travel-mode').addEventListener('change', function() {
    calculateAndDisplayRoute(directionsService, directionsDisplay);
  });

}

function getCurrentPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}

function addressToLocation(address, callback) {
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode( {address: address}, function(results, status) {
			var resultLocations = [];
			if(status == google.maps.GeocoderStatus.OK) {
				if(results) {
					for(var i = 0; i < results.length; i++) {
						var result = results[i];
						resultLocations.push( {
								text:result.formatted_address,
								addressStr:result.formatted_address,
								location:result.geometry.location,
                lat:result.geometry.location.lat(),
                lng:result.geometry.location.lng()
							});
					};
				}
			} else if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
				// address not found
			}
			if(resultLocations.length > 0) {
				callback(resultLocations);
			} else {
				callback(null);
			}
		}
	);
}

function getCoffeeAndDonuts(locations){
  var requestCoffee = {
    location: locations[0],
    radius: '500',
    query: 'coffee',
    openNow: true
  };
  var requestDonuts = {
    location: locations[0],
    radius: '500',
    query: 'donut',
    openNow: true
  };
  service.textSearch(requestCoffee, placeMarkers);
}

function placeMarkers(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
        var place = results[i];
        var image = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };

        var marker = new google.maps.Marker({
          map: map,
          icon: image,
          title: place.name,
          position: place.geometry.location
        });
    }
  }
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  var selectedMode = document.getElementById("travel-mode").value
  console.log(pos)
  console.log(clickTime)
  console.log(selectedMode)
  directionsService.route({
    origin: pos,
    destination: clickTime,
    //origin: document.getElementById('start').value,
    //destination: document.getElementById('end').value,
    // Note that Javascript allows us to access the constant
    // using square brackets and a string value as its
    // "property."
    travelMode: google.maps.TravelMode[selectedMode]
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}








//$(document).ready(function() {
//});

  // var onChangeHandler = function() {
  //   calculateAndDisplayRoute(directionsService, directionsDisplay);
  // };
  //document.getElementById('start').addEventListener('change', onChangeHandler);
  //document.getElementById('end').addEventListener('change', onChangeHandler);
