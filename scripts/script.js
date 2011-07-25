var tilejson = {
    tilejson: '1.0.0',
    scheme: 'tms',
    tiles: ['http://a.tiles.mapbox.com/mapbox/1.0.0/natural-earth-1/{z}/{x}/{y}.png'],
    grids: ['http://a.tiles.mapbox.com/mapbox/1.0.0/natural-earth-1/{z}/{x}/{y}.grid.json'],
    formatter: function(options, data) {
        console.log(data);
    }
};
var mm = com.modestmaps;
var m = new mm.Map('map', new wax.mm.connector(tilejson));
wax.mm.interaction(m, tilejson);
m.setCenterZoom(new mm.Location(39, -98), 5);

$(function(){
    var zipValid = true;

    $.ajax({
        url: 'http://where.yahooapis.com/geocode?q=1600+Pennsylvania+Avenue,+Washington,+DC&appid=tvFrqN30',
        success: function(data) {
            console.log(data);
        }
    });
    // Remove val on focus
    var input = $('.location-search input'),
        formTitle = 'Enter zip code here';

    input.blur(function() {
        if (input.val() === '') {
            input.val(formTitle);
        }
    }).focus(function() {
        if (input.val() === formTitle) {
            input.val('');
        }
    });

    $('.location-search a.button').click(function (e){
        e.preventDefault();
        if (zipValid) {
            console.log(input.val());
        }
        else {
            alert('Must be a valid code');
        }
    });
});