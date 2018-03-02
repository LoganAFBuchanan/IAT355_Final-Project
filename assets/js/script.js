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
});