args = require("minimist")(process.argv.slice(2));

if (args.config) {
    args.config = JSON.parse(args.config);
}

var d3 = require('d3');
var document = require('jsdom').jsdom();

var dataset = JSON.parse(args.data);

var width = 460,
    height = 300;

// get geojson from file - not sure if this is the best way of doing it, or if python should pass geojson as parameter
// ie --data="" --config="" --geography=""
var fs = require("fs");
var path = require("path");
// This works too
// console.log(path.join(__dirname, "../static/town_shapes.json"));
var geojson = fs.readFileSync("/vagrant/static/town_shapes.json", {encoding : "utf8"})
geoData = JSON.parse(geojson);


// stuff and things
var projection = d3.geo.mercator()
        .center([-72.664979, 41.55])
        .scale(Math.pow(10,4.0))
        .translate([width/2, height/2]);

var path = d3.geo.path()
        .projection(projection);

// get body from jsdom
var body = d3.select(document.body);

// var svg = body.html("").append("svg")
//         .attr("xmlns", "http://www.w3.org/2000/svg")
//         .attr("width", width)
//         .attr("height", height)
//         .append("g")
//         .attr("translate", [height/2, width/2]);

// var path = svg.selectAll("path")
//         .data(geojson.features)
//         .enter()
//         .append("path")
//             .attr("d", path)
//             .attr("stroke", "0.5px")
//             .attr("fill", "steelblue")
//             .attr("fill-opacity", function() {return Math.random();} )
//             .attr("stroke", "black");

var width  = 300;
var height = 400;

var vis = body.html("").append("svg")
  .attr("width", width).attr("height", height)

// create a first guess for the projection
var center = d3.geo.centroid(geoData)
var scale = 150;
var offset = [width/2, height/2];
var projection = d3.geo.mercator().scale(scale).center(center)
    .translate(offset);

// create the path
var path = d3.geo.path().projection(projection);

// using the path determine the bounds of the current map and use 
// these to determine better values for the scale and translation
var bounds  = path.bounds(geoData);
var hscale  = scale*width  / (bounds[1][0] - bounds[0][0]);
var vscale  = scale*height / (bounds[1][1] - bounds[0][1]);
var scale   = (hscale < vscale) ? hscale : vscale;
var offset  = [width - (bounds[0][0] + bounds[1][0])/2,
                        height - (bounds[0][1] + bounds[1][1])/2];

// new projection
projection = d3.geo.mercator()
        .center(center)
        .scale(scale)
        .translate(offset);
path = path.projection(projection);

// add a rectangle to see the bound of the svg
vis.append("rect").attr('width', width).attr('height', height)
.style('stroke', 'black').style('fill', 'none');

vis.selectAll("path").data(geoData.features).enter().append("path")
.attr("d", path)
.style("fill", "red")
.style("stroke-width", "1")
.style("stroke", "black")


console.log(body.html());
