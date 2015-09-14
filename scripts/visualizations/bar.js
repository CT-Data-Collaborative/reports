/**
 * Necessary Requirements
 * d3 - charting library
 * args - command line arguments, passed to node, processed by minimist
 * jsdom - JSDOM library, for accessing browser-less virtual DOM
 */
var d3 = require("d3"),
        minimist = require("minimist"),
        jsdom = require("jsdom");

/**
 * Process arguments from node call using minimist
 */
var args = minimist(process.argv.slice(2)),
        data = JSON.parse(args.data),
        config = JSON.parse(args.config);


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
    var margin = {top: 30, right: 10, bottom: 20, left: 30},
            width = 480 - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom,

            // scales
            x0 = d3.scale.ordinal()
                        .rangeRoundBands([0, width], 0.1),
            x1 = d3.scale.ordinal(),
            y = d3.scale.linear()
                    .range([height, 0]),
            color = d3.scale.category20(),
            fontSize = d3.scale.threshold()
                    .domain(d3.range(4).map(function(i){ return i*300; }))
                    .range(d3.range(4,14,2)),

            // axes
            xAxis = d3.svg.axis()
                .scale(x0)
                .orient("bottom"),
            yAxis = d3.svg.axis()
                .scale(y)
                .orient("left"),

            // bar widths
            defaultBarWidth = true,
            barWidth = 20;

    function chart(selection) {
        selection.each(function(data) {

            // updating scales etc?
            y.range([height, 0])

            // Should this be a parameter? passed in config?
            var grouping = "Quarter";

            var groupLabels = d3.keys(data[0]).filter(function(key) { return key !== grouping && key !== "_id"; });

            // This is the step that seems to be the most confused and broken - what shape am i aiming for?
            data.forEach(function(d) {
                d.values = groupLabels.map(function(label) {
                    return {name: label, value: formatters[d[label].type](d[label].value)};
                });
            });


            //  set domain for group scale
            x0.domain(data.map(function(d) { return d[grouping].value; }));

            // set domain and range banding for scale for bars within groups
            x1.domain(groupLabels)
                .rangeRoundBands([0, x0.rangeBand()]);

            // set y-scale domain 
            y.domain([0, d3.max(data, function(d) { return d3.max(d.values, function(d) { return d.value; }); })]);

            // container, margined interior container
            var svg = d3.select(this).append('svg')
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .attr("height", height + margin.top + margin.bottom )
                    .attr("width", width + margin.left + margin.right );

            var barGroup = svg.append("g")
                    .attr("height", height)
                    .attr("width", width)
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            if ("title" in config && config.title !== "") {
                var title = svg.append("g")
                        .attr("height", margin.top + "px")
                        .attr("width", width + "px")
                        .attr("transform", "translate(" + (width) + "," + (0.75 * margin.top) + ")");

                title.append("text")
                    .attr("text-anchor", "end")
                    .text(config.title)
                    //.text("ABCDEFGHIJKLMNOPQRSTUVABCDEFGHIJKLMNO")
                    .attr("font-size", "12pt");
            }

            // x axis, includes group labels automatically
            var xAxisGroup = barGroup.append("g")
                .attr("transform", "translate(0," + height + ")")
                .attr("font-size", "8pt")
                .call(xAxis)
                .call(function(g) {
                    g.selectAll("path").remove();
                    
                    g.selectAll("g").selectAll("line")
                        .attr("stroke", "#777");
                });

            // Y axis
            var yAxisGroup = barGroup.append("g")
                .attr("transform", "translate(0,0)")
                .attr("font-size", "8pt")
                .call(yAxis)
                .call(function(g) {
                    g.selectAll("path").remove();
                    
                    g.selectAll("g").selectAll("line")
                        .attr("x1", 0)
                        .attr("x2", width)
                        .attr("stroke", "#DDD")
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
                            .attr("width", x1.rangeBand())
                            .attr("x", function(d) { return x1(d.name); })
                            .attr("y", function(d) { return y(d.value); })
                            .attr("height", function(d) { return height - y(d.value); })
                            .style("fill", function(d) { return color(d.name); });

            groups.selectAll("text")
                    .data(function(d) { return d.values; })
                    .enter()
                        .append("text")
                            .text(function(d) { return d.value; })
                            .attr("text-anchor", "middle")
                            .attr("font-size", fontSize(height) + "pt")
                            .attr("x", function(d) { return x1(d.name) + (0.5 * x1.rangeBand()); })
                            .attr("y", function(d) { return y(d.value)+fontSize(height)+3; })
                            .attr("fill", "white");


            /* Old Code */
            /*
            if (defaultBarWidth) {
                barWidth = width / data.length;
            }


            var svg = d3.select(this).append('svg')
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .attr("height", height + margin.top + margin.bottom )
                    .attr("width", width + margin.left + margin.right )
                .append("g")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");;

            var bar = svg.selectAll("g")
                .data(data)
              .enter().append("g")
                .attr("transform", function(d, i) { return "translate("+ i * barWidth + ", 0)"; });

            bar.append("rect")
                .attr("height", function(d) { return y(d[1].value); })
                .attr("width", barWidth - 1)
                .attr("fill", "steelblue");

            bar.append("text")
                // .attr("y", function(d) { return y(d) - 3; }) // offset for text labels
                .attr("x", barWidth / 2)
                .attr("y", 0)
                .attr("dy", ".35em")
                .attr("fill", "white")
                .text(function(d) { return d[0].value; });
        */
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
