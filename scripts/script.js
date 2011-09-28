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
  tilejson.attribution = '<a href="http://npr.org" target="_blank">'
    + '<img class="npr-white" src="images/npr.png" /></a> '
    + '<a href="http://developmentseed.org" target="_blank">'
    + '<img src="images/ds.png" /></a> '
    + '<div class="attr-note">Nominatim search and street level tiles courtesy of '
    + '<a href="http://www.mapquest.com/" target="_blank">'
    + 'MapQuest</a>. Map data © <a href="http://www.openstreetmap.org/"'
    +' target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.</div>';
  
  // Build the map
  m = new mm.Map('map',
    new wax.mm.connector(tilejson),
    null,
    [
      new mm.MouseHandler(),
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
      $('#bwtoggle').removeClass('active');
    }
    m.removeCallback(lqDetect);
  });
  $('a#bwtoggle').click(function (e) {
      e.preventDefault();
      $(this).hasClass('active') ? $(this).removeClass('active') : $(this).addClass('active');
      detector.bw(!detector.bw());
  });
});

// Send address to MapQuest's Nominatim search
function geocode(query) {

  // Show loading image
  loading();

  // Get API response
  $.ajax({
    url: 'http://open.mapquestapi.com/nominatim/v1/search?format=json&json_callback=callback&countrycodes=us&limit=1&q=' 
      + query,
    type: 'jsonp',
    jsonpCallback: 'callback',
    
    // If successful respone
    success: function (value) {
      // Use first response
      value = value[0];
      // Remove loading image
      $('.loading').remove();
      // If no response
      if (value === undefined) {
        errorBox('<p>The search you tried did not return a result.</p>');
      }
      // If valid response
      else {
        // adjust zoom level based on geography
        if (value.type == 'state' || value.type == 'county' || value.type == 'maritime'  || value.type == 'country') {
            m.setCenterZoom(new mm.Location(value.lat, value.lon), 7);
        } else {
            m.setCenterZoom(new mm.Location(value.lat, value.lon), 13);
        }
        // if successful, remove error message
        $('.error').remove();
      }
    }
  });
}

// Show error message
function errorBox(reason) {
  $('form.location-search').append('<div class="error">' + reason + '<a href="#" class="close">x</a><div>');
  $('a.close').click(function(e) {
    e.preventDefault();
    $('.error').remove();
  });
}

// Show loading image
function loading() {
  $('body').append('<div class="loading"><img src="images/loader.gif" alt="loading" /></div>');
}

domReady(function () {
  //contextual layer switching
	    $('.layers li a').click(function() {
	    	if (this.id == "total-pop"){
	    		activeLayers = [
	    			'usa1-census-state-z2-5',
      				'usa2-census-counties-z6-9',
      				'usa3-census-tracts-contusa-z10-13',
      				'usa4-census-tracts-AK-z10-13',
      				'usa5-census-HI-z10-14',
      				'usa6-census-tracts-contusa-z14',
      				'usa7-census-tracts-AK-z14',
	    		].join(',');
	    	}
	    	if (this.id == "hispanic-pop"){
	    		activeLayers = [
	    			'usa1-census-state-z2-5',
      				'usa2-census-counties-z6-9',
      				'usa3-census-tracts-contusa-z10-13',
      				'usa4-census-tracts-AK-z10-13',
      				'usa5-census-HI-z10-14',
      				'usa6-census-tracts-contusa-z14',
      				'usa7-census-tracts-AK-z14',
	    		].join(',');
	    	}

	    	$('.layers li a').removeClass('active');
      		$(this).addClass('active');
	    	layers = [
            	'externals.streetlevel',
      			'mapbox.natural-earth-1',
		        activeLayers,
		        'world-borders-dark-0-6'
            ].join(',');
            
            refreshMap();
        });

  // Handle geocoder form submission
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
     
  // Open embed modal
  $('a.embed').click(function(e) {
    e.preventDefault();       
    openModal('#modal-embed');
    $('#embed-code')[0].tabindex = 0;
    $('#embed-code')[0].focus();
    $('#embed-code')[0].select();
  });
  
  // Close modals
  $('.modal a.close').click(function (e){
    e.preventDefault();
    $('#overlay').hide();
    $(this).closest('.modal').hide();
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

// Open a modal window
function openModal(element) {
  $('#overlay, ' + element).css('display', 'block');
}

// Refresh Map
function refreshMap() {
		urlBase = $.map(['a','b','c','d'],function(sub) {
      	  return 'http://' + sub + '.tiles.mapbox.com/devseed/1.0.0/'+layers+'/';
    	}),
  		wax.tilejson(urlBase[0]+'layer.json', function(tilejson) {
  			tilejson.minzoom = 4;
	      	tilejson.maxzoom = 14;
	      	tilejson.tiles = getTiles();
	      	tilejson.grids = getGrids();
	      	m.setProvider(new wax.mm.connector(tilejson));
		    $('.wax-legends').remove(); 
		    legend = wax.mm.legend(m, tilejson).appendTo(m.parent);
		    interaction.remove();
		    interaction = wax.mm.interaction(m, tilejson);
		});
	}