const key = "AIzaSyCr0Xkn4FXRGGlH2l_x5fzCPB3lU7I02fE"
const baseUrl = "http://data.citedia.com/r1/parks?crs=EPSG:4326";
const rennes = {
    lat: 48.1119800,
    lng: -1.6742900
};
const pace = {
    lat: 48.15,
    lng: -1.7667
};

function urlToJson() {
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET", baseUrl, false);
    Httpreq.send(null);
    return JSON.parse(Httpreq.responseText);
}

function getParks() {
    const obj = urlToJson()
    const parks = []
    const features = obj.features;
    obj && obj.parks.forEach(function(park) {
        var geometry = null;
        features && features.features.forEach(function(feature) {
            if (feature.id == park.id) {
                geometry = feature.geometry;
            }
        })
        parks.push({
            id: park.id,
            name: park.parkInformation.name,
            status: park.parkInformation.status,
            max: park.parkInformation.max,
            free: park.parkInformation.max,
            coordinates: geometry.coordinates
        });
    });
    return parks;
}

function get3Parks() {
    var parks = getParks();
    var parksSort = [];
    parks = _.where(parks, {
        status: "AVAILABLE"
    });
    parks = _.filter(parks, function(park) {
        return park.free > 10;
    });
    parks.forEach(function(park) {
        park.distance = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(rennes.lat, rennes.lng),
            new google.maps.LatLng(park.coordinates[1], park.coordinates[0]));
    });
    parksSort = _.sortBy(parks, "distance");
    console.log("parksSort", parksSort);
    return [parksSort[0], parksSort[1], parksSort[2]];
}

function getLocations() {
    const parks = getParks()
    const locations = [];
    parks.forEach(function(park) {
        locations.push({
            coordinates: {
                lat: park.coordinates[1],
                lng: park.coordinates[0]
            },
            name: park.name
        })
    })
    return locations;
}

function get3Locations() {
    const parks = get3Parks()
    const locations = [];
    parks.forEach(function(park) {
        locations.push({
            coordinates: {
                lat: park.coordinates[1],
                lng: park.coordinates[0]
            },
            name: park.name
        })
    })
    return locations;
}

function calculate(direction) {
    var request = {
        origin: pace,
        destination: rennes,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    }
    var directionsService = new google.maps.DirectionsService();
    directionsService.route(request, function(response, status) { // Envoie de la requête pour calculer le parcours
        if (status == google.maps.DirectionsStatus.OK) {
            direction.setDirections(response); // Trace l'itinéraire sur la carte et les différentes étapes du parcours
        }
    });
}

const locations = getLocations();

function initMap() {
    const iconBase = "https://maps.google.com/mapfiles/kml/shapes/";
    const parking = {
        url: "parking.png",
        size: new google.maps.Size(32, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 32)
    };

    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: rennes
    });

    const locations3 = get3Locations();
    // Add some markers to the map.
    // Note: The code uses the JavaScript Array.prototype.map() method to
    // create an array of markers based on a given "locations" array.
    // The map() method here has nothing to do with the Google Maps API.
    var markers = locations3.map(function(location) {
        const marker = new google.maps.Marker({
            position: location.coordinates,
            label: location.name,
            icon: parking
        });
        const infoWindow = new google.maps.InfoWindow({
            content: location.name,
            position: location.coordinates
        });
        google.maps.event.addListener(marker, "click", function() {
            infoWindow.open(map, marker);
        });
        return marker;
    });




    // Add a marker clusterer to manage the markers.
    var markerCluster = new MarkerClusterer(map, markers, {
        imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m"
    });

    direction = new google.maps.DirectionsRenderer({
        map: map
    });

    calculate(direction);
}