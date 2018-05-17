$(document).ready(function () {
    Materialize.updateTextFields();

    $(".eventList").html();

    $.getJSON("EventApi/IndexJson", function (data) {
        $.each(data, function (key, val) {
            $(".eventList .row").append(eventHtml(val));
        });
    });

    function eventHtml(val) {
        console.log(val.name + val.lat + ' ' + val.lng);
        var html = "<div class='col s12 m4'><div class='card-panel'>" + val.name + "</div></div>";
        return html;
    };

    $('.datepicker').pickadate({
        selectMonths: true,
        selectYears: 2,
        labelMonthNext: 'Mois suivant',
        labelMonthPrev: 'Mois précédent',
        labelMonthSelect: 'Selectionner le mois',
        labelYearSelect: 'Selectionner une année',
        monthsFull: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        monthsShort: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'],
        weekdaysFull: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
        weekdaysLetter: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
        today: 'Aujourd\'hui',
        clear: 'Réinitialiser',
        close: 'Fermer',
        format: 'dd/mm/yyyy'
    });

});