﻿$(document).ready(function () {
    //$('.parallax').parallax();

    google.maps.event.addDomListener(window, 'load', function () {
        initializeAutocomplete('addressHome');
    });

    function initializeAutocomplete(id) {
        var element = document.getElementById(id);
        if (element) {
            var autocomplete = new google.maps.places.Autocomplete(element, { types: ['geocode'] });
            google.maps.event.addListener(autocomplete, 'place_changed', onPlaceChanged);
        }
    }

    function onPlaceChanged() {
        var place = this.getPlace();
        
        //Bouton

        console.log(place);
    }
});