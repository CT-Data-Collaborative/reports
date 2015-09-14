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

            // Convert data to standard representation greedily;
            // this is needed for nondeterministic accessors.
            data = data;
            // data = data.map(function(d, i) {
            //     return [label.call(data, d, i), value.call(data, d, i)];
            // });

            if ("title" in config && config.title !== "") {
                var title = d3.select(this).append("h2")
                    .attr("class", "table_title")
                    .text(config.title);
            }

            // outermost table Container
            var table = d3.select(this).append("table")

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
