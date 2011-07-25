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

function zipcodeYDN(zip) {
    $.ajax({
        url: 'http://api.geonames.org/postalCodeLookupJSON?postalcode=' + zip + '&country=US&username=tristen',
        type: 'json',
            success: function (resp) {
                console.log(resp);
        }
    });
}

domReady(function () {

    var zipValid = true;

    // Remove val on focus
    var input = $('.location-search input'),
        inputTitle = 'Enter zip code here';

    input.blur(function() {
        if (input.val() === '') {
            input.val(inputTitle);
        }
    }).focus(function() {
        if (input.val() === inputTitle) {
            input.val('');
        }
    });

    $('.location-search a.button').click(function (e){
        e.preventDefault();
        if (zipValid) {
            var code = input.val();
            zipcodeYDN(code);
        }
        else {
            alert('Must be a valid zip code');
        }
    });

    // max-zoom: 14
});