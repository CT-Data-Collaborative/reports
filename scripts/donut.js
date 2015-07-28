var d3 = require('d3');
var document = require('jsdom').jsdom();

var dataset = {
  apples: [53245, 28479, 19697, 24037, 40245],
};

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
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var path = svg.selectAll("path")
    .data(pie(dataset.apples))
  .enter().append("path")
    .attr("fill", function(d, i) { return color(i); })
    .attr("d", arc);

// console.log('<?xml version="1.0" encoding="utf-8"?>');
// console.log('<?xml-stylesheet type="text/css" href="chart.css" ?>');
// console.log('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">');

// oddly, if I comment this console.log command out, this all breaks...

console.log(body.html());
return body.html();