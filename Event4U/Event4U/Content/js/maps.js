const key = "AIzaSyCr0Xkn4FXRGGlH2l_x5fzCPB3lU7I02fE"
const baseUrl = "http://data.citedia.com/r1/parks?crs=EPSG:4326";
const rennes = {
    lat: 48.1119800,
    lng: -1.6742900
};
var map = null;
var start = null;


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
    console.log("getParks => parks", parks);
    return parks;
}

function get3Parks() {
    var parks = getParks();
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
    parks = _.sortBy(parks, "distance");
    console.log("get3Parks => parks", parks);
    return [parks[0], parks[1], parks[2]];
}

function getLocations(parks) {
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
    console.log("getLocations => locations", locations);
    return locations;
}

function calculate(direction) {
    console.log("calculate => direction", direction, start);
    const request = {
        origin: start,
        destination: rennes,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    }
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            direction.setDirections(response);
        }
    });
}

function placeChanged(isBack) {
    const place = this.getPlace();
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    console.log("placeChanged", place);
    if (isBack) {
        $("#latEvent").val(lat);
        $("#lngEvent").val(lng);
    } else {
        start = {
            lat: lat,
            lng: lng
        };
    }
}

function initMap() {
    const zoom = 12;
    const center = rennes;

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: zoom,
        center: center
    });

    google.maps.event.addDomListener(window, "load", function() {
        const eventName = "place_changed";
        const element = document.getElementById("address");
        const autocomplete = new google.maps.places.Autocomplete(element, {
            types: ["geocode"]
        });
        google.maps.event.addListener(autocomplete, eventName, placeChanged);
    });
}

function updateMap() {
    const locations = getLocations(get3Parks());
    const markerImage = "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m";
    const parking = {
        url: "Content/img/parking.png",
        size: new google.maps.Size(32, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 32)
    };

    const markers = locations.map(function(location) {
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

    const markerCluster = new MarkerClusterer(map, markers, {
        imagePath: markerImage
    });

    calculate(new google.maps.DirectionsRenderer({
        map: map
    }));
}

$(document).ready(function () {
    $("#go").click(function() {
        updateMap();
        $(".container-bienvenue").hide();
        $(".back").show();
        $(".eventList").slideDown();
        $("nav").slideUp();
    });

    $(".back").click(function () {
        initMap();
        $(".container-bienvenue").show();
        $(".back").hide();
        $(".eventList").slideUp();
        $("nav").slideDown();
    });
});