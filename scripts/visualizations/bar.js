args = require("minimist")(process.argv.slice(2));

    var data = JSON.parse(args.data);
// if (args.length > 0) {
//     var data = JSON.parse(args.data);
// } else {
//     var data = [4, 8, 15, 16, 23, 42];
//     // console.log("No data!")
//     return;
// }

var d3 = require('d3');
var document = require('jsdom').jsdom();
var body = d3.select(document.body);

var width = 420,
    barHeight = 20;

var x = d3.scale.linear()
    .domain([0, d3.max(data, function(d) { return d[1]; })])
    .range([0, width]);

var body = d3.select(document.body);

var chart = body.html('').append('svg')
    .attr("width", width)
    .attr("height", barHeight * data.length)
    .attr("xmlns", "http://www.w3.org/2000/svg");

var bar = chart.selectAll("g")
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

console.log(body.html());
