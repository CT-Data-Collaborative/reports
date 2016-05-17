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
const SUBSCRIPT = [
    "\u2080",
    "\u2081",
    "\u2082",
    "\u2083",
    "\u2084",
    "\u2085",
    "\u2086",
    "\u2087",
    "\u2088",
    "\u2089"
];
const SUPERSCRIPT = [
    "\u2070",
    "\u00B9",
    "\u00B2",
    "\u00B3",
    "\u2074",
    "\u2075",
    "\u2076",
    "\u2077",
    "\u2078",
    "\u2079"
];
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
            return d3.format(",.0f")(val);
        }
    },
    "decimal" : function(val) {
        if (val.toString().length > 4) {
            return d3.format(".2s")(val).replace(/G/, "B");
        } else {
            return d3.format(",.2f")(val);
        }
    },
    "percent" : d3.format(".1%"),
    "superscript" : function(val) {
        return val.toString()
            .split("")
            .map(function(character) { return SUPERSCRIPT[+character]})
            .join("");
    },
    "subscript" : function(val) {
        return val.toString()
            .split("")
            .map(function(character) { return SUBSCRIPT[+character]})
            .join("");
    }
};
var tickFormatters = {
    "string" : function(val) {return val; },
    "currency" : function(val) {
        if (val.toString().length > 4) {
            return d3.format("$.0s")(val).replace(/G/, "B");
        } else {
            return d3.format("$,.0f")(val);
        }
    },
    "integer" : function(val) {
        if (val.toString().length > 4) {
            return d3.format(".1s")(val).replace(/G/, "B");
        } else {
            return d3.format(",.0f")(val);
        }
    },
    "decimal" : function(val) {
        if (val.toString().length > 4) {
            return d3.format(".1s")(val).replace(/G/, "B");
        } else {
            return d3.format(",.1f")(val);
        }
    },
    "percent" : d3.format(".0%")
};

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
            x = d3.scale.ordinal()
                    .rangeRoundBands([0, width], 0.1),
            y = d3.scale.linear()
                    .range([height, 0]),
            color = d3.scale.category20(),

            // axes
            xAxis = d3.svg.axis()
                .scale(x)
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

            var charLimit = Math.round(Math.floor((width + margin.right + margin.left) / 6) / 5) * 5;

            data.map(function(d) {
                key = Object.keys(d)[0];
                d.values = {name: key, label: formatters[d[key].type](d[key].value), value: (d[key].value)}
                yAxis.tickFormat(tickFormatters[d[key].type]); // there should really only be one of these?
                return d;
            });

            // container, margined interior container
            var svg = d3.select(this).append('svg')
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .attr("height", height + margin.top + margin.bottom )
                    .attr("font-family", "RobotoCondensed")
                    .attr("width", width + margin.left + margin.right );

            if ("title" in config && config.title !== "") {
                var title = svg.append("g")
                        .attr("height", margin.top)
                        .attr("width", width)
                        .attr("transform", "translate(" + ((width + margin.left + margin.right) / 2) + "," + 24 + ")");

                title.append("text")
                    .attr("fill", "#4A4A4A")
                    .attr("text-anchor", "middle")
                    .attr("font-weight", "bold")
                    .attr("font-size", "8pt")
                    .tspans(d3.wordwrap(config.title, charLimit), 8);

                if ("footnote_number" in config && config.footnote_number != "") {
                    var lastSpan = title.select("text").node().lastChild;
                    lastSpan = d3.select(lastSpan)

                    lastSpan.text(
                        lastSpan.text() + formatters["superscript"](config.footnote_number)
                    );

                    // lastSpan.append("tspan")
                    //     .attr("font-size", "4pt")
                    //     .attr("baseline-shift", "super")
                    //     .attr("dx", 0)
                    //     .attr("dy", 0)
                    //     .attr("x", function() {
                    //         /*This needs to return (this.getComputedTextLength() / 2)*/
                    //         return ((lastSpan.text().length / 2) * 4.5)
                    //     })
                    //     .text(config.footnote_number)
                }
            }

            // augment margin depending on word-wrapped title
            margin.top += (title.selectAll("tspan").size()-1) * 8;
            height = svg.attr("height") - margin.top - margin.bottom;

            var barGroup = svg.append("g")
                    .attr("height", height)
                    .attr("width", width)
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //  set domain for group scale
            x.rangeRoundBands([0, width], 0.1)
                .domain(data.map(function(d) { return Object.keys(d)[0]; }));

            // set y-scale domain, scaling so there is always a y-axis line above the highest value
            var maxVal = d3.max(data, function(d) {
                return +d.values.value;
            });

            if (maxVal < 1.0) {
                y.domain([0,1]);
            } else {
                y.domain([0, 1.1 * maxVal]);
            }

            y.range([height, 0])

            // x axis, includes group labels automatically
            var xAxisGroup = barGroup.append("g")
                .attr("transform", "translate(0," + height + ")")
                .attr("font-size", "7pt")
                .call(xAxis)
                .call(function(g) {
                    g.selectAll("path").remove();
                    
                    g.selectAll("g").selectAll("text")
                        .attr("fill", "#4A4A4A");
                        
                    g.selectAll(".tick text")
                        .each(function() {
                            var text = d3.select(this).text();

                            d3.select(this)
                                .text(null)
                                .tspans(d3.wordwrap(text, charLimit/(data.length)), 8);

                            d3.select(this).selectAll("tspan:empty").remove();

                            d3.select(this).selectAll("tspan")
                                .each(function(d, i){
                                    d3.select(this)
                                        // .attr("dx", "10pt")
                                        .attr("dy", function() {
                                            return (i > 0 ? "8pt" : 0)
                                        })
                                })
                        })

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
            // var groups = barGroup.selectAll(".group")
            //         .data(data)
            //         .enter()
            //             .append("g")
            //             .attr("transform", function(d) { return "translate(" + x(d.values.name) + ", 0)"});

            // bars within groups
            barGroup.selectAll("rect")
                    .data(data)
                    .enter()
                        .append("rect")
                            .attr("stroke", "white")
                            .attr("width", x.rangeBand())
                            .attr("x", function(d) { return x(d.values.name); })
                            .attr("y", function(d) { return y(+d.values.value); })
                            .attr("height", function(d) { return height - y(+d.values.value); })
                            .style("fill", function(d) { return color(d.name); });


            if (x.rangeBand() > 10) {
                // text labels
                barGroup.selectAll("text.value_label")
                        .data(data)
                        .enter()
                            .append("text")
                                .classed("value_label", true)
                                .text(function(d) { return d.values.label; })
                                // .attr("transform", "rotate(-90)")
                                .attr("text-anchor", "middle")
                                .attr("font-size", "8pt")
                                .attr("y", function(d) { return y(+d.values.value) - 2; })
                                .attr("x", function(d) { return x(d.values.name) + (x.rangeBand()/2); })
                                .attr("fill", "#202020");
            }

            // if ("source" in config && config.source !== "") {
            //     // source
            //     var source = svg.append("text")
            //         .attr("x", width + margin.left + margin.right)
            //         .attr("y", height+margin.top+margin.bottom)
            //         .attr("dy", "-2pt")
            //         .attr("text-anchor", "end")
            //         .attr("font-size", "6pt")
            //         .attr("font-style", "italic")
            //         .attr("fill", "#C0C0C0")
            //         .text(config.source);
            // }
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
