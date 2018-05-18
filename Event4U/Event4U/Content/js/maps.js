const key = "AIzaSyCr0Xkn4FXRGGlH2l_x5fzCPB3lU7I02fE"
const baseUrl = "http://data.citedia.com/r1/parks?crs=EPSG:4326";
const rennes = {
    lat: 48.1119800,
    lng: -1.6742900
};
var map = null;
var start = null;
var stop = null;
var event = null;


function urlToJson() {
    const Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET", baseUrl, false);
    Httpreq.send(null);
    return JSON.parse(Httpreq.responseText);
}

function getInfos() {
    const Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET", "http://data.citedia.com/r1/parks/timetable-and-prices", false);
    Httpreq.send(null);
    var csv = Httpreq.responseText;
    Httpreq.responseText.replace(/"(.*?)"/g, function(match, g1, g2) {
        const cleanText = g1.replace(/;/g, " ");
        console.log("responseText", match, "/", g1, "/", g2, "/", cleanText);
        csv = csv.replace(match, cleanText);
    });
    console.log("csv", csv)
    const data = $.csv.toObjects(csv, {
        separator: ";",
        delimiter: "\n"
    });
    console.log("data", data)
    return data;
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
    const infos = getInfos();
    obj && obj.parks.forEach(function(park) {
        var geometry = null;
        var parkingInfo = null;
        features && features.features.forEach(function(feature) {
            if (feature.id == park.id) {
                geometry = feature.geometry;
            }
        });
        infos && infos.forEach(function(info) {
            if (info.Parking == park.id) {
                parkingInfo = info;
            }
        });
        parks.push({
            id: park.id,
            name: park.parkInformation && park.parkInformation.name || "Kleber",
            status: park.parkInformation && park.parkInformation.status || "FULL",
            max: park.parkInformation && park.parkInformation.max || 0,
            free: park.parkInformation && park.parkInformation.free || 0,
            coordinates: geometry.coordinates,
            address: parkingInfo && parkingInfo.Adresse,
            capacite: parkingInfo && parkingInfo.Capacité,
            horaire: parkingInfo && parkingInfo.Horaires,
            seuil: parkingInfo && parkingInfo.Seuil_complet,
            tarif: parkingInfo && parkingInfo.Tarifs
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
            new google.maps.LatLng(event.lat, event.lng),
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
    return locations;
}

function calculate(direction) {
    console.log("calculate => direction", direction, start, stop);
    const request = {
        origin: start,
        destination: stop,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
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
    event = null;
    if (condition) {
        const zoom = 12;
        const center = rennes;

        map = new google.maps.Map(document.getElementById("map"), {
            zoom: zoom,
            center: center
        });
    }
    initAutoComplete();
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
    const glide = new Glide("#intro", {
        type: "slider",
        perView: 4,
        focusAt: "center",
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
    const locations = [event];
    const markerImage = "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m";

    const markers = locations.map(function(location) {
        const position = {
            lat: location.lat,
            lng: location.lng
        };
        const marker = new google.maps.Marker({
            position: position,
            label: location.name,
        });
        const infoWindow = new google.maps.InfoWindow({
            content: location.name,
            position: position
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

function setParkingsMenu(park, i) {
    const coordinates = {
        lat: park.coordinates[1],
        lng: park.coordinates[0]
    };
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
        origins: [start],
        destinations: [coordinates],
        travelMode: "DRIVING",
    }, function(response, status) {
        const duration = response.rows[0].elements[0].duration.text;
        const distance = response.rows[0].elements[0].distance.text;

        console.log("response setParkingsMenu", response, status);
        const html = `<div class="row">
        <div class="col s2 light-blue-text text-darken-1"><i class="material-icons">local_parking</i></div>
        <div class="col s10">${park.name}<br/>
        <span class="teal-text text-accent-4">${duration} - ${distance}</span><br/>
        <span>${park.free}/${park.max} places disponibles</span><br/><br/>
        <span>${park.tarif}</span>
        </div>
        </div>`;
        $(".parking:eq(" + i + ")").data("id", park.id);
        $(".parking:eq(" + i + ")").html(html);
        $(".slider").slider({
            interval: 1000,
            height: 188
        });
        $(".parking:eq(" + i + ")").click(function() {
            stop && initMap();
            stop = coordinates;
            calculate(new google.maps.DirectionsRenderer({
                map: map
            }));
        });
    });
}

$(document).ready(function() {
    //init sideNav sur map
    $(".button-collapse").sideNav({
        closeOnClick: false,
        onOpen: function(el) {
            $(".button-collapse").css("left", "300px");
            $("#sidenav-overlay").hide();
            $(".drag-target").hide();
            $(".button-collapse i").html("arrow_back")
        },
        onClose: function(el) {
            $(".button-collapse").css("left", "0px");
            $(".button-collapse i").html("arrow_forward")
        }
    });

    initGlide();

    $("#go").click(function() {
        $(".container-bienvenue").hide();
        $(".back").show();
        $("main").css("height", "calc(100% - 275px)");
    });

    $("#address").keypress(function(e) {
        if (e.which == 13) {
            e.preventDefault();
        }
    });

    //Click retour arrière
    $(".back").click(function() {
        initMap();
        $(".container-bienvenue").show();
        $(".button-collapse").sideNav("hide");
        $(".button-collapse").hide();
        $(".back").hide();
        $("main").css("height", "calc(100% - 134px)");
    });

    //Click sur un event
    $(".slide").click(function() {
        $(".slide").removeClass("glide__slide--active selected");
        $(this).addClass("selected");

        const events = getEvents();
        const eventOne = _.findWhere(events, {
            Id: $(this).data("id")
        });
        event && initMap();
        event = eventOne;
        updateMap();
        $.ajax({
            url: "http://localhost:53287/EventApi/DetailEvent/" + event.Id,
        }).done(function(data) {
            const parks = get3Parks();
            $(".side-nav").html(data);

            if ($(".side-nav").css("transform") === "matrix(1, 0, 0, 1, -300, 0)") {
                $(".button-collapse").sideNav("show");
            }
            $(".button-collapse").show();

            parks.forEach(function(park, i) {
                setParkingsMenu(park, i);
            });
        });
    });
});