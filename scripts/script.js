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
    m, test;

function getTiles() {
  return _(urlBase).map(function(base) {
    return base + '{z}/{x}/{y}.png256';
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
  tilejson.attribution = '<a href="http://developmentseed.org" target="_blank"><img src="images/ds.png" /></a> '
                       + 'Nominatim search and street level tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. '
                       + 'Map data © <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.';
  
  m = new mm.Map('map',
    new wax.mm.connector(tilejson),
    null,
    [
      new mm.MouseHandler(),
      new mm.DragHandler(),
      new mm.DoubleClickHandler(),
      new mm.TouchHandler()
    ]
  );
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
  var detector = wax.mm.bwdetect(m, {
    auto: true,
    png: '.png64?'
  });
  m.addCallback('drawn', function lqDetect(modestmap, e) {
    if (!detector.bw()) {
      $('#bwtoggle').addClass('lq');
    }
    m.removeCallback(lqDetect);
  });
  $('a#bwtoggle').click(function (e) {
      e.preventDefault();
      $(this).hasClass('lq') ? $(this).removeClass('lq') : $(this).addClass('lq');
      detector.bw(!detector.bw());
  });
});

function geocode(query) {
  loading();

  $.ajax({
    url: 'http://open.mapquestapi.com/nominatim/v1/search?format=json&json_callback=callback&countrycodes=us&limit=1&q=' + query,
    type: 'jsonp',
    jsonpCallback: 'callback',
    success: function (value) {
      value = value[0];
      $('.loading').remove();
      if (value === undefined) {
        errorBox('<p>The search you tried did not return a result.</p>');
      }
      else {
        if (value.type == 'administrative' || value.type == 'county' || value.type == 'maritime'  || value.type == 'country') {
            m.setCenterZoom(new mm.Location(value.lat, value.lon), 7);
        } else {
            m.setCenterZoom(new mm.Location(value.lat, value.lon), 13);
        }
        $('.error').remove();
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

  var input = $('.location-search input[type=text]'),
      inputTitle = 'Enter a place or zip code';
      input.val(inputTitle);

  // Remove default val on blur
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