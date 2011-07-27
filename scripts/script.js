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
      'world-borders-dark-0-6'
    ].join(','),
    urlBase = _(['a','b','c','d']).map(function(sub) {
      return 'http://' + sub + '.tiles.mapbox.com/devseed/1.0.0/'+layers+'/';
    }),
    mm = com.modestmaps,
    m;

function getTiles() {
  return _(urlBase).map(function(base) {
    return base + '{z}/{x}/{y}.png';
  });
};

function getGrids() {
  return _(urlBase).map(function(base) {
    return base + '{z}/{x}/{y}.grid.json';
  });
};

wax.tilejson(urlBase[0]+'layer.json', function(tilejson) {
  tilejson.tiles = getTiles();
  tilejson.grids = getGrids();
  tilejson.minzoom = 4;
  tilejson.maxzoom = 14;
  tilejson.attribution = '<a href="developmentseed.org"><img src="images/ds.png" /></a>Location search by <a href="http://geonames.org">GeoNames</a>. '
                         + 'Street level map © <a href="http://www.mapquest.com">MapQuest</a>. '
                         + 'Map data © <a href="http://www.openstreetmap.org/">OpenStreetMap</a> and contributors, CC-BY-SA.';
  
  m = new mm.Map('map', new wax.mm.connector(tilejson));

  m.setCenterZoom(new mm.Location(39, -98), 5);
  wax.mm.interaction(m, tilejson);
  wax.mm.zoombox(m, tilejson);
  wax.mm.legend(m, tilejson).appendTo(m.parent);
  wax.mm.zoomer(m, tilejson).appendTo(m.parent);
  wax.mm.attribution(m, tilejson).appendTo(m.parent);
  wax.mm.hash(m, tilejson, {
    defaultCenter: new mm.Location(39, -84),
    defaultZoom: 4,
    manager: wax.mm.locationHash
  });
});

function geocode(query) {
  loading();

  $.ajax({
    url: 'http://api.geonames.org/searchJSON?q=' + query + '&maxRows=1&country=US&username=tristen&callback=callback',
    type: 'jsonp',
    jsonpCallback: 'callback',
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

function loading() {
  $('body').append('<div class="loading"><img src="images/loader.gif" alt="loading" /></div>');
}

domReady(function () {
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