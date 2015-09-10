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

// use available config parameters to override defaults
// height
if ("height" in config && config.height > 0) {
    chart.height(config.height);

    chart.radius(Math.min(chart.height(), chart.width()) / 2);
    // chart.outerRadius(chart.radius() * 0.9);
}

// width
if ("width" in config && config.width > 0) {
    chart.width(config.width);

    chart.radius(Math.min(chart.height(), chart.width()) / 2);
    // chart.outerRadius(chart.radius() * 0.9);
}

// radius
if ("radius" in config) {
    chart.radius(config.radius);
    chart.outerRadius(config.radius * 0.9)
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
    var margin = {top : 20, left : 10, bottom : 20, right : 10},
            width = 460 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom,
            radius = Math.min(height, width) / 2,
            innerRadius = 0,
            outerRadius = radius * 0.9,
            pie = d3.layout.pie()
                        .sort(null)
                        .startAngle(0)
                        .endAngle(2*Math.PI),
            arc = d3.svg.arc()
                        .innerRadius(innerRadius)
                        .outerRadius(outerRadius),
            colors = d3.scale.category20()
            xl = d3.scale.ordinal()
                    .rangeRoundBands([0, width+margin.left+margin.right], 0.1, 0.2);



    function chart(selection) {
        selection.each(function(data) {

            // Convert data to standard representation greedily;
            // this is needed for nondeterministic accessors.
            data = data;
            // data = data.map(function(d, i) {
            //     return [label.call(data, d, i), value.call(data, d, i)];
            // });

            // build accessors
            var labelKey = d3.keys(data[0])[0],
                valueKey = d3.keys(data[0])[1];

            var label = function(d) { return d[labelKey].value; },
                value = function(d) {
                    return formatters[d[valueKey].type](d[valueKey].value);
                }

            // update pie function object with accessor
            pie.value(value)

            // SVG Container
            var svg = d3.select(this).append("svg")
                .attr("width", (width + margin.left + margin.right)+"px")
                .attr("height", (height + margin.top + margin.bottom)+"px")
                .attr("xmlns", "http://www.w3.org/2000/svg");
                
            var pieGroup = svg.append("g")
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            // Pie slices
            var slices = pieGroup.selectAll("path")
                .data(pie(data))
                .enter()
                .append("path")
                    .attr("fill", function(d, i) { return colors(i); })
                    .attr("d", arc);

            // labels
            var labels = pieGroup.selectAll("text")
                .data(pie(data))
                .enter()
                .append("text")
                    .attr("transform", function(d) {return "translate("+arc.centroid(d)+")"})
                    .attr("text-anchor", "middle")
                    .style("font-size", "10px")
                    .text(function(d){ return value(d.data) });

            // Legend
            // update scale
            xl.domain(d3.range(data.length));

            var legend = svg.append("g")
                .attr("transform", "translate(0,"+ height +")");

            legend.selectAll("rect")
                .data(data)
                .enter()
                    .append("rect")
                        .attr("height", margin.bottom)
                        .attr("width", margin.bottom)
                        .attr("x", function(d, i) { return xl(i); })
                        .attr("y", 0)
                        .attr("fill", function(d, i) { return colors(i); });

            legend.selectAll("text")
                .data(data)
                .enter()
                    .append("text")
                        .attr("x", function(d, i) { return xl(i)+margin.bottom; })
                        .attr("y", 0)
                        .attr("dy", "1em")
                        .text(function(d, i) { return label(d); });
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

    chart.radius = function(_) {
      if (!arguments.length) return radius;
      radius = _;

      // Also update calculated outer radius of arc
      outerRadius = _ * 0.9;
      arc.outerRadius(outerRadius);
      
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
