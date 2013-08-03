// test google places api

var GooglePlaces = require('google-places');
var places = new GooglePlaces('AIzaSyBB_GWDaFo8MeewytsNAEqNlQkFCwI06As');

var latitude = 47.617248499999995;
var longitude = -122.3297999;

getGooglePlacesData(latitude, longitude);

function getGooglePlacesData(latitude, longitude) {
	// #YOLO need strings
	var loc = latitude.toString() + "," + longitude.toString();

	// arr used to hold return data
	var arr = [];

	places.search({location: [latitude, longitude], keyword: "tourist", radius: 10000}, function(error, data) {
		for (var index = 0; index < data.results.length; index++) {
			var place = data.results[index];

			// build our place object
			var place_object = {
				title: place.name,
				location: place.vicinity,
				rating: place.rating,
				image: place.icon
			};

			arr.push(place_object);
		}
	});
}