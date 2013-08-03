navigator.geolocation.getCurrentPosition(sendPosition);

function sendPosition(position) {
  data = {
    latitude: position.coords.latitude, 
    longitude: position.coords.longitude
  };
  console.log("sending request of", data);
  $.ajax({
    type: "POST",
    url: "/places",
    data: JSON.stringify(data),
    success: function(data) {alert("Got response"); console.log(data);},
    dataType: "json", 
    contentType: "application/json"
  });
}
