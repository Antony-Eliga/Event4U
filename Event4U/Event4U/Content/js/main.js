$(document).ready(function () {
    Materialize.updateTextFields();

    $(".delete-image").on("click", function (e) {
        e.preventDefault();
        var id = $(this).attr('data-id')
        console.log("id => " + id);

        jQuery.ajax({
            url: window.origin + '/EventApi/DeleteImageById/' + id,
            type: "GET",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                if (data.Message == "Ok") {
                    $("#" + id).fadeOut("slow");
                }
            }
        });
    });

    $('#datetimepicker').datetimepicker({
        format: 'm/d/Y H:i:s',
    });
    $('#datefintimepicker').datetimepicker({
        format: 'm/d/Y H:i:s',
    });
});