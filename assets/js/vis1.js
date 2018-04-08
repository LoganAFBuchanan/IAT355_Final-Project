//Code Adapted from https://bl.ocks.org/mbostock/3884955

"use strict";

//Data url
var LoanValueData ="./data/LoanValueData.csv";

//Array for hiding specific provinces
var hideVal = [];

//Parses time for use in d3 graphs
var parseTime = d3.timeParse("%Y");

//Draws initial graph
redrawGraph();




//Click event listeners for each of the filter buttons
document.querySelector("#BritishColumbia").addEventListener("click", function(){
  updateFilters("British Columbia");
});
document.querySelector("#Yukon").addEventListener("click", function(){
  updateFilters("Yukon");
});
document.querySelector("#Alberta").addEventListener("click", function(){
  updateFilters("Alberta");
});
document.querySelector("#Saskatchewan").addEventListener("click", function(){
  updateFilters("Saskatchewan");
});
document.querySelector("#Manitoba").addEventListener("click", function(){
  updateFilters("Manitoba");
});
document.querySelector("#Ontario").addEventListener("click", function(){
  updateFilters("Ontario");
});
document.querySelector("#NewBrunswick").addEventListener("click", function(){
  updateFilters("New Brunswick");
});
document.querySelector("#NovaScotia").addEventListener("click", function(){
  updateFilters("Nova Scotia");
});
document.querySelector("#PEI").addEventListener("click", function(){
  updateFilters("PEI");
});
document.querySelector("#Newfoundland").addEventListener("click", function(){
  updateFilters("Newfoundland");
});

//Greys out buttons that represent values that aren't shown
function updateButtons(prov_arg){
  // Adapted from Henrik Andersson's answer here: https://stackoverflow.com/questions/10800355/remove-whitespaces-inside-a-string-in-javascript
  var noSpaceProv = prov_arg.replace(/\s/g, "");

  var provElement = document.querySelector("button#"+noSpaceProv);

  if(provElement.classList.contains("greyed")){
    provElement.classList.remove("greyed");
  }else{
    provElement.classList.add("greyed");
  }
}


//Updates the removed value array so that the graph can be updated

// Adapted from MDN resources
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
function updateFilters(prov){
  if(hideVal.includes(prov)){
    hideVal.splice(hideVal.findIndex(function(element){
      return element == prov;
    }), 1);
  }else{
    hideVal.push(prov);
  }
  console.log(hideVal);

  clearGraph();
  updateButtons(prov);
  redrawGraph();
  drawStackedBars();
}


// Adapted from Sami and Nux's answers to this stack exchange question https://stackoverflow.com/questions/10784018/how-can-i-remove-or-replace-svg-content

//Clears the svg graph so that a new one can be drawn
function clearGraph(){
  d3.select("#line-chart").selectAll("*").remove();
  d3.select("#stacked-bars").selectAll("*").remove();
}


function redrawGraph(){

  //Sets up graph as well as margins
  var svg = d3.select("#line-chart"),
  margin = {top: 20, right: 80, bottom: 30, left: 50},
  width = svg.attr("width") - margin.left - margin.right,
  height = svg.attr("height") - margin.top - margin.bottom,
  g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Sets scales
  var x = d3.scaleTime().range([0, width]),
  y = d3.scaleLinear().range([height, 0]);

  //Creates line curve
  var line = d3.line()
  .curve(d3.curveBasis)
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y(d.loanValue); });

  d3.csv(LoanValueData, type, function(error, data) {
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

    //Goes through the removed values and splices them from the provinces data array

    // Adapted from MDN resources
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
    for (let removedProv of hideVal) {
      console.log(removedProv);
      provinces.splice(provinces.findIndex(province => province.id === removedProv), 1);
    }


    //X-axis domain based on year
    x.domain(d3.extent(data, function(d) { return d.date; }));

    //Y axis domain based on the min/max of selected values
    y.domain([
      d3.min(provinces, function(c) { return d3.min(c.values, function(d) { return d.loanValue; }); }),
      d3.max(provinces, function(c) { return d3.max(c.values, function(d) { return d.loanValue; }); })
    ]);


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
    .attr("id", function(d) { return d.id.replace(/\s/g, ""); }) // Adapted from Henrik Andersson's answer here: https://stackoverflow.com/questions/10800355/remove-whitespaces-inside-a-string-in-javascript
    .attr("d", function(d) { return line(d.values); });

    //Title text for the line chart
    var title = g.append("g")
    .attr("id", "line-title")
    .attr("text-anchor", "center");

    title.append("text")
    .attr("x", width/4) //Using positioning to roughly center because Edge doesn't like the transform attribute on svg elements
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text("Student Loan Values");

    // province.append("text")
    // .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
    // .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.loanValue) + ")"; })
    // .attr("x", 3)
    // .attr("dy", "0.35em")
    // .style("font", "10px sans-serif")
    // .text(function(d) { return d.id; });



  });
}

function type(d, _, columns) {
  d.date = parseTime(d.date);
  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
  return d;
}
