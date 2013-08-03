// test yelp api

var yelp = require("yelp").createClient({
	consumer_key: "Mgx8tTDuckOqg6SRwo0xXw",
	consumer_secret: "0vD6pRfx92ndGXlZRPg74lO8tfI",
	token: "NrMMM82K50HFt_LEXeyMLNLGP0ioNwJT",
	token_secret: "-b76j1LnR23hw-2VRY-sZy_Iz9o"
});

var latitude = 47.617248499999995;
var longitude = -122.3297999;

getYelpData(latitude, longitude);
	
function getYelpData(latitude, longitude) {
	// #YOLO need strings
	var loc = latitude.toString() + "," + longitude.toString();
	
	// arr used to hold return data
	var arr = [];

	yelp.search({category_filter: "active", ll: loc}, function(error, data) {
		for (var index = 0; index < data.businesses.length; index++) {
			var place = data.businesses[index];

			// filter out the (b/t)
			var addr = place.location.display_address.filter(function(str) {
				var regex = RegExp(".b/t.");
				return regex.exec(str) == null;
			});

			// build our place object
			var place_object = {
				title: place.name,
				location: addr.join(", "),
				rating: place.rating,
				image: place.image_url,
				url: place.url
			};

			arr.push(place_object);
		}
	});
}