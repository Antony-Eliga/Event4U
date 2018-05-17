$(document).ready(function() {
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET", "http://data.citedia.com/r1/parks/timetable-and-prices", false);
    Httpreq.send(null);
    Httpreq.responseText;
    data = $.csv.toObjects(Httpreq.responseText, {
        separator: ";",
        delimiter: "\n"
    });
    console.log("data", data)
});