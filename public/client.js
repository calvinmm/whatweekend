navigator.geolocation.getCurrentPosition(sendPosition);

function sendPosition(position) {
  var data = {
    latitude: position.coords.latitude, 
    longitude: position.coords.longitude
  };
  $.ajax({
    type: "POST",
    url: "/places",
    data: JSON.stringify(data),
    success: function(data) {alert("Got response"); console.log(data);},
    dataType: "json", 
    contentType: "application/json"
  });
}
