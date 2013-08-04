function createEvent(name, startTime, endTime, locationthing, description) {
	console.log(window.accessToken);
	var eventData = {
		"start_time" : startTime,
		"end_time": endTime,
		"location" : locationthing,
		"name" : name,
		"description": description,
		"privacy_type": "SECRET"
	};
  	console.log(eventData);
	FB.api("/me/events",'post',eventData,function(response){
		console.log("GOT A RESPONSE");
    	console.log(response);
		if(response.id){
			console.log("SUCCESSFULLY CREATED EVENT " + response.id);
			$(".alert").html('<strong>Success! </strong> <a href="https://facebook.com/events/' + response.id +'">Click here to see your new event!</a>');
			$(".alert").fadeIn();
		}
	});
}

function createEventFromPlan(events, locationthing) {
	var minTime = undefined;
	var maxTime = undefined;

	var hoursToAdd = 0;

	var description = "";

	for (var i = 0; i < events.length; i++) {
		var event = events[i].obj;

		description += (i+1) + ".  ";
		description += event.title + "\n";
		if (event.locationString) {
			description += event.locationString + "\n";
		}
		if (event.url) {
			description +=  event.url + "\n";
		}
		description += "\n";
		
		console.log("creating event!");
		console.log("location: " + locationthing);
		console.log("description: " +  description);
		if (event.start && event.end) {
			// Assumes start is unix time and duration is in seconds
			if (!minTime || event.start < minTime) {
				minTime = event.start;
			}
			if (!maxTime || event.end > maxTime) {
				maxTime = event.end;
			}
		} else {
			hoursToAdd++;
		}
	}

	if (minTime || maxTime) {
		if (!maxTime) {
				maxTime = minTime + 1000 * 3600 * hoursToAdd;
		} else if (!minTime) {
			minTime = maxTime - 1000 * 3600 * hoursToAdd;
		} else {
			maxTime += 1000 * 3600 * hoursToAdd;
		}		
	} else {
		weekendDate = new Date(getWeekendDate());
		minTime = new Date(weekendDate.getFullYear(), weekendDate.getMonth(), weekendDate.getDate());
		maxTime = new Date(weekendDate.getFullYear(), weekendDate.getMonth(), weekendDate.getDate());
		var length;
		// If today is sunday, rest of the weekend is 1 day, otherwise it's 2
		if (weekendDate.getDay() == 0) {
			length = 23;
		} else {
			length = 47;
		}
		maxTime.setHours(47);
		maxTime.setMinutes(59);
	}
  maxTime = (new Date(maxTime)).toISOString();
  minTime = (new Date(minTime)).toISOString();
	FB.api('/me', function(response) {
		createEvent(response.name + "'s Weekend Adventure (Rager)!", minTime, maxTime, locationthing, description);
	});
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

/*var locationthing = "Seattle b1tch3s";
var events = [
{title:'Event 1',description:'The number one event in all of seattle',time:{start:4000000,end:5000000},link:'http://cs.utexas.edu/~jmslocum'},
{title:'Place 1',description:'The number one place in all of seattle',rating:4.7,link:'http://google.com'}
];
createEventFromPlan(events, location);*/

$("#create-event-button").click(function() { createEventFromPlan(window.plannedActivities, window.locationString) });
