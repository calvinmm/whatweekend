function renderSuggestedEvents() {
  var newHtml = "";


  document.getElement("suggested-places").innerHtml = newHtml;
}

function renderSuggestedPlaces() {
  
}

function renderPlannedActivities() {  
  
}

function drawBestLists(suggestedPlaces, suggestedEvents) {
    var placesInnerHtml = "";
    var eventsInnerHtml = "";

    var i = 0;
    for(i = 0; i < suggestedPlaces.length; i++)
		{
			placesInnerHtml += addPlace(suggestedPlaces[i], i >= 5);
		}
    for(i = 0; i < suggestedEvents.length; i++)
		{
			eventsInnerHtml += addEvent(suggestedEvents[i], i >= 5);
		}
		document.getElementById("suggested-places").innerHTML = placesInnerHtml;
		document.getElementById("suggested-events").innerHTML = eventsInnerHtml;
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
  place.id = encodeURI(place.title);
	var starsString = stars(place.rating);
  var temp_thing = "<img class='item-img' src='" + place.image + 
          "' alt='Planned Image' height='100' width='100'>";
  var toReturn =  
    "<tr id='place" + place.id + "' style='" + (hide ? "display: none;" : "") + "'>" + 
      "<td>" + 
        "<div class='activity-item'>" +
        "<div class='title-div activity-item'>" +
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
			    "<span class='checkxbuttons'><button id='buttonwant"+place.id +"' type='button' class='btn btn-success button-want'><i class='icon-ok'></i></button> <button id='buttonremove"+place.id + "'type='button' class='btn btn-danger button-remove'><i class='icon-remove'></i></button></span>"+
			  "</div></div>"+
		  "</td>"+
		"</tr>";
  return toReturn;
}

function addEvent(eventItem, hide)
{
  eventItem.id = encodeURI(eventItem.title);
	var toReturn =
    "<tr id='event" + eventItem.id+"' style='" + (hide ? "display: none;" : "") + "'>" + 
			"<td>" + 
        "<div class='activity-item'>" +
				"<div class='title-div activity-item'>" +
          "<a target='_blank' href='"+ 
          (eventItem.url == undefined ? "#" : eventItem.url)+"'>" + 
          eventItem.title + "</a>" + 
        "</div>" +
			  "<div class='item-tile activity-item'>" + 
			    "<div class='item-content activity-item'>"
			      eventItem.locationString + 
			    "</div>" + 
			    "<span class='checkxbuttons'><button id='buttonwant" + eventItem.id +"' type='button' class='btn btn-success button-want'><i class='icon-ok'></i></button> <button id='buttonremove"+eventItem.id + "'type='button' class='btn btn-danger button-remove'><i class='icon-remove'></i></button></span>"+
			  "</div></div>"+
		  "</td>"+
		"</tr>";
  return toReturn;
}

function displayThings(activities) {
	console.log(activities);
  window.suggestedPlaces = activities.places;
	window.suggestedEvents = activities.events;
	window.plannedActivities = new Array();
   
  drawBestLists(suggestedPlaces, suggestedEvents);
  
  $('.button-remove').click(function() {
		var currId = $(this).attr('id');
		currId = currId.substring("buttonremove".length);
	  $('#event' + currId).hide();
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
      $('#place' + currId).hide();
		} else {
      $('#event' + currId).hide();
    }

    // slice out the added thing
    var object;
    if (type == "place") {
      object = window.suggestedPlaces(index, 1)[0];
		} else {
      object = window.suggestedEvents(index, 1)[0];
    }
    // append to the plannedActivities

    renderSuggestedEvents();
    renderSuggestedPlaces();
    if (type == "place") {
		  appendPlace(object);
    } else {
      appendEvent(object);
    }
	});
}

function appendPlace(place) {
  var toAdd = addPlace(place, false);
  window.plannedActivities.add({type: "place", obj: place});
  renderPlannedActivities();
}

function appendEvent(eventItem) {
  var toAdd = addEvent(eventItem, false);
  window.plannedActivities.add({type: "event", obj: eventItem});
  renderPlannedActivities();
}
