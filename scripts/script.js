var layers = [
    'externals.streetlevel',
    'mapbox.natural-earth-1',
    'usa1-census-state-z2-5',
    'usa2-census-counties-z6-9',
    'usa3-census-tracts-contusa-z10-13',
    'usa4-census-tracts-AK-z10-13',
    'usa5-census-HI-z10-14',
    'usa6-census-tracts-contusa-z14',
    'usa7-census-tracts-AK-z14',
    'mapbox.world-borders-dark'
    ];

function getTiles() {
    return [
        "http://a.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.png",
        "http://b.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.png",
        "http://c.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.png",
        "http://d.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.png"
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
var tilejson = {
    tilejson: '1.0.0',
    scheme: 'tms',
    tiles: getTiles(),
    grids: getGrids(),
    minzoom: 4,
    maxzoom: 14
};
var mm = com.modestmaps;
var m = new mm.Map('map', new wax.mm.connector(tilejson));
m.setCenterZoom(new mm.Location(39, -98), 5);
wax.mm.interaction(m, tilejson);
wax.mm.legend(m, tilejson).appendTo(m.parent);
wax.mm.zoomer(m, tilejson).appendTo(m.parent);

function geocode(query) {
    loading();
    $.ajax({
        url: 'http://api.geonames.org/searchJSON?q=' + query + '&maxRows=1&country=US&username=tristen',
        type: 'json',
        success: function (resp) {
            $('.loading').remove();
            if (resp.geonames[0]) {
                $.each(resp.geonames, function(value) {
                    m.setCenterZoom(new mm.Location(value.lat, value.lng), 12);
                });
                $('.error').remove();
            }
            else {
                errorBox('<p>The search you tried did not return a result.</p>');
            }
        }
    });
}

function errorBox(reason) {
    $('form.location-search').append('<div class="error">' + reason + '<a href="#" class="close">x</a><div>');
    $('a.close').click(function(e) {
        e.preventDefault();
        $('.error').remove();
    });
}

function locationHash() {
    if(location.hash) {
        var value = location.hash.split('#');
        geocode(value[1]);
    }
}

function loading() {
    $('body').append('<div class="loading"><img src="images/loader.gif" alt="loading" /></div>');
}

domReady(function () {
    locationHash();

    // Remove val on focus
    var input = $('.location-search input[type=text]'),
        inputTitle = 'Enter a place or zip code';

    input.blur(function() {
        if (input.val() === '') {
            input.val(inputTitle);
        }
    }).focus(function() {
        if (input.val() === inputTitle) {
            input.val('');
        }
    });

    $('form.location-search').submit(function (e){
        e.preventDefault();
        var inputValue = input.val(),
        encodedInput = encodeURIComponent(inputValue);
        geocode(encodedInput);
    });
});