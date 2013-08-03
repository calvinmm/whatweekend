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

console.log("starting server");
server.listen(3000);

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
				url: place.url
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
  
  // populate activities in the async call and call this
  deferred.resolve(activities);
  
  return deferred;
}

function combineActivities(res, yelpActivities, googleActivities) {
  var activities = {events : [], places : []};
  
  // Combine all activities and places
  activities.places = activities.places.concat(yelpActivities.places);
  activities.events = activities.events.concat(yelpActivities.events);
  activities.places = activities.places.concat(googleActivities.places);
  activities.events = activities.events.concat(googleActivities.events);

  activities.places.sort(basicRatingSort);
  activities.events.sort(basicRatingSort);
  
  res.send(activities);
}

function basicRatingSort(o1, o2) {
  return o2.rating - o1.rating;
}
