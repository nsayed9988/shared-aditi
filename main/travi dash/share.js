let map;
let marker;

function initMap() {
  // Default map options
  const defaultLocation = { lat: 0, lng: 0 };

  // Create a new Google Map centered at the default location
  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultLocation,
    zoom: 2,
  });

  // Add a marker (optional)
  marker = new google.maps.Marker({
    position: defaultLocation,
    map: map,
    title: "Your Location",
  });
}

document.getElementById("shareLocation").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Center map on user's location
        map.setCenter(userLocation);
        map.setZoom(14);

        // Update the marker position
        marker.setPosition(userLocation);

        alert(
          `Your current location: Latitude: ${userLocation.lat}, Longitude: ${userLocation.lng}`
        );
      },
      () => {
        alert("Unable to retrieve your location.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});
