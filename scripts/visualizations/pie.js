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
    var margin = {top : 60, left : 10, bottom : 60, right : 10},
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
            colors = d3.scale.category20();

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
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform", "translate(" + ((width / 2) + margin.left) + "," + ((height / 2) + margin.top) + ")");

            var labelGroup = svg.append("g")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform", "translate(" + ((width / 2) + margin.left) + "," + ((height / 2) + margin.top) + ")");

            if ("title" in config && config.title !== "") {
                var title = svg.append("g")
                        .attr("height", margin.top + "px")
                        .attr("width", width + "px")
                        .attr("transform", "translate(" + (width) + "," + 24 + ")");

                title.append("text")
                    .attr("text-anchor", "end")
                    .text(config.title)
                    .attr("font-size", "12pt");
            }

            // Pie slices
            var slices = pieGroup.selectAll("path")
                .data(pie(data))
                .enter()
                .append("path")
                    .attr("fill", function(d, i) { return colors(i); })
                    .attr("d", arc);


            // Labels

            // var labelDots = labelGroup.selectAll("circle")
            //         .data(pie(data))
            //         .enter()
            //         .append("circle")
            //             .attr("x", 0)
            //             .attr("y", 0)
            //             .attr("r", 2)
            //             .attr("fill", "black")
            //             .attr("transform", function(d, i) {
            //                 return "translate("+arc.centroid(d)+")";
            //             });
            var labelLines = labelGroup.selectAll("line")
                    .data(pie(data))
                    .enter()
                    .append("line")
                        .attr("stroke", "black")
                        .attr("stroke-width", "0.5px")
                        .attr("x1", function(d, i) {
                            return arc.centroid(d)[0];
                        })
                        .attr("x2", function(d, i) {
                            midAngle = Math.atan2(arc.centroid(d)[1], arc.centroid(d)[0])
                            return Math.cos(midAngle) * outerRadius * 1.25;
                        })
                        .attr("y1", function(d, i) {
                            return arc.centroid(d)[1];
                        })
                        .attr("y2", function(d, i) {
                            midAngle = Math.atan2(arc.centroid(d)[1], arc.centroid(d)[0])
                            return Math.sin(midAngle) * outerRadius * 1.15;
                        });

            var textElementsByAnchor = {"start" : [], "end" : []};
            var labelText = labelGroup.selectAll("text")
                    .data(pie(data))
                    .enter()
                    .append("text")
                        .text(function(d) { return d.value; })
                        .attr("font-size", "8pt")
                        .attr("x", function(d, i) {
                            midAngle = Math.atan2(arc.centroid(d)[1], arc.centroid(d)[0])
                            x = Math.cos(midAngle) * outerRadius * 1.25;
                            sign = (x > 0) ? 1 : -1
                            return x;
                        })
                        .attr("y", function(d, i) {
                            midAngle = Math.atan2(arc.centroid(d)[1], arc.centroid(d)[0])
                            y = Math.sin(midAngle) * outerRadius * 1.15;
                            return y;
                        })
                        .attr("text-anchor", function(d, i) {
                            midAngle = Math.atan2(arc.centroid(d)[1], arc.centroid(d)[0])
                            anchor = (Math.cos(midAngle) > 0) ? "start" : "end";
                            textElementsByAnchor[anchor].push(this);
                            return anchor;
                        })
                        .attr("class", function(d, i) {
                            midAngle = Math.atan2(arc.centroid(d)[1], arc.centroid(d)[0])
                            anchor = (Math.cos(midAngle) > 0) ? "start" : "end";
                            textElementsByAnchor[anchor].push(this);
                            return "anchor-"+anchor;
                        })


            do {
                again = false;
                labelText.each(function (d, i) {
                    a = this;
                    da = d3.select(a);
                    y1 = da.attr("y");
                    labelText.each(function (d, j) {
                        b = this;
                        // a & b are the same element and don't collide.
                        if (a == b) return;
                        db = d3.select(b);
                        // a & b are on opposite sides of the chart and
                        // don't collide
                        if (da.attr("text-anchor") != db.attr("text-anchor")) return;
                        // Now let's calculate the distance between
                        // these elements. 
                        y2 = db.attr("y");
                        deltaY = y1 - y2;
                        
                        // Our spacing is greater than our specified spacing,
                        // so they don't collide.
                        if (Math.abs(deltaY) > 8) return;
                        
                        // If the labels collide, we'll push each 
                        // of the two labels up and down a little bit.
                        again = true;
                        sign = deltaY > 0 ? 1 : -1;
                        adjust = sign * 1;
                        da.attr("y",+y1 + (adjust * 2));
                        db.attr("y",+y2 - (adjust / 2));
                    });
                });
                // Adjust our line leaders here
                // so that they follow the labels. 
                if(again) {
                    labelElements = labelText[0];
                    labelLines.attr("y2",function(d,i) {
                        labelForLine = d3.select(labelElements[i]);
                        return labelForLine.attr("y");
                    });
                }
            } while (again == true)

            // var buffer = 0;
            // textElementsByAnchor["start"].forEach(function(e, i, a) {
            //     textElementsByAnchor["start"][i].y += buffer*12;
            //     buffer += 1;
            // });

            // var buffer = 0;
            // textElementsByAnchor["end"].forEach(function(e, i, a) {
            //     textElementsByAnchor["end"][i].y += buffer*8;
            //     buffer += 1;
            // })


            /* Whisker labels, v 1.0
            var labelText = labelGroup.selectAll("text")
                .data(pie(data))
                .enter()
                .append("text")
                    .attr("font-size", "8pt")
                    .attr("text-anchor", "middle")
                    .attr("x", function(d) {
                        var a = d.startAngle + (d.endAngle - d.startAngle)/2 - Math.PI/2;
                        d.cx = Math.cos(a) * (radius - 75);
                        d.cx = arc.centroid(d)[0];
                        return d.x = Math.cos(a) * (radius + 10);
                    })
                    .attr("y", function(d) {
                        var a = d.startAngle + (d.endAngle - d.startAngle)/2 - Math.PI/2;
                        d.cy = Math.sin(a) * (radius - 75);
                        d.cy = arc.centroid(d)[1];
                        return d.y = Math.sin(a) * (radius + 10);
                    })
                    .text(function(d) { return d.value; })
                    .each(function(d) {
                        var bbox = this.getBoundingClientRect();
                        bbox.width = Math.abs(bbox.left-bbox.right);
                        d.sx = d.x - bbox.width/2 - 3 - 8;
                        d.ox = d.x + bbox.width/2 + 3 + 8;
                        d.sy = d.oy = d.y + 2;
                    });

            svg.append("defs").append("marker")
                .attr("id", "circ")
                .attr("markerWidth", 3)
                .attr("markerHeight", 3)
                .attr("refX", 1.5)
                .attr("refY", 1.5)
                .append("circle")
                .attr("cx", 1.5)
                .attr("cy", 1.5)
                .attr("r", 1.5);

            var labelLines = labelGroup.selectAll("path")
                .data(labelText.data())
                .enter()
                .append("path")
                    .style("fill", "none")
                    .style("stroke", "black")
                    .attr("marker-end", "url(#circ)")
                    .attr("d", function(d) {
                        if(d.cx > d.ox) {
                            return "M" + d.sx + "," + d.sy + "L" + d.ox + "," + d.oy + " " + d.cx + "," + d.cy;
                        } else {
                            return "M" + d.ox + "," + d.oy + "L" + d.sx + "," + d.sy + " " + d.cx + "," + d.cy;
                        }
                    });*/

            // old labels
            /* 
            var labels = pieGroup.selectAll("text")
                .data(pie(data))
                .enter()
                .append("text")
                    .attr("transform", function(d) {return "translate("+arc.centroid(d)+")"})
                    .attr("text-anchor", "middle")
                    .style("font-size", "8px")
                    .text(function(d){ return value(d.data) });
            */

            // Legend scale
            xl = d3.scale.ordinal()
                    .rangeRoundBands([0, width], 0.5, 0.5)
                    .domain(d3.range(data.length));

            var legend = svg.append("g")
                .attr("height", margin.bottom)
                .attr("width", width)
                .attr("transform", "translate("+margin.left+","+ (height+margin.top + (margin.bottom*0.5)) +")");

            legend.selectAll("rect")
                .data(data)
                .enter()
                    .append("rect")
                        .attr("height", 8)
                        .attr("width", 8)
                        .attr("x", function(d, i) { return xl(i); })
                        .attr("y", 0)
                        .attr("fill", function(d, i) { return colors(i); });

            legend.selectAll("text")
                .data(data)
                .enter()
                    .append("text")
                        .attr("font-size", 8+"pt")
                        .attr("x", function(d, i) { return xl(i); })
                        .attr("y", 0)
                        .attr("dy", 8)
                        .attr("dx", 8)
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
