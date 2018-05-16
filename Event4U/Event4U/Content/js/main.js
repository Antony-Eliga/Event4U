$(document).ready(function () {
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
});