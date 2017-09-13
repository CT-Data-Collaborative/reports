var d3 = require("d3"),
  minimist = require("minimist");

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



var nestedData = d3.nest();

config.nest.forEach(function (key, keyInd, keyArr) {
  if ("order" in config && key in config.order) {
    nestedData.key(function (d) {
      return formatters[d[key].type](d[key].value);
    })
      .sortKeys(function (a, b) {
        console.log(a)
        console.log(b)
        return config.order[key].indexOf(a) - config.order[key].indexOf(b);
      });
  } else {
    nestedData.key(function (d) {
      return formatters[d[key].type](d[key].value);
    });
  }
});

nestedData.rollup(function (leaf) {
  leaf = leaf.pop();
  for (key in leaf) {
    if (config.nest.indexOf(key) !== -1) {
      delete leaf[key];
    }
  }
  if ("order" in config && "leaf" in config.order) {
    var newLeaf = {};
    config.order.leaf
      .filter(function (key) {
        return key in leaf;
      })
      .forEach(function (key, keyI, keyA) {
        newLeaf[key] = leaf[key];
      });
    leaf = newLeaf;
  }
  return leaf;
});


var nested_data = nestedData.entries:(data);

console.log(nested_data);