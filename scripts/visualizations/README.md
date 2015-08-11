# Visualizations
### D3 Based Visualization Scripts used by PDF serving application  
  
#### Pie and "Donut" charts `pie.js`
Pie Charts accept the following configuration parameters:  
+ `height` sets the height of the SVG container used to draw the chart. Corresponds to the `height` D3 parameter for an SVG object.
+ `width` sets the height of the SVG container used to draw the chart. Corresponds to the `width` D3 parameter for an SVG object.
+ `innerRadius` sets the inner radius for the drawn chart, anything other than `0` will turn the visualization into a donut chart. Corresponds to the `innerRadius` D3 parameter for `d3.layout.pie` object.
+ `outerRadius` sets the outer radius for the drawn chart. Corresponds to the `outerRadius` D3 parameter for `d3.layout.pie` object.
+ `startAngle` sets the start angle __in radians__ for the pie slices drawn in the visualization. Corresponds to the `startAngle` D3 parameter for the `d3.svg.arc` path object. Useful for creating half-circle charts, ie:  
   + `startAngle = 1.5 * Math.PI, endAngle = 2.5 * Math.PI`.
+ `endAngle` sets the end angle __in radians__ for the pie slices drawn in the visualization. Corresponds to the `endAngle` D3 parameter for the `d3.svg.arc` path object. Useful for creating half-circle charts, ie:  
   + `startAngle = 1.5 * Math.PI, endAngle = 2.5 * Math.PI`.
+ `colors` sets the set of colors used to draw this chart. This list of colors (text, fully qualified hexidecimal colors such as `#F39B00`) will get fed into the `range` D3 parameter for the `d3.scale.ordinal` object used to determine colors for the chart.  
