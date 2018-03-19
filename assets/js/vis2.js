//"use strict";

var StudentData ="./data/StudentsAndLoans.csv";

var filterYear = 1992;

drawStackedBars();

function sliderUpdate(){
  d3.select("#stacked-bars").selectAll("*").remove();
  filterYear = document.querySelector("#year").value;
  drawStackedBars();
}

//https://bl.ocks.org/tomshanley/3c49d036610853d380e3fcaf8d3f0b89
var sliderContainer = d3.select(".button-container")
sliderContainer.append("input")
.attr("type", "range")
.attr("min", "1992")
.attr("max", "2014")
.attr("value", "1992")
.attr("step", "1")
.attr("id", "year")
.on("input", function input() {
  sliderUpdate();
});

function drawStackedBars(){

  var svg = d3.select("#stacked-bars"),
  margin = {top: 20, right: 20, bottom: 30, left: 40},
  width = +svg.attr("width") - margin.left - margin.right,
  height = +svg.attr("height") - margin.top - margin.bottom,
  g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");



  var x = d3.scaleBand()
  .rangeRound([0, width])
  .paddingInner(0.05)
  .align(0.1);

  var y = d3.scaleLinear()
  .rangeRound([height, 0]);

  var z = d3.scaleOrdinal()
  .range(["#24aa5e", "#31e981"]);

  d3.csv(StudentData, function(data) {

    //https://github.com/d3/d3-fetch/blob/master/README.md#dsv
    if(data.Year == filterYear){
      if(hideVal.includes(data.Province)){
        return;
      }
      return {
        Year: data.Year,
        Province: data.Province,
        ['Students without loans']: data['Students without loans'] - data['Students with loans'], //Subtracts students with loans from total to accurately portray the total number of students on the graph
        ['Students with loans']: data['Students with loans']
      };
    }

  }, function(error, data) {
    if (error) throw error;


    var keys = data.columns.slice(2).reverse();

    //data.sort(function(a, b) { return b.total - a.total; });
    x.domain(data.map(function(d) { if(d.Year == filterYear) return d.Province; }));
    y.domain([0, d3.max(data, function(d) { return +d['Students without loans'] + +d['Students with loans']; })]).nice();
    z.domain(keys);

    g.append("g")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data))
    .enter().append("g")
    .attr("fill", function(d) { return z(d.key); })
    .selectAll("rect")
    .data(function(d) { console.log(d); return d; })
    .enter().append("rect")
    .attr("x", function(d) { return x(d.data.Province); })
    .attr("y", function(d) { return y(d[1]); })
    .attr("height", function(d) { return y(d[0]) - y(d[1]); })
    .attr("width", x.bandwidth());

    g.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
    .attr("x", 2)
    .attr("y", y(y.ticks().pop()) + 0.5)
    .attr("dy", "0.32em")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .text("Total Students");

    var legend = g.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
    .attr("x", width - 19)
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", z);

    legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text(function(d) { return d; });

    var title = g.append("g")
    .attr("id", "stacked-title")
    .attr("text-anchor", "center");

    title.append("text")
    .attr("x", width/4)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text("Student Loan Figures: "+ filterYear);



  });

}
