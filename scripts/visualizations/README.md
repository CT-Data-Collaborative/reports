# Visualizations
### D3 Based Visualization Scripts used by PDF serving application  
  
#### An important note about configuration parameters
Any configuration available can be specified at any level of the "hierarchy" and will be applied at that scope. Hierarchy starts at a static config set in the template-specific configuration file in `static/template_config/`, then is overridden by template-level config specified in the request. Both of these levels will apply globally to all visualizations present in the request. These in turn can be overridden by visualization-level config in each visualization object listed in the request, which will only affect that single visualization.

#### Tables `table.js`
Tables are drawn with pure HTML, they can and currently are styled using CSS only.  Tables only currently support the following configuration parameter:  
+ `header` is only necessary to set as `false` if you want to specify that there are NO column headers in the supplied data. This will prevent the first row of data being used as column headers. If not supplied, or supplied as `true`, it will be assumed that the data presents headers and the first row of data will be put into `<th>` tags in the `<thead>` element.
  
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

#### Bar charts `bar.js`
Bar Charts accept the following configuration parameters:
+ `width` sets the height of the SVG container used to draw the chart. Corresponds to the `width` D3 parameter for an SVG object.
+ `barHeight` sets the height of the SVG rectangles drawn on the chart - roughly equivalent to a bin width parameter.
+ `colors` sets the set of colors used to draw this chart. This list of colors (text, fully qualified hexidecimal colors such as `#F39B00`) will get fed into the `range` D3 parameter for the `d3.scale.ordinal` object used to determine colors for the chart. 

#### Maps `map.js`
Maps accept the following configuration parameters:
+ `height` sets the height of the SVG container used to draw the map. Corresponds to the `height` D3 parameter for an SVG object.
+ `width` sets the height of the SVG container used to draw the map. Corresponds to the `width` D3 parameter for an SVG object.
+ `margin` A percentage as a whole integer (ie `5` not `.05`) that sets the margin between the SVG container and the bounding box of the map. Used in calculating the bounding box and center of the map. 
+ `colors` sets the set of colors used to draw this map. This list of colors (text, fully qualified hexidecimal colors such as `#F39B00`) will get fed into the `range` D3 parameter for the `d3.scale.ordinal` object used to determine colors for the map.  