function createEvent(name, startTime, endTime, locationthing, description) {
	var eventData = {
		"access_token": fbtoken,
		"start_time" : startTime,
		"end_time":endTime,
		"location" : locationthing,
		"name" : name,
		"description":description,
		"privacy":"CLOSED"
	}
	FB.api("/me/events",'post',eventData,function(response){
		if(response.id){
			console.log("SUCCESSFULLY CREATED EVENT " + response.id);
			$(".alert").html('<a href="https://facebook.com/events/' + response.id +'">Your event has been created!</a>');
			$(".alert").fadeIn();
		}
	});
}

function createEventFromPlan(events, locationthing) {
	var minTime = undefined;
	var maxTime = undefined;

	locationthing = "Seattle, WA";

	var hoursToAdd = 0;

	var description = "";

	for (var i = 0; i < events.length; i++) {
		var event = events[i];

		description += event.title;
		if (event.url) {
			description += " - " + event.url;
		}
		description += "\n";

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

	if (!minTime && !maxTime) {
		// figure out weekend
		minTime = getWeekendDate();
	}

	maxTime = minTime + 3600 * 1000 * hoursToAdd;

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

$("#create-event-button").click(createEventFromPlan(window.plannedActivities /*, global location*/));
