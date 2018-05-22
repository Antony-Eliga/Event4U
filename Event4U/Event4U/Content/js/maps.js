const data = {
    key: "AIzaSyCr0Xkn4FXRGGlH2l_x5fzCPB3lU7I02fE",
    parkingUrl: "http://data.citedia.com/r1/parks?crs=EPSG:4326",
    csvUrl: "http://data.citedia.com/r1/parks/timetable-and-prices",
    eventUrl: "http://localhost:53287/EventApi/IndexJson",
    detailUrl: "http://localhost:53287/EventApi/DetailEvent/",
    markerImage: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
    rennes: {
        lat: 48.1119800,
        lng: -1.6742900
    },
    map: null,
    origin: null,
    destination: null,
    event: null
}

//Json à partir d'une url
function urlToData(url, text) {
    const Httpreq = new XMLHttpRequest();
    Httpreq.open("GET", url, false);
    Httpreq.send(null);
    return text ? Httpreq.responseText : JSON.parse(Httpreq.responseText);
}

//Json à partir d'un csv
function csvToJson(csv) {
    const base = csv;
    const chaineRegex = /"(.*?)"/g;
    const replaceRegex = /;/g;
    csv.replace(chaineRegex, function(match, g1, g2) {
        const cleanText = g1.replace(replaceRegex, " ");
        csv = csv.replace(match, cleanText);
    });
    return ret = $.csv.toObjects(csv, {
        separator: ";",
        delimiter: "\n"
    });
}

//Récupère la liste des horaires + tarifs
function getInfos() {
    const csv = urlToData(data.csvUrl, true);
    return csvToJson(csv)
}

// Récupère la liste des évènements
function getEvents() {
    return urlToData(data.eventUrl);
}

//Création d'un objet plus cohérent pour le parking
function getCleanPark(park, infos, features) {
    const parkInfo = park && park.parkInformation;
    features = features && features.features
    var geometry = null;
    var information = null;
    //Parse feature pour récupérer coordonnées GPS
    features && features.forEach(function(feature) {
        if (feature.id == park.id) {
            geometry = feature.geometry;
        }
    });

    //Parse information pour récupéré tarifs + horaires
    infos && infos.forEach(function(info) {
        if (info.Parking == park.id) {
            information = info;
        }
    });

    //Formatage des parkings
    return {
        id: park && park.id,
        name: parkInfo && parkInfo.name || "Kleber",
        status: parkInfo && parkInfo.status || "FULL",
        max: parkInfo && parkInfo.max || 0,
        free: parkInfo && parkInfo.free || 0,
        coordinates: geometry.coordinates,
        address: information && information.Adresse,
        capacite: information && information.Capacité,
        horaire: information && information.Horaires,
        seuil: information && information.Seuil_complet,
        tarif: information && information.Tarifs
    };
}

// Liste des parkings
function getParks() {
    const obj = urlToData(data.parkingUrl);
    const parks = [];
    obj && obj.parks.forEach(function(park) {
        parks.push(getCleanPark(park, getInfos(), obj.features));
    });
    console.log("getParks => parks", parks);
    return parks;
}

// Liste des 3 parkings les plus proches d'un évènement et libre
function get3Parks(event) {
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
    console.log("get3Parks => parks", parks, parks.slice(0, 3));
    return parks.slice(0, 3);
}

//Trace l'itinéraire entre un point A et B
function routeTrace(direction, origin, destination) {
    console.log("routeTrace => direction", direction, origin, destination);
    const request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            direction.setDirections(response);
        }
    });
}

//Initialisation des variables après autocomplete
function placeChanged() {
    const pathname = window.location.pathname;
    const condition = (pathname === "/");
    const place = this.getPlace();
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    if (condition) {
        data.origin = {
            lat: lat,
            lng: lng
        };
    } else {
        $("#lat").val(lat);
        $("#lng").val(lng);
    }
}

//Ajout de l'autocomplete Google sur input
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

//Initialisation de la carte Google
function initMap() {
    const pathname = window.location.pathname;
    const condition = (pathname === "/");
    if (condition) {
        data.map = new google.maps.Map(document.getElementById("map"), {
            zoom: 12,
            center: data.rennes
        });

        data.direction = new google.maps.DirectionsRenderer({
            map: data.map
        });

        data.markerCluster = new MarkerClusterer(data.map, null, {
            imagePath: data.markerImage
        });
    }
    initAutoComplete();
}

// Initialisation du glide (slide des events)
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

function addMarkerInfo(marker, content, position) {
    const infoWindow = new google.maps.InfoWindow({
        content: location.name,
        position: position
    });
    google.maps.event.addListener(marker, "click", function() {
        infoWindow.open(data.map, marker);
    });
}

//Ajoute les markers sur la carte
function addMarkers(locations) {
    console.log("addMarkers", locations);
    if (locations) {

        const markers = [];
        locations = Array.isArray(locations) ? locations : [locations]

        locations.forEach(function(location) {
            const position = {
                lat: location.lat,
                lng: location.lng
            };
            const marker = new google.maps.Marker({
                position: position,
                label: location.name,
            });

            addMarkerInfo(marker, location.name, position);
            markers.push(marker);
        });

        markers.forEach(function(marker) {
            data.markerCluster.addMarker(marker);
        });
    }
}

function setParkingsMenu(parks) {
    parks.forEach(function(park, i) {
        const service = new google.maps.DistanceMatrixService();
        const coordinates = {
            lat: park.coordinates[1],
            lng: park.coordinates[0]
        };

        service.getDistanceMatrix({
            origins: [data.origin],
            destinations: [coordinates],
            travelMode: "DRIVING",
        }, function(response, status) {
            const row = response && response.rows && response.rows[0];
            const element = row && row.elements && row.elements[0];
            const duration = element && element.duration && element.duration.text;
            const distance = element && element.distance && element.distance.text;

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
                data.destination = coordinates;
                routeTrace(data.direction, data.origin, data.destination);
            });
        });
    });
}

function initDom() {
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
    });
}

function getDetailEvent(id) {
    return urlToData(data.detailUrl + id, true);
}

$(document).ready(function() {
    initDom();
    const events = getEvents();

    //Click sur un event
    $(".slide").click(function() {
        //Ajout css selection
        $(".slide").removeClass("selected");
        $(this).addClass("selected");

        const eventOne = _.findWhere(events, {
            Id: $(this).data("id")
        });
        data.event = eventOne;
        data.markerCluster.clearMarkers();
        addMarkers(eventOne);

        $(".side-nav").html(getDetailEvent(eventOne.Id));

        //CSS + affichage SideNav
        if ($(".side-nav").css("transform") === "matrix(1, 0, 0, 1, -300, 0)") {
            $(".button-collapse").sideNav("show");
        }
        $(".button-collapse").show();

        setParkingsMenu(get3Parks(eventOne));
    });
});