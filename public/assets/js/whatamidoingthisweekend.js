function renderSuggestedEvents() {
  var newHtml = "";
  for(i = 0; i < window.suggestedEvents.length && i < 5; i++) {
			newHtml += addEvent(window.suggestedEvents[i], false);
  }
  if (newHtml.length == 0) {
    newHtml = "<div class='item-tile'>No more events available.</div>";
  }
  $("#suggested-events").html(newHtml);
}

function renderSuggestedPlaces() {
  var newHtml = "";
  for(i = 0; i < window.suggestedPlaces.length && i < 5; i++) {
			newHtml += addPlace(window.suggestedPlaces[i], false);
  }
  if (newHtml.length == 0) {
    newHtml = "<div class='item-tile'>No more places available.</div>";
  }
  $("#suggested-places").html(newHtml);
}

function renderPlannedActivities() {  
  var newHtml = "";
  for(i = 0; i < window.plannedActivities.length; i++) {
      if (window.plannedActivities[i].type == 'event') {
			  newHtml += addEvent(window.plannedActivities[i].obj, false);
      } else {
			  newHtml += addPlace(window.plannedActivities[i].obj, false);
      }
  }
  if (newHtml.length == 0) {
    newHtml = "<div class='item-tile'>No activities planned yet.</div>";
  }
  $("#planned-activities").html(newHtml);
  $("#planned-activities").find(".button-want").hide();
}

function stars(rating) {
  var stars = "";
  count = 0;
  while (rating > 0) {
    if (rating - 1 >= 0) {
      stars += "<i class='icon-star'></i>";
      rating -= 1;
      count ++;
      continue;
    } else if (rating - .5 >= 0) {
      stars += "<i class='icon-star-half-full'></i>" 
      rating -= .5;
      count ++;
      continue;
    } else {
      break;
    }
  }
  while (count < 5) {
    stars += "<i class='icon-star-empty'></i>";
    count++;
  }
  return stars;
}

function addPlace(place, hide) {
  place.id = Math.floor(Math.random() * 1000000000 + 1);
	var starsString = stars(place.rating);
  var temp_thing = "<img class='item-img' src='" + place.image + 
          "' alt='Planned Image' height='100' width='100'>";
  var toReturn =  
    "<tr id='place" + place.id + "' style='" + (hide ? "display: none;" : "") + "'>" + 
      "<td>" + 
        "<div class='activity-item'>" +
        "<div class='title-div activity-item'>" +
			    "<span class='checkxbuttons'><button id='buttonwant"+place.id +"' type='button' class='btn btn-success button-want'><i class='icon-ok'></i></button> <button id='buttonremove"+place.id + "'type='button' class='btn btn-danger button-remove'><i class='icon-remove'></i></button></span>"+
          "<a target='_blank' href='" + 
            (place.url == undefined ? "#" : place.url) + "'>" + place.title + 
          "</a>" +  
        "</div>" +
			  "<div class='item-tile activity-item'>" + 
		      (place.image == undefined ? "<img class='item-img' height='100' width='100' src='assets/img/noimage.jpg'>" : temp_thing) + 
			    "<div class='item-content activity-item'>"  +
            place.locationString + 
            "<br/>" +
            starsString + 
  			  "</div>" + 
			  "</div></div>"+
		  "</td>"+
		"</tr>";
  return toReturn;
}

function addEvent(eventItem, hide)
{
  eventItem.id = Math.floor(Math.random() * 1000000000 + 1);
	console.log(eventItem);
  var toReturn =
    "<tr id='event" + eventItem.id+"' style='" + (hide ? "display: none;" : "") + "'>" + 
			"<td>" + 
        "<div class='activity-item'>" +
				"<div class='title-div activity-item'>" +
			    "<span class='checkxbuttons'><button id='buttonwant" + eventItem.id +"' type='button' class='btn btn-success button-want'><i class='icon-ok'></i></button> <button id='buttonremove"+eventItem.id + "'type='button' class='btn btn-danger button-remove'><i class='icon-remove'></i></button></span>"+
          "<a target='_blank' href='"+ 
          (eventItem.url == undefined ? "#" : eventItem.url)+"'>" + 
          eventItem.title + "</a>" + 
        "</div>" +
			  "<div class='item-tile activity-item'>" + 
			    "<div class='item-content activity-item'>" +
			      (eventItem.locationString == undefined ? "location unknown" : eventItem.locationString) +
            "<br />" +
            (eventItem.date == undefined ? "" : eventItem.date) +
			    "</div>" + 
			  "</div></div>"+
		  "</td>"+
		"</tr>";
  return toReturn;
}

function displayThings(activities) {
  window.suggestedPlaces = activities.places;
	window.suggestedEvents = activities.events;
	window.plannedActivities = new Array();
   
  renderSuggestedPlaces();
  renderSuggestedEvents();
  renderPlannedActivities(); 
  attachListeners(); 
}

function attachListeners() {
  $('.button-remove').click(function() {
		var currId = $(this).attr('id');
		currId = currId.substring("buttonremove".length);

    var type = "";
    var index = -1;
    var i = 0;
    for(i = 0; i < window.suggestedPlaces.length; i++)
		{
		  if (window.suggestedPlaces[i].id == currId) {
        index = i;
        type = "place";
      }
    }
    for(i = 0; i < window.suggestedEvents.length; i++)
		{
      if (window.suggestedEvents[i].id == currId) {
        index = i;
        type = "event";
      }
		}
    for(i = 0; i < window.plannedActivities.length; i++)
		{
      if (window.plannedActivities[i].obj.id == currId) {
        index = i;
        type = "activity";
      }
		}
    if (type == "place") {
      $('#place' + currId).fadeOut(function() {
        var object = window.suggestedPlaces.splice(index, 1)[0];
        renderSuggestedPlaces();
        attachListeners();
      });
    } else if (type == "event") {
      $('#event' + currId).fadeOut(function() {
        var object = window.suggestedEvents.splice(index, 1)[0];
        renderSuggestedEvents();
        attachListeners();
      });
    } else if (type == "activity") {
      var prefix = window.plannedActivities[index].type == "place" ? "#place" : "#event";
      $(prefix + currId).fadeOut(function() {
        var object = window.plannedActivities.splice(index, 1)[0];
        if (object.type == "place") {
          returnPlace(object.obj);
        } else {
          returnEvent(object.obj);
        }
        renderPlannedActivities();
        attachListeners();
      });
    }
  });
	
	$('.button-want').click(function() {
		var currId = $(this).attr('id');
		currId = currId.substring("buttonwant".length);
	  
    //go through all events and places to get index and type
    var type = "";
    var index = -1;
    var i = 0;
    for(i = 0; i < window.suggestedPlaces.length; i++)
		{
		  if (window.suggestedPlaces[i].id == currId) {
        index = i;
        type = "place";
      }
    }
    for(i = 0; i < window.suggestedEvents.length; i++)
		{
      if (window.suggestedEvents[i].id == currId) {
        index = i;
        type = "event";
      }
		}
    
    if (type == "place") {
      $('#place' + currId).fadeOut(function() {
        var object = window.suggestedPlaces.splice(index, 1)[0];
        renderSuggestedPlaces();
        appendPlace(object);
        attachListeners();
      });
		} else {
      $('#event' + currId).fadeOut(function () {
        var object = window.suggestedEvents.splice(index, 1)[0];
        renderSuggestedEvents();
        appendEvent(object);
        attachListeners(); 
      });
    } 
  });
}

function returnPlace(place) {
  window.suggestedPlaces.push(place);
  renderSuggestedPlaces();
}

function returnEvent(eventItem) {
  window.suggestedEvents.push(eventItem);
  renderSuggestedEvents();
}

function appendPlace(place) {
  var toAdd = addPlace(place, false);
  window.plannedActivities.push({type: "place", obj: place});
  renderPlannedActivities();
}

function appendEvent(eventItem) {
  var toAdd = addEvent(eventItem, false);
  window.plannedActivities.push({type: "event", obj: eventItem});
  renderPlannedActivities();
}
