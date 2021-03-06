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
var formatters = {
    "string" : function(val) {return val; },
    "currency" : d3.format("$,.0f"),
    "integer" : d3.format(",.0f"),
    "decimal" : d3.format(",.2f"),
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

            // outermost container
            var container = d3.select(this).append("div")
                    .attr("class", "table_container")
                    .attr("style", "height:"+config.height+"px;");

            container = container.append("div");

            if ("title" in config && config.title !== "") {
                var title = container.append("p")
                    .attr("class", "table_title")
                    .text(config.title);

                if ("footnote_number" in config && config.footnote_number != "") {
                    title.text(
                        config.title + formatters["superscript"](config.footnote_number)
                    );
                }
            }

            container = container.append("div");
            
            // Table
            var table = container.append("table");

            // bump down by wordwrap
            table.attr("style", "top:"+(marginBump * 6)+"px;")

            // thead element
            var thead = table.append("thead"),
                headerData = data.shift();

            // determine colspan of header
            // Calculate colspan
            // if header cells < data cells, per row.
            var noblankColumns = headerData.filter(function(col) { return col.id !== "" & col.id !== "_id"})

            if (noblankColumns.length < data[0].length-1 && noblankColumns.length > 0) {
                colspan = Math.floor((data[0].length)/(noblankColumns.length))
                colspan = (colspan > 1 ? colspan : null)
            }
            
            // populate header - simpletable assumes row 1 is header cells
            tr = thead.append("tr");

            if (config.header_offset) {
                headerData.unshift({
                    "type" : "string",
                    "value" : (config.header_offset === true ? "" : config.header_offset)
                });
            }

            tr.selectAll("th")
                    .data(headerData)
                    .enter()
                    .append("th")
                        .text(function(d) {
                            return formatters[d.type](d.value);
                        })
                        .attr("colspan", function(d, i) {
                            if (config.header_offset && i === 0) {
                                return 1;
                            } else {
                                return colspan
                            }
                        });

            // tbody element
            var tbody = table.append("tbody");

            // populate body
            var rows = tbody.selectAll("tr")
                .data(data)
                .enter()
                .append("tr")
                    .datum(function(d) {return d;});

            rows.each(function(rowData) {
                d3.select(this).selectAll("td")
                    .data(rowData)
                    .enter()
                    .append("td")
                        .text(function(d) { return formatters[d.type](d.value); })
            })

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
