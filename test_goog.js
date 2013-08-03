// test google places api

var GooglePlaces = require('google-places');

var google_key = 'AIzaSyBB_GWDaFo8MeewytsNAEqNlQkFCwI06As';

var places = new GooglePlaces(google_key);

var latitude = 47.617248499999995;
var longitude = -122.3297999;

// var latitude = 30.263812;
// var longitude = -97.755189;

getGooglePlacesData(latitude, longitude, google_key);

function getGooglePlacesData(latitude, longitude, google_key) {
	// arr used to hold return data
	var arr = [];

	places.search({location: [latitude, longitude], keyword: "tourist", radius: 10000}, function(error, data) {
		console.log(data.next_page_token);
		for (var index = 0; index < data.results.length; index++) {
			var place = data.results[index];

			console.log(place);
			// if (place.events) {
			// 	console.log(place.events);
			// }

			// build our place object
			var place_object = {
				title: place.name,
				location: place.vicinity,
				rating: place.rating,
				image: place.icon
			};

			// check if we have a photo
			if (place.photos) {
				var base_url = "https://maps.googleapis.com/maps/api/place/photo?sensor=true";
				base_url += "&key=" + google_key;
				var photo_ref = "&photoreference=";
			}

			arr.push(place_object);
		}
	});
}