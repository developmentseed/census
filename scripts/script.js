var tilejson = {
    tilejson: '1.0.0',
    scheme: 'tms',
    tiles: ['http://a.tiles.mapbox.com/nate/1.0.0/natural-earth-1/{z}/{x}/{y}.png'],
    grids: ['http://a.tiles.mapbox.com/nate/1.0.0/natural-earth-1/{z}/{x}/{y}.grid.json'],
    formatter: function(options, data) {
        console.log(data);
    }
};
var mm = com.modestmaps;
var m = new mm.Map('map', new wax.mm.connector(tilejson));
wax.mm.interaction(m, tilejson);
m.setCenterZoom(new mm.Location(39, -98), 5);