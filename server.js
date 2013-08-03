var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  jquery = require('jquery');

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
  var activities = {events : [1], places : [2]};
  
  // populate activities in the async call and call this
  deferred.resolve(activities);
  
  return deferred;
}

function queryGoogle(latitude, longitude) {
  var deferred = jquery.Deferred();
  var activities = {events : [3], places : [4]};
  
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

  // TODO(david): sort activites / places
  res.send(activities);
}
