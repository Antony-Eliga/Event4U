$(document).ready(function () {
    function initializeAutocomplete(id) {
        var element = document.getElementById(id);
        if (element) {
            var autocomplete = new google.maps.places.Autocomplete(element, { types: ['geocode'] });
            google.maps.event.addListener(autocomplete, 'place_changed', onPlaceChanged);
        }
    }

    function onPlaceChanged() {
        var place = this.getPlace();

        var lat = place.geometry.location.lat();
        var lng = place.geometry.location.lng();

        $("#latEvent").val(lat);
        $("#lngEvent").val(lng);

        console.log(place);
    }
    google.maps.event.addDomListener(window, 'load', function () {
        initializeAutocomplete('addressEvent');
    });
});