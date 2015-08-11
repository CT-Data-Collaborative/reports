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
chart = pieChart();

// use available config parameters to override defaults
// height
if ("height" in config && config.height > 0) {
    chart.height(config.height);
}

// width
if ("width" in config && config.width > 0) {
    chart.width(config.width);
}

// innerRadius
if ("innerRadius" in config) {
    chart.innerRadius(config.innerRadius);
}

// outerRadius
if ("outerRadius" in config && config.outerRadius > 0) {
    chart.outerRadius(config.outerRadius);
}

// startAngle
if ("startAngle" in config && config.startAngle >= 0) {
    chart.startAngle(config.startAngle);
}

// endAngle
if ("endAngle" in config && config.endAngle > 0) {
    chart.endAngle(config.endAngle);
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

function pieChart() {
    var width = 460,
            height = 300,
            radius = Math.min(height, width) / 2,
            innerRadius = 0,
            outerRadius = radius * 0.9,
            label = function(d) { return d[0]; },
            value = function(d) { return d[1]; },
            pie = d3.layout.pie()
                        .sort(null)
                        .value(value)
                        .startAngle(0)
                        .endAngle(2*Math.PI),
            arc = d3.svg.arc()
                        .innerRadius(innerRadius)
                        .outerRadius(outerRadius),
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
                .attr("width", width+"px")
                .attr("height", height+"px")
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            // Pie slices
            var path = svg.selectAll("path")
                .data(pie(data))
                .enter()
                .append("path")
                    .attr("fill", function(d, i) { return colors(i); })
                    .attr("d", arc);

            // labels
            var path = svg.selectAll("text")
                .data(pie(data))
                .enter()
                .append("text")
                    .attr("transform", function(d) {return "translate("+arc.centroid(d)+")"})
                    .attr("text-anchor", "middle")
                    .style("font-size", "10px")
                    .text(function(d){ return d.data[0] });
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

    chart.innerRadius = function(_) {
      if (!arguments.length) return innerRadius;
      innerRadius = _;
      arc.innerRadius(innerRadius);
      return chart;  
    };

    chart.outerRadius = function(_) {
      if (!arguments.length) return outerRadius;
      outerRadius = _;
      arc.outerRadius(outerRadius);
      return chart;  
    };

    chart.startAngle = function(_) {
      if (!arguments.length) return startAngle;
      startAngle = _;
      pie.startAngle(startAngle);
      return chart;  
    };

    chart.endAngle = function(_) {
      if (!arguments.length) return endAngle;
      endAngle = _;
      pie.endAngle(endAngle);
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
