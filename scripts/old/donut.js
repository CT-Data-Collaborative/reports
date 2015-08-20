args = require("minimist")(process.argv.slice(2));

var d3 = require('d3');
var document = require('jsdom').jsdom();

var dataset = {
  apples: [53245, 28479, 19697, 24037, 40245],
};

// var dataset = JSON.parse(args.data);

// Uncomment for testing if you're getting nothing back - chances are JSON.parse failed silently-ish
// try {
//     dataset = JSON.parse(args.data);
// } catch (e) {
//     console.log(e);
//     return;
// }

var width = 460,
    height = 300,
    radius = Math.min(width, height) / 2;

var color = d3.scale.category20();

var pie = d3.layout.pie()
    .sort(null);

var arc = d3.svg.arc()
    .innerRadius(radius - 100)
    .outerRadius(radius - 50);

var body = d3.select(document.body);

var svg = body.html('').append('svg')
    .attr("width", width+"px")
    .attr("height", height+"px")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var path = svg.selectAll("path")
    .data(pie(dataset.apples))
  .enter().append("path")
    .attr("fill", function(d, i) { return color(i); })
    .attr("d", arc);


// oddly, if I comment this console.log command out, this all breaks...
console.log(body.html());
// return body.html();
