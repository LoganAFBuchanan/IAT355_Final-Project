//Code Adapted from https://bl.ocks.org/mbostock/3884955

"use strict";

//Data url
var url ="./data/LoanValueData.csv";

//Array for hiding specific provinces
var hideVal = [];

//Parses time for use in d3 graphs
var parseTime = d3.timeParse("%Y");

//Draws initial graph
redrawGraph();

document.querySelector("button.BritishColumbia").addEventListener("click", function(){
  updateFilters("British Columbia");
});
document.querySelector("button.Yukon").addEventListener("click", function(){
  updateFilters("Yukon");
});
document.querySelector("button.Alberta").addEventListener("click", function(){
  updateFilters("Alberta");
});
document.querySelector("button.Saskatchewan").addEventListener("click", function(){
  updateFilters("Saskatchewan");
});
document.querySelector("button.Manitoba").addEventListener("click", function(){
  updateFilters("Manitoba");
});
document.querySelector("button.Ontario").addEventListener("click", function(){
  updateFilters("Ontario");
});
document.querySelector("button.NewBrunswick").addEventListener("click", function(){
  updateFilters("New Brunswick");
});
document.querySelector("button.NovaScotia").addEventListener("click", function(){
  updateFilters("Nova Scotia");
});
document.querySelector("button.PrinceEdwardIsland").addEventListener("click", function(){
  updateFilters("Prince Edward Island");
});
document.querySelector("button.NewfoundlandandLabrador").addEventListener("click", function(){
  updateFilters("Newfoundland and Labrador");
});


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
}

function updateButtons(prov_arg){
  // Adapted from Henrik Andersson's answer here: https://stackoverflow.com/questions/10800355/remove-whitespaces-inside-a-string-in-javascript
  var noSpaceProv = prov_arg.replace(/\s/g, "");

  var provElement = document.querySelector("button."+noSpaceProv);

  if(provElement.classList.contains("greyed")){
    provElement.classList.remove("greyed");
  }else{
    provElement.classList.add("greyed");
  }
}


// Adapted from Sami and Nux's answers to this stack exchange question https://stackoverflow.com/questions/10784018/how-can-i-remove-or-replace-svg-content

//Clears the svg graph so that a new one can be drawn
function clearGraph(){
  d3.select("svg").selectAll("*").remove();;
}


function redrawGraph(){

  //Sets up graph as well as margins
  var svg = d3.select("svg"),
  margin = {top: 20, right: 80, bottom: 30, left: 50},
  width = svg.attr("width") - margin.left - margin.right,
  height = svg.attr("height") - margin.top - margin.bottom,
  g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Sets scales
  var x = d3.scaleTime().range([0, width]),
  y = d3.scaleLinear().range([height, 0]),
  z = d3.scaleOrdinal(d3.schemeCategory10);

  //Creates line curve
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

    //Goes through the removed values and splices them from the provinces data array

    // Adapted from MDN resources
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
    for (let removedProv of hideVal) {
      console.log(removedProv);
      provinces.splice(provinces.findIndex(province => province.id === removedProv), 1);
    }


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

    province.append("line")
    .attr("class", function(d) { return "line "+d.id.replace(/\s/g, ""); })
    .attr("d", function(d) { return line(d.values); });

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
