
"use strict";

var url ="./data/LoanValueData.csv";

var hideVal = [];
var parseTime = d3.timeParse("%Y");

redrawGraph();

document.querySelector("#BC").addEventListener("click", function(){
  updateFilters("British Columbia");
});


function updateFilters(prov){
  if(hideVal.includes(prov)){
    hideVal.splice(hideVal.findIndex(function(element){
      return element == prov;
    }), 1);
  }else{
    hideVal.push(prov);
  }
  console.log(hideVal);
  redrawGraph();
}


function redrawGraph(){

  var svg = d3.select("svg"),
  margin = {top: 20, right: 80, bottom: 30, left: 50},
  width = svg.attr("width") - margin.left - margin.right,
  height = svg.attr("height") - margin.top - margin.bottom,
  g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");



  var x = d3.scaleTime().range([0, width]),
  y = d3.scaleLinear().range([height, 0]),
  z = d3.scaleOrdinal(d3.schemeCategory10);

  var line = d3.line()
  .curve(d3.curveBasis)
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y(d.loanValue); });

  d3.csv(url, type, function(error, data) {
    if (error) throw error;

    var provinces = data.columns.slice(1).map(function(id) {

      console.log(id);
      return {

        id: id,
        values: data.map(function(d) {
          return {date: d.date, loanValue: d[id]};
        })
      };
    });

    for (let removedProv of hideVal) {
      console.log(removedProv);
      provinces.splice(provinces.findIndex(province => province.id === removedProv), 1);
    }

    //provinces.splice(4, 1);

    //This allows you to find the corresponding index of a province
    console.log(provinces.findIndex(province => province.id == "Ontario"));

    x.domain(d3.extent(data, function(d) { return d.date; }));

    y.domain([
      d3.min(provinces, function(c) { return d3.min(c.values, function(d) { return d.loanValue; }); }),
      d3.max(provinces, function(c) { return d3.max(c.values, function(d) { return d.loanValue; }); })
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
    .text("LoanValue, Millions");

    var province = g.selectAll(".province")
    .data(provinces)
    .enter().append("g")
    .attr("class", "province");

    province.append("path")
    .attr("class", "line")
    .attr("d", function(d) { return line(d.values); })
    .style("stroke", function(d) { return z(d.id); });

    province.append("text")
    .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
    .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.loanValue) + ")"; })
    .attr("x", 3)
    .attr("dy", "0.35em")
    .style("font", "10px sans-serif")
    .text(function(d) { return d.id; });
  });
}

function type(d, _, columns) {
  d.date = parseTime(d.date);
  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
  return d;
}
