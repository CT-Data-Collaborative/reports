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


// get chart function object
chart = barChart();

// use available config parameters to override defaults
// barHeight
if ("barHeight" in config && config.barHeight > 0) {
    chart.barHeight(config.barHeight);
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

function barChart() {
    var width = 460,
            barHeight = 20,
            x = d3.scale.linear()
                            // .domain([0, d3.max(data, function(d) { return d[1]; })])
                            .domain([0, width])
                            .range([0, width]);
            colors = d3.scale.category20();

    function chart(selection) {
        selection.each(function(data) {

            // Convert data to standard representation greedily;
            // this is needed for nondeterministic accessors.
            data = data;
            // data = data.map(function(d, i) {
            //     return [label.call(data, d, i), value.call(data, d, i)];
            // });

            // set domain of scale appropriate to data
            x.domain([0, d3.max(data, function(d) { return d[1]; })])

            var svg = d3.select(this).append('svg')
                .attr("width", width)
                .attr("height", barHeight * data.length)
                .attr("xmlns", "http://www.w3.org/2000/svg");

            var bar = svg.selectAll("g")
                .data(data)
              .enter().append("g")
                .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

            bar.append("rect")
                .attr("width", function(d) { return x(d[1]); })
                .attr("height", barHeight - 1)
                .attr("fill", "steelblue");

            bar.append("text")
                // .attr("x", function(d) { return x(d) - 3; })
                .attr("x", 0)
                .attr("y", barHeight / 2)
                .attr("dy", ".35em")
                .attr("fill", "white")
                .text(function(d) { return d[0]; });
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
