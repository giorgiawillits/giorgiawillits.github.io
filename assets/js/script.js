var map;
var currentPos;
var clickTime;
var coffeeLocations;
var donutLocations;
var coffeeLoc;
var donutLoc;

function initMap() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;

  // Initialize map
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 11
  });
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById("directions"));

  // Try HTML5 geolocation.
  infoWindow = new google.maps.InfoWindow({map: map});
  getCurrentPosition(infoWindow);

  // Search for Coffee & Donuts nearby
  addressToLocation("282 2nd Street 4th floor, San Francisco, CA 94105", getCoffeeAndDonuts);

  // Add event listener to calculate directions
  document.getElementById('search').addEventListener('click', function() {
    var selectedMode = document.getElementById("travel-mode").value
    if (selectedMode == 'TRANSIT') {
      calculateAndDisplayTransitRoute(directionsService, directionsDisplay);
    } else {
      calculateAndDisplayRoute(directionsService, directionsDisplay);
    }
  });

}

function getCurrentPosition(infoWindow) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      currentPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      infoWindow.setPosition(currentPos);
      infoWindow.setContent('Location found.');
      map.setCenter(currentPos);
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
        clickTime = resultLocations[0]
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
  var placesService = new google.maps.places.PlacesService(map);
  placesService.textSearch(requestCoffee, getCoffeeMatrix);
  placesService.textSearch(requestDonuts, getDonutMatrix);
}

function getCoffeeMatrix(results, status) {
  var coffeeOrigins = [];
  coffeeLocations = [];
  for (var i = 0; i < results.length; i++){
    coffeeLocations.push(results[i]);
    coffeeOrigins.push(results[i].geometry.location);
  }
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    var matrixService = new google.maps.DistanceMatrixService();
    matrixService.getDistanceMatrix(
      {
        origins: coffeeOrigins,
        destinations: [clickTime],
        travelMode: google.maps.TravelMode.WALKING,
      }, getClosestCoffee);
  }
}

function getDonutMatrix(results, status) {
  var donutOrigins = [];
  donutLocations = [];
  for (var i = 0; i < results.length; i++){
    donutLocations.push(results[i]);
    donutOrigins.push(results[i].geometry.location);
  }
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    var matrixService = new google.maps.DistanceMatrixService();
    matrixService.getDistanceMatrix(
      {
        origins: donutOrigins,
        destinations: [clickTime],
        travelMode: google.maps.TravelMode.WALKING,
      }, getClosestDonuts);
  }
}

function getClosestCoffee(response, status) {
  if (status == google.maps.DistanceMatrixStatus.OK) {
    var origins = response.originAddresses;
    var minDistance = Infinity;
    var closeCoffee = null;
    for (var i = 0; i < origins.length; i++) {
      var results = response.rows[i].elements;
      for (var j = 0; j < results.length; j++) {
        var element = results[j];
        if (element.distance) {
          var distance = element.distance.value;
          if (distance < minDistance) {
            minDistance = distance;
            closeCoffee = coffeeLocations[i];
          }
        }
      }
    }
    if (closeCoffee != null) {
      // var infowindow = new google.maps.InfoWindow({
      //   content: closeCoffee.name
      // });
      // var marker = new google.maps.Marker({
      //   map: map,
      //   title: closeCoffee.name,
      //   position: closeCoffee.geometry.location
      // });
      // marker.addListener('click', function() {
      //   infowindow.open(map, marker);
      // });
      coffeeLoc = closeCoffee;
    }
  }
}

function getClosestDonuts(response, status) {
  if (status == google.maps.DistanceMatrixStatus.OK) {
    var origins = response.originAddresses;
    var minDistance = Infinity;
    var closeDonut = null;
    for (var i = 0; i < origins.length; i++) {
      var results = response.rows[i].elements;
      for (var j = 0; j < results.length; j++) {
        var element = results[j];
        if (element.distance) {
          var distance = element.distance.value;
          if (distance < minDistance) {
            minDistance = distance;
            closeDonut = donutLocations[i];
          }
        }
      }
    }
    if (closeDonut != null) {
      var infowindow = new google.maps.InfoWindow({
        content: closeDonut.name
      });
      // var marker = new google.maps.Marker({
      //   map: map,
      //   title: closeDonut.name,
      //   position: closeDonut.geometry.location
      // });
      // marker.addListener('click', function() {
      //   infowindow.open(map, marker);
      // });
      donutLoc = closeDonut;
    }
  }
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  var selectedMode = document.getElementById("travel-mode").value
  var waypts = [{
          location: coffeeLoc.geometry.location,
          stopover: true
        }, {
          location: donutLoc.geometry.location,
          stopover: true
        }];
  directionsService.route({
    origin: currentPos,
    destination: clickTime,
    waypoints: waypts,
    optimizeWaypoints: true,
    travelMode: google.maps.TravelMode[selectedMode]
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      getTripSummary();
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

function calculateAndDisplayTransitRoute(directionsService, directionsDisplay) {
  var selectedMode = document.getElementById("travel-mode").value
  // Route to coffee
  directionsService.route({
    origin: currentPos,
    destination: coffeeLoc.geometry.location,
    travelMode: google.maps.TravelMode[selectedMode]
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      var currentTime = new Date();
      currentTime = currentTime.getTime();
      var duration = response.routes[0].legs[0].duration.value * 1000;
      // Route to donuts
      directionsService.route({
        origin: coffeeLoc.geometry.location,
        destination: donutLoc.geometry.location,
        travelMode: google.maps.TravelMode[selectedMode],
        transitOptions: {
          departureTime: new Date(currentTime + duration)
        }
      }, function(response2, status) {
            if (status === google.maps.DirectionsStatus.OK) {
              currentTime = currentTime + duration;
              duration = response2.routes[0].legs[0].duration.value * 1000;
              response.routes[0].legs.push(response2.routes[0].legs[0]);
              // Route to ClickTime
              directionsService.route({
                origin: donutLoc.geometry.location,
                destination: clickTime,
                travelMode: google.maps.TravelMode[selectedMode],
                transitOptions: {
                  departureTime: new Date(currentTime + duration)
                }
              }, function(response3, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                  response.routes[0].legs.push(response3.routes[0].legs[0]);
                  directionsDisplay.setDirections(response);
                } else {
                  window.alert('Directions request failed due to ' + status);
                }
              });
            } else {
              window.alert('Directions request failed due to ' + status);
            }
      });
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

function getTripSummary() {
  var summaryPanel = document.getElementById('directions-summary');
  summaryPanel.innerHTML = '';
  summaryPanel.innerHTML += '<b>Stop to get coffee at ' + coffeeLoc.name + '</b><br>Address: ' + coffeeLoc.formatted_address;
  summaryPanel.innerHTML += '<br><b>Stop to get donuts at ' + donutLoc.name + '</b><br>Address: ' + donutLoc.formatted_address;
}
