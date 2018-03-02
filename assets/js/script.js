var data = "./assets/data/LoanValueData.csv";

// adapted from bl.ocks.org
// https://bl.ocks.org/mbostock/3884955
var svg = d3.select("svg"),
    margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%Y");

var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

d3.csv(data, type, function(error, data) {
	if (error) throw error;

	var provinces = data.columns.slice(1).map(function(id) {
		return {
			id: id,
			values: data.map(function(d) {
				return {date: d.date, value: d[id]};
			})
		};
	});

	x.domain(d3.extent(data, function(d) { return d.date; }));

	y.domain([
    d3.min(provinces, function(c) { return d3.min(c.values, function(d) { return d.value; }); }),
    d3.max(provinces, function(c) { return d3.max(c.values, function(d) { return d.value; }); })
  ]);

 	z.domain(provinces.map(function(c) { return c.id; }));

 	g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Value, $ millions");

  var provinces = g.selectAll(".province")
    .data(provinces)
    .enter().append("g")
      .attr("class", "province");

  city.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return z(d.id); });

  // city.append("text")
  //     .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
  //     .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
  //     .attr("x", 3)
  //     .attr("dy", "0.35em")
  //     .style("font", "10px sans-serif")
  //     .text(function(d) { return d.id; });
});