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
                    charLimit = (Math.round(Math.floor((config.width) / 5) / 5) * 5);

            // Convert data to standard representation greedily;
            // this is needed for nondeterministic accessors.
            data = data;
            // data = data.map(function(d, i) {
            //     return [label.call(data, d, i), value.call(data, d, i)];
            // });

            // outermost container
            var container = d3.select(this).append("div")
                    .attr("class", "table_container")
                    .attr("style", "height:"+config.height+"px;");

            if ("title" in config && config.title !== "") {
                    marginBump = d3.wordwrap(config.title+config.title+config.title, charLimit).length-1;
                var title = container.append("h2")
                    .attr("class", "table_title")
                    .attr("style", "top: -"+25+"px")
                    .text(config.title);

            }

            // Table
            var table = container.append("table");

            // bump down by wordwrap
            table.attr("style", "top:"+(marginBump * 6)+"px;")

            // Calculate colspan
            // if header cells < data cells, per row.
            var noblankColumns = data.fields.filter(function(col) { return col.id !== "" & col.id !== "_id"})

            if (noblankColumns.length < data.records[0].length-1 && noblankColumns.length > 0) {
                colspan = Math.floor((data.records[0].length)/(noblankColumns.length))
                colspan = (colspan > 1 ? colspan : null)
            }

            
            // table header
            var thead = table.append("thead")
                    .append("tr")
                    .selectAll("th")
                    .data(noblankColumns).enter()
                    .append("th")
                        .text(function(d) { return d.id; } )
                    .attr("colspan", function(d, i) {
                        if (i > 0 || d.value != "") {
                            return colspan;
                        } else {
                            return null;
                        }
                    });

            fields = {}
            data.fields.forEach(function(field) {
                fields[field.id] = field;
            });

            // tbody element
            var tbody = table.append("tbody");

            // tr elements
            var rows = tbody.selectAll("tr")
                    .data(data.records)
                    .enter()
                    .append("tr");

            // create a cell in each row for each column
            var cells = rows.selectAll("td")
                .data(function(d) {
                    row = [];
                    noblankColumns.forEach(function(field) {
                        row.push({key : field.id, value : formatters[d[field.id].type](d[field.id].value)});
                    });
                    return row;
                })
                .enter()
                .append("td")
                .text(function(d) { return d.value; })
                .attr("colspan", function(d, i) { return colspan && (i > 0 || data.fields[i].value != "") ? 1 : null });

            if ("source" in config && config.source !== "") {
                // source
                var source = container.append("p")
                    .attr("class", "table_source")
                    .text(config.source);
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
