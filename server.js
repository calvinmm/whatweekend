var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  jquery = require('jquery'),
  graph = require('fbgraph'),
  EventBrite = require('eventbrite');

var yelp = require("yelp").createClient({
	consumer_key: "Mgx8tTDuckOqg6SRwo0xXw",
	consumer_secret: "0vD6pRfx92ndGXlZRPg74lO8tfI",
	token: "NrMMM82K50HFt_LEXeyMLNLGP0ioNwJT",
	token_secret: "-b76j1LnR23hw-2VRY-sZy_Iz9o"
});

var conf = {
    client_id:      '1400334646854257',
    client_secret:  '2968d9a732601e9bf61bb3302afa79fe',
    scope:          'email, user_about_me, friends_events, user_events, user_location' 
};


var GooglePlaces = require('google-places');

var googleKey = 'AIzaSyBB_GWDaFo8MeewytsNAEqNlQkFCwI06As';

var googlePlaces = new GooglePlaces(googleKey);

var eventbrite_key = 'ILKRGFR2MTYO67PCJ7';
var eb_client = new EventBrite({'app_key': eventbrite_key});

app.configure(function() {
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
});

app.post('/places', function(req, res) {
  res.contentType('json'); 
  var latitude = req.body.latitude;
  var longitude = req.body.longitude;
  
  var accessToken = req.body.fbResponse.authResponse.accessToken;
  var userID = req.body.fbResponse.authResponse.userID;
 
  req.session = {};
  req.session.accessToken = accessToken;
  req.session.userID = userID;
 
  var yelpDeferred = queryYelp(latitude, longitude);
  var googleDeferred = queryGoogle(latitude, longitude);
  var facebookDeferred = queryFacebook(accessToken, latitude, longitude);
	var eventbriteDeferred = queryEventbrite(latitude, longitude);

  jquery.when(yelpDeferred, googleDeferred, facebookDeferred, eventbriteDeferred).done(
      function(yelpActivities, googleActivities, facebookActivities, eventbriteActivities) { 
          combineActivities(res, yelpActivities, googleActivities, facebookActivities, eventbriteActivities);
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
				locationString: addr.join(", "),
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
				locationString: place.vicinity,
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

function queryEventbrite(lat, lng) {
  // array rused to hold return data
  var deferred = jquery.Deferred();
  var activities = {events : [], places : []};

  var events = [];
  // Get date! Can filter events by it.
  // var startDate, endDate;  // YYYY
  var startDate = formatDate(new Date(getWeekendDate()));

  var goodCategories = "comedy,food,movies,music,outdoors,social,sports,entertainment";
  eb_client.event_search({within:20, within_unit:"K", latitude:lat, longitude:lng, date:startDate+" "+startDate, category:goodCategories, max:50}, function(error, response) {
    if (error) {
      deferred.reject(error);
    }
    // First element is a "summary"

    for (var i = 1; i < response.events.length; i++) {
      var event = response.events[i].event;

      // YOLO HACK
      var title = "<h1>" + event.title.trim().replace(/\n/g, " ").replace(/\r/g, " ") + "</h1>";
      var desc = "<h1>" + event.description.trim().replace(/\n/g, " ").replace(/\r/g, " ") + "</h1>";

      // yo yo what the hell, remove those results!!!
      var d = new Date(getWeekendDate());
      var e = new Date(event.start_date.replace(/-/g, "/").split(" ")[0]);

			var hack_date = formatDate(d);
			var start_date = hack_date +" " + event.start_date.replace(/-/g, "/").split(" ")[1];
			var end_date = hack_date + " " + event.end_date.replace(/-/g, "/").split(" ")[1];
			var locationString = '';
			if (event.venue) {
				if (event.venue.address) {
					locationString += event.venue.address;
				}
				if (event.venue.city) {
					if (locationString) {
						locationString += ', ';
					}
					locationString += event.venue.city;
				}
				if (event.venue.region) {
					if (locationString) {
						locationString += ', ';	
					}
					locationString += event.venue.region;
				}
				if (event.venue.country_code) {
					if (locationString) {
						locationString += ', ';
					}
					locationString += event.venue.country_code;
				}		
			}	else {
				locationString = 'This event has no location.';
			}
			// We need more results yo. Who gives a shit about the date anyway
      //if (e >= d) {
        var event_object = {
          title: jquery(title).text(),
          description: jquery(desc).text(),
          locationString: locationString,
          url:event.url,
          start: new Date(start_date).getTime(),
          end: new Date(end_date).getTime(),
          src:"eventbrite"
        };
        events.push(event_object);  
      //}
    }

    activities.events = events;
    deferred.resolve(activities);
  });
  return deferred;
}

function queryFacebook(accessToken, latitude, longitude) {
  var deferred = jquery.Deferred();
  var activities = {events : [], places : []};
  
  var searchOptions = {
    q: "*",
    type:  "event",
    center: latitude + "," + longitude,  
    distance: 10000,
    start: "saturday",
    until: "monday",
    limit: 50
  };
  graph.setAccessToken(accessToken);
  graph.search(searchOptions, function(err, data) {
    if (err) {
      console.log(err); 
    }
    var eventList = data.data;
    var goodEvents = [];
    outer:
    for (var i = 0; i < eventList.length; i++) {
			var title = eventList[i].name;
			for (var j = 0; j < title.length; j++) {
				if (title.charCodeAt(j) >= 128) {
					continue outer;
				}
			}
      var eventObject = {
        title: title,
        locationString: eventList[i].location,
        src: "facebook",
        url: "http://facebook.com/" + eventList[i].id,
        date: eventList[i].start_time
      }
      goodEvents.push(eventObject);
    }
    activities.events = goodEvents;
    deferred.resolve(activities);
  });
  return deferred;
}

function combineActivities(res, yelpActivities, googleActivities, facebookActivities, eventbriteActivities) {
  var activities = {events : [], places : []};

	var fbevents = facebookActivities.events;
	var eventbriteevents = eventbriteActivities.events;
	var i = 0;
	var j = 0;
	var eventbritebias = 3;
	for (; i < fbevents.length && j < eventbriteevents.length;) {
		for (var k = 0; k < eventbritebias && j < eventbriteevents.length; k++) {
			activities.events.push(eventbriteevents[j++]);
		}	
		activities.events.push(fbevents[i++]);
	}
	for(; i < fbevents.length; i++) {
		activities.events.push(fbevents[i]);
	}
	for(; j < eventbriteevents.length; j++) {
		activities.events.push(eventbriteevents[j]);
	}
  // Combine all activities and places
  activities.events = activities.events.concat(eventbriteActivities.events);

  activities.places = activities.places.concat(yelpActivities.places);
  activities.events = activities.events.concat(yelpActivities.events);

  activities.places = activities.places.concat(googleActivities.places);
  activities.events = activities.events.concat(googleActivities.events);

  activities.places = activities.places.concat(facebookActivities.places);

  activities.places.sort(placesSort);
  res.send(activities);
}

function placesSort(o1, o2) {
  var val1 = o1.rating;
  var val2 = o2.rating;
  if (o1.src == "yelp") {
    val1 -= .6;
  }
  if (o2.src == "yelp") {
    val2 -= .6;
  }
  return val2 - val1;
}

function getWeekendDate() {
  // figure out weekend
  var today = new Date();
  var eventDate = undefined;

  if (today.getDay() == 0) {
    eventDate = new Date(today);
  } else {
    eventDate = new Date(today.setDate(today.getDate() + 6 - today.getDay()));
  }
  return eventDate.getTime();
}

function formatDate(d) {
  // give me the d
  var day = d.getDate().toString();
  var month = (d.getMonth() + 1).toString();
  var year = d.getFullYear().toString();

  if (day.length == 1) {
    day = "0" + day;
  }
  if (month.length == 1) {
    month = "0" + month;
  }

  return year + "-" + month + "-" + day;
}
