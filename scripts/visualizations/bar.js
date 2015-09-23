/**
 * Necessary Requirements
 * d3 - charting library
 * args - command line arguments, passed to node, processed by minimist
 * jsdom - JSDOM library, for accessing browser-less virtual DOM
 */
var d3 = require("d3"),
        minimist = require("minimist"),
        jsdom = require("jsdom"),
        jetpack = require("../../node_modules/d3-jetpack/d3-jetpack.js")(d3);

/**
 * Process arguments from node call using minimist
 */
var args = minimist(process.argv.slice(2)),
        data = JSON.parse(args.data),
        config = JSON.parse(args.config);


// Number formatters
var si = d3.format("s");
var formatters = {
    "string" : function(val) {return val; },
    "currency" : function(val) {
        if (val.toString().length > 4) {
            return d3.format("$.2s")(val).replace(/G/, "B");
        } else {
            return d3.format("$,.0f")(val);
        }
    },
    "integer" : function(val) {
        if (val.toString().length > 4) {
            return d3.format(".3s")(val).replace(/G/, "B");
        } else {
            return d3.format(",0f")(val);
        }
    },
    "decimal" : function(val) {
        if (val.toString().length > 4) {
            return d3.format(".2s")(val).replace(/G/, "B");
        } else {
            return d3.format(",2f")(val);
        }
    },
    "percent" : d3.format(".1%")
};
/*var formatters = {
    "string" : function(val) {return val; },
    "currency" : d3.format("$,.0f"),
    "integer" : d3.format(",0f"),
    "decimal" : d3.format(",2f"),
    "percent" : d3.format(".1%")
};*/

for (var type in config.formats) {
    formatters[type] = d3.format(config.formats[type]);
}

// get chart function object
chart = barChart();

// use available config parameters to override defaults
// height
if ("height" in config && config.height > 0) {
    chart.height(config.height);
}

// width
if ("width" in config && config.width > 0) {
    chart.width(config.width);
}

// barWidth
if ("barWidth" in config && config.barWidth > 0) {
    chart.barWidth(config.barWidth);
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

function barChart() {
            // VARS
            // dims
    var margin = {top: 30, right: 10, bottom: 30, left: 35},
            width = 480 - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom,

            // scales
            x0 = d3.scale.ordinal()
                        .rangeRoundBands([0, width], 0.1),
            x1 = d3.scale.ordinal(),
            y = d3.scale.linear()
                    .range([height, 0]),
            color = d3.scale.category20(),

            // axes
            xAxis = d3.svg.axis()
                .scale(x0)
                .orient("bottom"),

            yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(8);

            // bar widths
            defaultBarWidth = true,
            barWidth = 20;

    function chart(selection) {
        selection.each(function(data) {

            var charLimit = (Math.round(Math.floor(width / 5) / 6) * 5);

            // Should this be a parameter? passed in config?
            var grouping = "Year";

            var groupLabels = d3.keys(data[0]).filter(function(key) { return key !== grouping && key !== "_id"; });

            // This is the step that seems to be the most confused and broken - what shape am i aiming for?
            data.forEach(function(d) {
                d.values = groupLabels.map(function(label) {
                    yAxis.tickFormat(formatters[d[label].type]); // there should really only be one of these?
                    return {name: label, label: formatters[d[label].type](d[label].value), value: d[label].value};
                });
            });

            // container, margined interior container
            var svg = d3.select(this).append('svg')
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .attr("height", height + margin.top + margin.bottom )
                    .attr("font-family", "RobotoCondensed")
                    .attr("width", width + margin.left + margin.right );

            if ("title" in config && config.title !== "") {
                var title = svg.append("g")
                        .attr("height", margin.top + "px")
                        .attr("width", width + "px")
                        .attr("transform", "translate(" + ((width + margin.left + margin.right) / 2) + "," + 24 + ")");

                title.append("text")
                    .attr("fill", "#4A4A4A")
                    .attr("text-anchor", "middle")
                    .attr("font-weight", "bold")
                    .attr("font-size", "7pt")
                    .tspans(d3.wordwrap(config.title, charLimit), 8);
            }

            // augment margin depending on word-wrapped title
            margin.top += (title.selectAll("tspan").size()-1) * 10;
            height = svg.attr("height") - margin.top - margin.bottom;

            var barGroup = svg.append("g")
                    .attr("height", height)
                    .attr("width", width)
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //  set domain for group scale
            x0.domain(data.map(function(d) { return d[grouping].value; }))
                .rangeRoundBands([0, width], 0.1);

            // set domain and range banding for scale for bars within groups
            x1.domain(groupLabels)
                .rangeRoundBands([0, x0.rangeBand()]);

            // set y-scale domain, scaling so there is always a y-axis line above the highest value
            y.domain([0, 1.1 * d3.max(data, function(d) { return d3.max(d.values, function(d) { return d.value; }); })])
                .range([height, 0]);

            // x axis, includes group labels automatically
            var xAxisGroup = barGroup.append("g")
                .attr("transform", "translate(0," + height + ")")
                .attr("font-size", "8pt")
                .call(xAxis)
                .call(function(g) {
                    g.selectAll("path").remove();
                    
                    g.selectAll("g").selectAll("text")
                        .attr("fill", "#4A4A4A")
                        
                    g.selectAll("g").selectAll("line")
                        .attr("stroke", "#979797");
                });

            // Y axis
            var yAxisGroup = barGroup.append("g")
                .attr("transform", "translate(0,0)")
                .attr("font-size", "8pt")
                .call(yAxis)
                .call(function(g) {
                    g.selectAll("path").remove();

                    g.selectAll("g").selectAll("text")
                        .attr("fill", "#4A4A4A")
                        .attr("x", 0);
                    
                    g.selectAll("g").selectAll("line")
                        .attr("x1", 0)
                        .attr("x2", width)
                        .attr("stroke", "#DEDEDE")
                        .attr("stroke-width", "1px");
                });

            // group containers
            var groups = barGroup.selectAll(".group")
                    .data(data)
                    .enter()
                        .append("g")
                        .attr("transform", function(d) { return "translate(" + x0(d[grouping].value) + ", 0)"});

            // bars within groups
            groups.selectAll("rect")
                    .data(function(d) { return d.values; })
                    .enter()
                        .append("rect")
                            .attr("stroke", "white")
                            .attr("width", x1.rangeBand())
                            .attr("x", function(d) { return x1(d.name); })
                            .attr("y", function(d) { return y(d.value); })
                            .attr("height", function(d) { return height - y(d.value); })
                            .style("fill", function(d) { return color(d.name); });

            // text labels
            groups.selectAll("text")
                    .data(function(d) { return d.values; })
                    .enter()
                        .append("text")
                            .text(function(d) { return d.label; })
                            .attr("transform", "rotate(-90)")
                            .attr("text-anchor", "end")
                            .attr("font-size", "8pt")
                            .attr("x", function(d) { return 0 - y(d.value) - 2; })
                            .attr("y", function(d) { return x1(d.name)+(x1.rangeBand() / 2) + 4; })
                            .attr("fill", "#202020");

            // legends
            // Legend scale
            xl = d3.scale.ordinal()
                    .rangeRoundBands([0, (width + ((margin.left + margin.right) / 2))], 0, 0)
                    .domain(d3.range(3));

            // legend container
            var legendGroup = svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top +")");

            // legend boxes
            var legendBoxes = legendGroup.selectAll("rect")
                .data(groupLabels)
                .enter()
                .append("rect")
                    .attr("stroke-width", "0.5pt")
                    .attr("stroke", "#4A4A4A")
                    .attr("height", "8pt")
                    .attr("width", "8pt")
                    .attr("x", function(d, i) { return xl(i % 3); })
                    .attr("y", function(d, i) { return Math.floor(i/3) * 14; })
                    .attr("fill", function(d, i) { return color(d); });

            // legend text
            var legendText = legendGroup.selectAll("text")
                .data(groupLabels)
                .enter()
                .append("text")
                    .attr("fill", "#4A4A4A")
                    .attr("font-size", "8pt")
                    .attr("x", function(d, i) { return xl(i % 3) + 8; })
                    .attr("y", function(d, i) { return Math.floor(i/3) * 14; })
                    .attr("dy", "6pt")
                    .attr("dx", "4")
                    .text(function(d, i) { return d; });

            if ("source" in config && config.source !== "") {
                // source
                var source = svg.append("text")
                    .attr("x", width + margin.left + margin.right)
                    .attr("y", height+margin.top+margin.bottom)
                    .attr("dy", "-2pt")
                    .attr("text-anchor", "end")
                    .attr("font-size", "6pt")
                    .attr("font-style", "italic")
                    .attr("fill", "#C0C0C0")
                    .text(config.source);
            }
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

    chart.barWidth = function(_) {
        if (!arguments.length) return barWidth;
        barWidth = _;
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
