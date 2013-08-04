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
	// array rused to hold return data
	var google_places = [];

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

			// check if we have a photo
			if (place.photos) {
				var photo_url = "https://maps.googleapis.com/maps/api/place/photo?sensor=false";
				photo_url += "&key=" + google_key;
				photo_url += "&photoreference=" + place.photos[0].photo_reference;
				photo_url += "&maxwidth=100&maxheight=100"

				place_object.image = photo_url;
			}

			google_places.push(place_object);
		}
	});
}
