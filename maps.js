const glide = new Glide('#intro', {
    type: 'carousel',
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

$(".slide").click(function() {
    $(".slide").removeClass("glide__slide--active selected");
    $(this).addClass("selected");
});