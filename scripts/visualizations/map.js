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
        fs = require("fs");

/**
 * Process arguments from node call using minimist
 */
var args = minimist(process.argv.slice(2)),
        data = JSON.parse(args.data),
        config = JSON.parse(args.config);//,
        // geography = args.geography;

// Number formatters
var formatters = {
    "string" : function(val) {return val; },
    "currency" : d3.format("$,.0f"),
    "integer" : d3.format(",0f"),
    "decimal" : d3.format(",2f"),
    "percent" : d3.format(".1%")
};

for (var type in config.formats) {
    formatters[type] = d3.format(config.formats[type]);
}

// // get geojson from file - proposed node parameters as follows - UNCOMMENT CODE ON @ LINE 23
// ie --data="" --config="" --geography="/full/path/to/geometry/file"
// var geojson = fs.readFileSync(geographyFile, {encoding : "utf8"})

var geojson = fs.readFileSync("/vagrant/static/geography/town_shapes.json", {encoding : "utf8"})
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

// margin
if ("margin" in config && config.margin > 0) {
    chart.margin(config.margin);
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
            colors = d3.scale.category20()
            fill = d3.scale.linear()
                        .range([0, 1])
                        .domain([0, 1]);

    function chart(selection) {
        selection.each(function(data) {

            // Convert data to standard representation greedily;
            // this is needed for nondeterministic accessors.
            data = data;
            // data = data.map(function(d, i) {
            //     return [label.call(data, d, i), value.call(data, d, i)];
            // });

            fill.domain([0, d3.max(data.slice(1), function(d) { return d[1].value; })]);

            // SVG Container
            var svg = d3.select(this).append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .append("g");

            // create a first guess for the projection - a unit project of 1px centered at 0,0
            var projection = d3.geo.equirectangular()
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

            // add data to geodata
            geoData.features.forEach(function(feature, index, features) {
                dataForLocation = data.filter(function(d) {
                    return d[0].value == feature.properties.GEOID10
                }).pop();
                geoData.features[index].properties.DATAVALUE = (dataForLocation ? dataForLocation[1].value : null);
            });

            // map features
            svg.selectAll("path")
                .data(geoData.features)
                .enter()
                .append("path")
                    .attr("d", path)
                    .attr("stroke", "0.5px")
                    .attr("fill", "black")
                    .attr("fill-opacity", function(d, i) { return fill(d.properties.DATAVALUE); })
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

    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
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
