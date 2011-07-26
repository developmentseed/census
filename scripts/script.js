var legend;
var layers = 'usa1-census-state-z2-5,';
    layers += 'usa2-census-counties-z6-9,';
    layers += 'usa3-census-tracts-contusa-z10-13,';
    layers += 'usa4-census-tracts-AK-z10-13,';
    layers += 'usa5-census-tracts-HI-z10-13,';
    layers += 'usa6-census-tracts-contusa-z14,';
    layers += 'usa7-census-tracts-AK-z14,';
    layers += 'usa8-census-tracts-HI-z14';

function getTiles() {
    return [
        "http://a.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.jpg",
        "http://b.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.jpg",
        "http://c.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.jpg",
        "http://d.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.jpg"
        ];
};

function getGrids() {
    return [
        "http://a.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.grid.json",
        "http://b.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.grid.json",
        "http://c.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.grid.json",
        "http://d.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.grid.json"
        ];
};

console.log(getTiles());

var tilejson = {
    tilejson: '1.0.0',
    scheme: 'tms',
    tiles: getTiles(),
    grids: getGrids(),
    minzoom: 4,
    maxzoom: 12,
    formatter: function(options, data) {
        console.log(data);
    }
};
var mm = com.modestmaps;
var m = new mm.Map('map', new wax.mm.connector(tilejson));
wax.mm.interaction(m, tilejson);
m.setCenterZoom(new mm.Location(39, -98), 5);
legend = wax.mm.legend(m, tilejson).appendTo(m.parent);
wax.mm.zoomer(m, tilejson).appendTo(m.parent);

function zipcodeYDN(zip) {
    $.ajax({
        url: 'http://api.geonames.org/postalCodeLookupJSON?postalcode=' + zip + '&country=US&username=tristen',
        type: 'json',
            success: function (resp) {
                $.each(resp.postalcodes, function(value) {
                    var lat = value.lat,
                        lng = value.lng;
                    console.log(lat , lng);
                });
        }
    });
}

domReady(function () {

    // Remove val on focus
    var input = $('.location-search input[type=text]'),
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

    $('form.location-search').submit(function (){
        var inputValue = input.val(),
            zipValid = /^\d{5}(-\d{4})?$/.exec(inputValue);

        if (zipValid) {
            var code = input.val();
            zipcodeYDN(code);
        }
        else {
            alert('Must be a valid zip code');
        }
    });
});