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
chart = tableChart();

// use available config parameters to override defaults
// width
// if ("width" in config && config.width > 0) {
//     chart.width(config.width);
// }

// get body from jsdom, call chart function
var document = jsdom.jsdom();
var body = d3.select(document.body)
            .html("")
            .datum(data)
            .call(chart);

console.log(body.html());

function tableChart() {
    // Vars
    var colspan = null;
    
    function chart(selection) {
        selection.each(function(data) {

            var marginBump = 0,
                    charLimit = (Math.round(config.width / 25) * 5);

            // Convert data to standard representation greedily;
            // this is needed for nondeterministic accessors.
            data = data;

            /*
            var priority_order = ['MUST', "SHOULD", 'COULD', 'WISH'];
            var nested_data = d3.nest()
            .key(function(d) { return d.status; }).sortKeys(d3.ascending)
            .key(function(d) { return d.priority; }).sortKeys(function(a,b) { return priority_order.indexOf(a) - priority_order.indexOf(b); })
            .rollup(function(leaves) { return leaves.length; })
            .entries(csv_data);
            */
            if ("nest" in config) {
                nestedData = d3.nest();

                config.nest.forEach(function(key, keyInd, keyArr) {
                    if ("order" in config && key in config.order) {
                        nestedData.key(function (d) { return formatters[d[key].type](d[key].value); })
                                .sortKeys(function(a, b) {
                                    return config.order[key].indexOf(a) - config.order[key].indexOf(b);
                                });
                    } else {
                        nestedData.key(function (d) { return d[key]; });
                    }
                });

                nestedData.rollup(function(leaf) {
                    leaf = leaf.pop();
                    for (key in leaf) {
                        if (config.nest.indexOf(key) !== -1) {
                            delete leaf[key];
                        }
                    }
                    return leaf;
                });

                data = nestedData.map(data.records)
            }

            var countCols = function(nest) {
                if (typeof nest === "object") {
                    return d3.keys(nest).length * countCols(nest[d3.keys(nest)[0]]);
                } else {
                    return 1;
                }
            }
            var nrows = d3.keys(data).length,
                    ncols = countCols(data) / (2 * nrows);

            // useful debugging of nest functions
            // var container = d3.select(this).append("pre")
            //     .text(JSON.stringify(data, null, 4));
            // return chart;

            // outermost container
            var container = d3.select(this).append("div")
                    .attr("class", "table_container")
                    .attr("style", "height:"+config.height+"px;");

            container = container.append("div");

            if ("title" in config && config.title !== "") {
                var title = container.append("p")
                    .attr("class", "table_title")
                    .text(config.title);
            }

            container = container.append("div");
            
            // Table
            var table = container.append("table");

            // bump down by wordwrap
            table.attr("style", "top:"+(marginBump * 6)+"px;")

            // table header
            var thead = table.append("thead");

            // now populate thead with th cells appropriately

            // tbody element
            var tbody = table.append("tbody");

            populateHeader = function(data, thead, level) {
                if (data instanceof Object && data[d3.keys(data)[0]] instanceof Object) {
                    var theadTR = thead.selectAll("tr#level_"+level);
                    if (theadTR.empty()) {
                        theadTR = thead.append("tr")
                                                    .attr("id", "level_"+level);
                        theadTR.append("th");
                    }
                    for (var key in data) {
                        theadTR.append("th")
                            .text(key)
                            .attr("colspan", d3.keys(data[key]).length);
                            populateHeader(data[key], thead, level + 1)
                    }
                } else {
                    thead.selectAll("tr#level_"+(level-1)).selectAll("th")
                            .attr("colspan", 1);
                    return
                }
            }

            populateHeader(data[d3.keys(data)[0]], thead, 0);

            // populate body
            populateCells = function(data, thead, tr, level) {
                if (data instanceof Object && data[d3.keys(data)[0]] instanceof Object) {
                    for (var key in data) {
                        populateCells(data[key], thead, tr, level + 1);
                    }
                } else {
                    tr.append("td")
                        .text(formatters[data.type](data.value));
                }
            }

            for (rowKey in data) {
                var tr = tbody.append("tr");
                tr.append("td")
                    .text(rowKey);
                populateCells(data[rowKey], thead, tr, 0);
            }
        });
    }

    /**
     * Getter-Setter functions for chart function object
     */
    // chart.width = function(_) {
    //     if (!arguments.length) return width;
    //     width = _;
    //     return chart;
    // };

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
