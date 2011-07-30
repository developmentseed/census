// Define the layers and other map variables
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
    urlBase = $.map(['a','b','c','d'],function(sub) {
      return 'http://' + sub + '.tiles.mapbox.com/devseed/1.0.0/'+layers+'/';
    }),
    mm = com.modestmaps,
    m, test;

// Update tiles array
function getTiles() {
  return $.map(urlBase, function(base) {
    return base + '{z}/{x}/{y}.png256';
  });
};

// Update grid array
function getGrids() {
  return $.map(urlBase, function(base) {
    return base + '{z}/{x}/{y}.grid.json';
  });
};

// Set up tilejson object of map settings
wax.tilejson(urlBase[0]+'layer.json', function(tilejson) {
  tilejson.tiles = getTiles();
  tilejson.grids = getGrids();
  tilejson.minzoom = 4;
  tilejson.maxzoom = 14;
  tilejson.attribution = '<a href="http://developmentseed.org" target="_blank">'
    + '<img src="images/ds.png" /></a> '
    + 'Nominatim search and street level tiles courtesy of '
    + '<a href="http://www.mapquest.com/" target="_blank">'
    + 'MapQuest</a>. Map data © <a href="http://www.openstreetmap.org/"'
    +' target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.';
  
  // Build the map
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
  wax.mm.legend(m, tilejson).appendTo($('#controls')[0]);
  wax.mm.zoomer(m, tilejson).appendTo($('#controls')[0]);
  wax.mm.attribution(m, tilejson).appendTo($('#controls')[0]);
  wax.mm.hash(m, tilejson, {
    defaultCenter: new mm.Location(39, -84),
    defaultZoom: 4,
    manager: wax.mm.locationHash
  });
  
  // Bandwidth detection control and switch element
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
      $(this).hasClass('active') ? $(this).removeClass('active') : $(this).addClass('active');
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
        if (value.type == 'state' || value.type == 'county' || value.type == 'maritime'  || value.type == 'country') {
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
  // Handle form submissions
  var input = $('.location-search input[type=text]'),
      inputTitle = 'Enter a place or zip code';
      input.val(inputTitle);

  $('form.location-search').submit(function (e){
    e.preventDefault();
    var inputValue = input.val(),
        encodedInput = encodeURIComponent(inputValue);
    geocode(encodedInput);
  });

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
   
  // Update and show embed script
  $('a.embed').click(function (e) {
    e.preventDefault();

    var splitLayers = layers.split(','),
        embedlayers = '',
        center = m.pointLocation(new mm.Point(m.dimensions.x/2,m.dimensions.y/2));

    $.each(splitLayers, function(num, key) {
        embedlayers += '&amp;layers%5B%5D=' + num;
    });

    var embedId = 'ts-embed-' + (+new Date());
    var url = '&amp;size=700'
            + '&amp;size%5B%5D=550'
            + '&amp;center%5B%5D=' + center.lon
            + '&amp;center%5B%5D=' + center.lat
            + '&amp;center%5B%5D=' + m.coordinate.zoom
            + embedlayers
            + '&amp;options%5B%5D=zoomwheel'
            + '&amp;options%5B%5D=legend'
            + '&amp;options%5B%5D=tooltips'
            + '&amp;options%5B%5D=zoombox'
            + '&amp;options%5B%5D=attribution'
            + '&amp;el=' + embedId;

    $('.tip input').attr('value', "<div id='" 
      + embedId 
      + "-script'><script src='http://tiles.mapbox.com/devseed/api/v1/embed.js?api=mm" 
      + url 
      + "'></script></div>");
      
    if ($('#embed').hasClass('active')) {
      $('#embed').removeClass('active');
    } else {
      $('#embed').addClass('active');
      $('#embed-code')[0].tabindex = 0;
      $('#embed-code')[0].focus();
      $('#embed-code')[0].select();
    } 
  });
  
  // Refresh share links
  $('#share a').click(function (e){
    e.preventDefault();
    var tweetUrl = 'http://twitter.com/share?via=developmentseed&text=US%20Census%20Map&url='
            + encodeURIComponent(window.location),
        faceUrl = 'http://facebook.com/sharer.php?t=US%20Census%20Map&u='
            + encodeURIComponent(window.location);
    $('#share .twitter').attr('href', tweetUrl);
    $('#share .facebook').attr('href', faceUrl);
    window.open($(this).attr('href'), 'share');
  });
});