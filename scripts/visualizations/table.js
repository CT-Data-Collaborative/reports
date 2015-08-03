args = require("minimist")(process.argv.slice(2));

var data = JSON.parse(args.data);

var d3 = require('d3');
var document = require('jsdom').jsdom();
var body = d3.select(document.body);

var width = 420,
    cellWidth = width/data.columns.length,
    cellHeight = "1.8em";

var body = d3.select(document.body);

var table = body.html('')
        .append("table");

var thead = table.append("thead")
        .append("tr")
        .selectAll("th")
        .data(data.columns).enter()
        .append("th")
        .text(function(c) { return c; } );

var tbody = table.append("tbody");

var rows = tbody.selectAll("tr")
        .data(data.rows)
        .enter()
        .append("tr");

// create a cell in each row for each column
var cells = rows.selectAll("td")
    .data(function(row) {
        return data.columns.map(function(column, index) {
            return {column: column, value: row[index]};
        });
    })
    .enter()
    .append("td")
    .text(function(d) { return d.value; });

console.log(body.html());
