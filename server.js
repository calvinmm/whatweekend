var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  jquery = require('jquery');

var yelp = require("yelp").createClient({
	consumer_key: "Mgx8tTDuckOqg6SRwo0xXw",
	consumer_secret: "0vD6pRfx92ndGXlZRPg74lO8tfI",
	token: "NrMMM82K50HFt_LEXeyMLNLGP0ioNwJT",
	token_secret: "-b76j1LnR23hw-2VRY-sZy_Iz9o"
});

var GooglePlaces = require('google-places');

var googleKey = 'AIzaSyBB_GWDaFo8MeewytsNAEqNlQkFCwI06As';

var googlePlaces = new GooglePlaces(googleKey);


app.configure(function() {
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
});

app.post('/places', function(req, res) {
  res.contentType('json'); 
  var latitude = req.body.latitude;
  var longitude = req.body.longitude;
  
  
  var yelpDeferred = queryYelp(latitude, longitude);
  var googleDeferred = queryGoogle(latitude, longitude);

  jquery.when(yelpDeferred, googleDeferred).done(
      function(yelpActivities, googleActivities) { 
          combineActivities(res, yelpActivities, googleActivities);
  });
});

var port = process.env.PORT || 5000;
server.listen(port, function() {
  console.log("Listening on", port);
});

function queryYelp(latitude, longitude) {
  var deferred = jquery.Deferred();
  var activities = {events : [], places : []};
	var loc = latitude.toString() + "," + longitude.toString();
  
  // populate activities in the async call and call this
  yelp.search({category_filter: "active", ll: loc}, function(error, data) {
		if (error) {
      deferred.reject(error);
    }
    var places = [];
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
				url: place.url,
        src: "yelp"
			}
			places.push(place_object);
		}
    activities.places = places;
    deferred.resolve(activities);
	});
  return deferred;
}

function queryGoogle(latitude, longitude) {
  var deferred = jquery.Deferred();
  var activities = {events : [], places : []};
  var places = [];

	googlePlaces.search(
      {location: [latitude, longitude], keyword: "tourist", radius: 10000}, 
      function(error, data) {
		
    if (error) {
      deferred.reject(error);
    }
    for (var index = 0; index < data.results.length; index++) {
			var place = data.results[index];

			// build our place object
			var placeObject = {
				title: place.name,
				location: place.vicinity,
				rating: place.rating,
				image: place.icon,
        src: "google"
			};

			// check if we have a photo
			if (place.photos) {
				var photoUrl = "https://maps.googleapis.com/maps/api/place/photo?sensor=false";
				photoUrl += "&key=" + googleKey;
				photoUrl += "&photoreference=" + place.photos[0].photo_reference;
				photoUrl += "&maxwidth=100&maxheight=100"

				placeObject.image = photoUrl;
			}
			places.push(placeObject);
	  }
    activities.places = places;
    deferred.resolve(activities);
	});
  return deferred;
}

function combineActivities(res, yelpActivities, googleActivities) {
  var activities = {events : [], places : []};
  
  // Combine all activities and places
  activities.places = activities.places.concat(yelpActivities.places);
  activities.events = activities.events.concat(yelpActivities.events);
  activities.places = activities.places.concat(googleActivities.places);
  activities.events = activities.events.concat(googleActivities.events);

  activities.places.sort(placesSort);
  activities.events.sort(basicRatingSort);
  
  res.send(activities);
}

function basicRatingSort(o1, o2) {
  var val1 = o1.rating;
  var val2 = o2.rating;
  if (o1.src == "yelp") {
    val1 -= .06;
  }
  if (o2.src == "google") {
    val2 -= .06;
  }
  return val2 - val1;
}

function basicRatingSort(o1, o2) {
  return o2.rating - o1.rating;
}
