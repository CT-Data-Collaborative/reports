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
        fs = require("fs"),
        ss = require("simple-statistics");

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
    var margin = {"top" : 10, "left" : 20, "bottom" : 10, "right" : 10}
            width = 460 - margin.left - margin.right,
            height = 320 - margin.top - margin.bottom,
            fontSize = d3.scale.threshold()
                    .domain(d3.range(11).map(function(i){ return i*100; }))
                    .range(d3.range(2,8,0.5)),
            // margin = 10, // % - should re-implement as standard margin in px {top, right, bottom, left}
            colors = d3.scale.category20(),
            jenks = d3.scale.threshold(),
            numBreaks = 5;

    function chart(selection) {
        selection.each(function(data) {

            // Convert data to standard representation greedily;
            // this is needed for nondeterministic accessors.
            data = data;
            // reshape data

            // SVG Container
            var svg = d3.select(this).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("xmlns", "http://www.w3.org/2000/svg")
                
            var map = svg.append("g")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform", "translate("+margin.top+", "+margin.right+")");

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
                    scale = 1 / Math.max(hscale, vscale),
                    translate = [(width - scale * (bounds[1][0] + bounds[0][0])) / 2, (height - scale * (bounds[1][1] + bounds[0][1])) / 2];

            // update values accordingly in the projection object
            projection.scale(scale).translate(translate);

            // add data to geodata
            geoData.features.forEach(function(feature, index, features) {
                dataForLocation = data.filter(function(d) {
                    return d.FIPS.value == feature.properties.GEOID10;
                }).pop();
                if (dataForLocation) {
                    geoData.features[index].properties.DATAVALUE = dataForLocation.Value.value;
                    dataType = dataForLocation.Value.type; // we only have one type, really
                } else {
                    geoData.features[index].properties.DATAVALUE = null;
                }
            });


            // define domain, range scale by jenks-type clustered breaks
            breaks = ss.ckmeans(
                    data.map(function(d) { return d.Value.value }),
                    numBreaks
                );
            jenks.domain(breaks.map(function(cluster) {return cluster[0];}));
            //Two ways of coloring with Jenks-type breaks
            // Using a predifined (by us, most likely) categorical color pallete
            jenks.range(["#EEEEEE"].concat(d3.range(numBreaks).map(function(i) { return colors(i); })));
            // OR by using colorbrewer
            // js version of colorbrewer, this would require us to install/include colorbrewer, which doesn't seem to be available from npm
            // jenks.range(colorbrewer.Blues[numBreaks])
            // css version -> would require us to include colorbrewer css file in template, which seems easier.
            // jenks.range(d3.range(numBreaks).map(function(i) {return "q"+i+"-9"; }))

            // map features
            var map = map.selectAll("path")
                .data(geoData.features)
                .enter()
                .append("path")
                    .attr("d", path)
                    .attr("stroke-width", "0.5px")
                    .attr("stroke", "black")
                    // if using predefined color pallette
                    .attr("fill", function(d) { return jenks(d.properties.DATAVALUE); });
                    // if using colorbrewer as JS
                    // .attr("fill", function(d) { return colors(jenks(d.properties.DATAVALUE)); });
                    // if using colorbrewer css
                    // .attr("class", function(d) { return colors(jenks(d.properties.DATAVALUE)); });

            var legend = svg.append("g")
                    .attr("height", 0.25*height)
                    .attr("width", 0.5*width)
                    .attr("transform", "translate(" + (width + margin.left + margin.right) * 0.5 + "," + (height + margin.top + margin.bottom) * 0.75 + ")");

            var legendData = jenks.range().map(function(color, index) {
                if (index === 0) {
                    return []
                } else {
                    return [breaks[index-1][0], breaks[index-1][breaks[index-1].length-1]]
                }
            });

            var legendBoxes = legend.selectAll("rect")
                .data(legendData)
                .enter()
                .append("rect")
                    .attr("stroke-width", "0.5px")
                    .attr("stroke", "black")
                    // if using predefined color pallette
                    .attr("fill", function(d) {
                        return d.length > 0 ? jenks(d[0]) : jenks(null);
                    })
                    // if using colorbrewer as JS
                    // .attr("fill", function(d) { return colors(jenks(d.properties.DATAVALUE)); })
                    // if using colorbrewer css
                    // .attr("class", function(d) { return colors(jenks(d.properties.DATAVALUE)); })
                    .attr("height", 0.03*height)
                    .attr("width", 0.03*height)
                    .attr("x", 0)
                    .attr("y", function(d, i) { return i*0.03*height+"px"});

            var legendText = legend.selectAll("text")
                .data(legendData)
                .enter()
                .append("text")
                    .attr("font-size", fontSize(height)+"pt")
                    .attr("dy", function(d, i) { return (i+1)*0.03*height+"px"})
                    .attr("dx", 0.03*height+"px")
                    .text(function(d, i) {
                        if (i === 0) {
                            return "Undefined/Suppressed";
                        } else {
                            var low = formatters[dataType](d[0]),
                                high = formatters[dataType](d[1]);
                            return low+" - "+high;
                        }
                    });
        });
    }

    /**
     * Getter-Setter functions for chart function object
     */
    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _ - margin.left - margin.right;
        return chart;
    };

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _ - margin.top - margin.bottom;
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
