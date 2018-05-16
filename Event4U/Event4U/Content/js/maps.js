const key = "AIzaSyCr0Xkn4FXRGGlH2l_x5fzCPB3lU7I02fE"
const baseUrl = "http://data.citedia.com/r1/parks?crs=EPSG:4326";
const rennes = {
    lat: 48.1119800,
    lng: -1.6742900
};
var map = null;
var start = null;
var stop = null;


function urlToJson() {
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET", baseUrl, false);
    Httpreq.send(null);
    return JSON.parse(Httpreq.responseText);
}

function getEvents() {
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET", "http://localhost:53287/EventApi/IndexJson", false);
    Httpreq.send(null);
    return JSON.parse(Httpreq.responseText);
}

function getParks() {
    const obj = urlToJson()
    const parks = [];
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
    console.log("calculate => direction", direction, start, stop);
    const request = {
        origin: start,
        destination: stop,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    }
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            updateMap();
            direction.setDirections(response);
        }
    });
}

function placeChanged() {
    const pathname = window.location.pathname;
    const condition = (pathname == "/events/Create");
    const place = this.getPlace();
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    console.log("placeChanged", place);
    if (condition) {
        $("#lat").val(lat);
        $("#lng").val(lng);
    } else {
        start = {
            lat: lat,
            lng: lng
        };
    }
}

function initMap() {
    const pathname = window.location.pathname;
    const condition = (pathname != "/events/Create");
    if (condition) {
        const zoom = 12;
        const center = rennes;

        map = new google.maps.Map(document.getElementById("map"), {
            zoom: zoom,
            center: center
        });
    }
    initAutoComplete()
}

function initAutoComplete() {
    google.maps.event.addDomListener(window, "load", function() {
        const eventName = "place_changed";
        const element = document.getElementById("address");
        const autocomplete = new google.maps.places.Autocomplete(element, {
            types: ["geocode"]
        });
        google.maps.event.addListener(autocomplete, eventName, placeChanged);
    });
}

function initGlide() {
    const glide = new Glide('#intro', {
        type: 'slider',
        perView: 4,
        focusAt: 'center',
        breakpoints: {
            800: {
                perView: 2
            },
            480: {
                perView: 1
            }
        }
    })

    glide.mount()
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

}

$(document).ready(function() {
    $("#go").click(function() {
        $(".container-bienvenue").hide();
        $(".back").show();
        $(".eventList").slideDown();
        $("main").css("height", "calc(100% - 275px)");
        initGlide();
    });

    $(".back").click(function() {
        initMap();
        $(".container-bienvenue").show();
        $(".back").hide();
        $("main").css("height", "calc(100% - 134px)");
        $(".eventList").slideUp();
    });

    $(".slide").click(function() {
        $(".slide").removeClass("glide__slide--active selected");
        $(this).addClass("selected");
        const events = getEvents();
        const event = _.findWhere(events, {
            Id: $(this).data("id")
        });
        stop && initMap();
        stop = {
            lat: event.lat,
            lng: event.lng
        };
        calculate(new google.maps.DirectionsRenderer({
            map: map
        }));
    });
});