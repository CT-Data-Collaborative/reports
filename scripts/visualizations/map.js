/**
 * Necessary Requirements
 * d3 - charting library
 * args - command line arguments, passed to node, processed by minimist
 * jsdom - JSDOM library, for accessing browser-less virtual DOM
 *
 * Special for the map viz code
 * fs - python filesystem interactions (file)
 * path - python path manipulation (os.path)
 */
var d3 = require("d3"),
        minimist = require("minimist"),
        jsdom = require("jsdom"),
        fs = require("fs");//,
        // path = require("path");

/**
 * Process arguments from node call using minimist
 */
var args = minimist(process.argv.slice(2)),
        data = JSON.parse(args.data),
        config = JSON.parse(args.config),
        geography = args.geography;


// get geojson from file - proposed node parameters as follows
// ie --data="" --config="" --geography="/full/path/to/geometry/file"

// This works too
// console.log(path.join(__dirname, "../static/town_shapes.json"));

var geojson = fs.readFileSync("/vagrant/static/town_shapes.json", {encoding : "utf8"})
geoData = JSON.parse(geojson);


// get chart function object
chart = mapChart();

// use available config parameters to override defaults
// height
if ("height" in config && config.height > 0) {
    chart.height(config.height);
}

// width
if ("width" in config && config.width > 0) {
    chart.width(config.width);
}

//Color scale
if ("colors" in config && config.colors.length > 0) {
    chart.colors(config.colors);
}

// get body from jsdom, call chart function
var document = jsdom.jsdom();
var body = d3.select(document.body)
            .html("")
            .datum(data)
            .call(chart);

console.log(body.html());

function mapChart() {
    var width = 200,
            height = 200,
            margin = 5, // %
            colors = d3.scale.category20();

    function chart(selection) {
        selection.each(function(data) {

            // Convert data to standard representation greedily;
            // this is needed for nondeterministic accessors.
            data = data;
            // data = data.map(function(d, i) {
            //     return [label.call(data, d, i), value.call(data, d, i)];
            // });

            // SVG Container
            var svg = d3.select(this).append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("xmlns", "http://www.w3.org/2000/svg");
                // .append("g")
                    // .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            // create a first guess for the projection - a unit project of 1px centered at 0,0
            var projection = d3.geo.mercator()
                        .scale(1) 
                        .translate([0,0]);

            // create the path
            var path = d3.geo.path().projection(projection);

            // using the path determine the bounds of the current map and use 
            // these to determine better values for the scale and translation
            var bounds  = path.bounds(geoData),
                    hscale = (bounds[1][0] - bounds[0][0]) / width,
                    vscale = (bounds[1][1] - bounds[0][1]) / height,
                    scale = (1-(margin/100)) / Math.max(hscale, vscale),
                    translate = [(width - scale * (bounds[1][0] + bounds[0][0])) / 2, (height - scale * (bounds[1][1] + bounds[0][1])) / 2];

            // update values accordingly in the projection object
            projection.scale(scale).translate(translate);

            // map features
            svg.selectAll("path")
                .data(geoData.features)
                .enter()
                .append("path")
                    .attr("d", path)
                    .attr("stroke", "0.5px")
                    .attr("fill", "black")
                    // .attr("fill-opacity", function() {return Math.random();} )
                    .attr("fill-opacity", function(d) { return (d.properties.NAME10 == "Hartford" ? 1 : 0)} )
                    .attr("stroke", "black");
        });
    }

    /**
     * Getter-Setter functions for chart function object
     */
    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    chart.colors = function(_) {
      if (!arguments.length) return colors;
      colors = d3.scale.ordinal()
                        .range(_);
      return chart;  
    };

    // These will probably never be used, but keeping for posterity
    chart.label = function(_) {
        if (!arguments.length) return label;
        label = _;
        return chart;
    };

    chart.value = function(_) {
        if (!arguments.length) return value;
        value = _;
        return chart;
    };

    return chart;
}
