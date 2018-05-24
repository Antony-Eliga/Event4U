const data = {
    parkingUrl: "https://data.rennesmetropole.fr/api/records/1.0/search/?dataset=export-api-parking-citedia",
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

// Récupère la liste des évènements
function getEvents() {
    return urlToData(data.eventUrl);
}

//Création d'un objet plus cohérent pour le parking
function getCleanPark(park) {
    return {
        id: park && park.key,
        name: park && park.key,
        status: park && park.status,
        max: park && park.max || 0,
        free: park && park.free || 0,
        coordinates: park && park.geo,
        tarif_15: park && park.tarif_15,
        tarif_30: park && park.tarif_30,
        tarif_1h: park && park.tarif_1h,
        tarif_1h30: park && park.tarif_1h30,
        tarif_2h: park && park.tarif_2h,
        tarif_3h: park && park.tarif_3h,
        tarif_4h: park && park.tarif_4h,
        horaire: park && park.orgahoraires
    };
}

// Liste des parkings
function getParks() {
    const obj = urlToData(data.parkingUrl);
    const list = obj && obj.records;
    const parks = [];
    list && list.forEach(function(park) {
        parks.push(getCleanPark(park.fields));
    });
    console.log("getParks => parks", parks);
    return parks;
}

// Liste des 3 parkings les plus proches d'un évènement et libre
function get3Parks(event) {
    var parks = getParks();
    parks = _.where(parks, {
        status: "OUVERT"
    });
    parks = _.filter(parks, function(park) {
        return park.free > 10;
    });
    parks.forEach(function(park) {
        park.distance = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(event.lat, event.lng),
            new google.maps.LatLng(park.coordinates[0], park.coordinates[1]));
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
        data.origin = place.geometry.location;
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
    if (pathname === "/") {
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
        initAutoComplete();
    } else if (pathname.search("/events/Create") !== -1 || pathname.search("/events/Edit") !== -1) {
        initAutoComplete();
    }

    console.log("navigator.geolocation", navigator.geolocation);
}

// Initialisation du glide (slide des events)
function initGlide() {
    const pathname = window.location.pathname;
    if (pathname === "/") {
        const glide = new Glide("#intro", {
            type: "slider",
            perView: 4,
            focusAt: "center",
            breakpoints: {
                800: {
                    perView: 1
                },
                480: {
                    perView: 1
                }
            }
        });
        glide.mount()
    } else {
        $("#intro").hide();
    }
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

function roundDecimal(nombre, precision) {
    var precision = precision || 2;
    var tmp = Math.pow(10, precision);
    return Math.round(nombre * tmp) / tmp;
}

function getCout(park, event) {
    const duree = 570;
    var cout = 0;
    var cout30 = roundDecimal((park.tarif_30 > 0) ? park.tarif_30 : (park.tarif_1h30 - park.tarif_1h));
    console.log("cout30", cout30);
    if (duree < 15) {
        cout = park.tarif_15;
    } else if (duree < 30) {
        cout = park.tarif_30;
    } else if (duree < 60) {
        cout = park.tarif_1h;
    } else {
        cout = Math.ceil(duree / 30) * cout30;
    }
    return roundDecimal(cout);
}

function setParkingMenu(park, coordinates, i) {
    $(".parking:eq(" + i + ")").click(function() {
        data.destination = coordinates;
        if (data.origin) {
            routeTrace(data.direction, data.origin, data.destination);
        } else {
            $(".back").trigger("click");
        }
    });

    var html = `<div class="row">
                      <div class="col s2 light-blue-text text-darken-1">
                        <i class="material-icons">local_parking</i>
                      </div>
                      <div class="col s10">${park.name}<br/>`
    html += data.origin ?
        `<span class="teal-text text-accent-4">${park.duration} - ${park.distance}</span>
        <br/>` : "";
    html += `<span>${park.free}/${park.max} places disponibles</span><br/>
            <br/>
            <span class="light-blue-text text-darken-4">Coût estimé ~${getCout(park,data.event)}€</span>
          </div>
        </div>`;
    $(".parking:eq(" + i + ")").data("id", park.id);
    $(".parking:eq(" + i + ")").html(html);
    $(".slider").slider({
        interval: 1000,
        height: 188
    });
}

function setParkingsMenu(parks) {
    parks.forEach(function(park, i) {
        const service = new google.maps.DistanceMatrixService();
        const coordinates = {
            lat: park.coordinates[0],
            lng: park.coordinates[1]
        };
        if (data.origin) {
            service.getDistanceMatrix({
                origins: [data.origin],
                destinations: [coordinates],
                travelMode: "DRIVING",
            }, function(response, status) {
                const row = response && response.rows && response.rows[0];
                const element = row && row.elements && row.elements[0];
                const duration = element && element.duration && element.duration.text;
                const distance = element && element.distance && element.distance.text;
                park.distance = distance;
                park.duration = duration;
                setParkingMenu(park, coordinates, i);
            });
        } else {
            setParkingMenu(park, coordinates, i);
        }
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
        if (data.origin) {
            $(".btn-floating.btn-large").removeClass("red").addClass("green");
            if (data.destination) {
                setParkingsMenu(get3Parks(data.event));
                $(".slide.selected").trigger("click");
                routeTrace(data.direction, data.origin, data.destination);
            }
        }
    });

    $("#address").keypress(function(e) {
        if (e.which == 13) {
            e.preventDefault();
        }
    });

    //Click retour arrière
    $(".back").click(function() {
        $(".container-bienvenue").show();
        $(".button-collapse").sideNav("hide");
        $(".button-collapse").hide();
    });
}

function getDetailEvent(id) {
    return urlToData(data.detailUrl + id, true);
}

$(document).ready(function() {
    navigator.geolocation.getCurrentPosition(function(position) {
        data.origin = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        $(".btn-floating.btn-large").removeClass("red").addClass("green");
    });
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
        setParkingsMenu(get3Parks(eventOne));
        //CSS + affichage SideNav
        if ($(".side-nav").css("transform") === "matrix(1, 0, 0, 1, -300, 0)") {
            $(".button-collapse").sideNav("show");
        }
        $(".button-collapse").show();
    });
});