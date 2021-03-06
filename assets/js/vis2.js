//"use strict";

//Data file which is a combination of the total students and total loan data sets
var StudentData ="./data/StudentsAndLoans.csv";
var PopulationData = "./data/Populations.csv";

//Filter year variable, this is what the default year value will be on page load
var filterYear = 1992;
//Filtered province for vis 3, default set to Ontario
var selectedProv = "Ontario";

//Variables for keeping track of the percentage display for vis2
var percentageToggled = false;
var percentageData;

//Initial draw
drawStackedBars();

document.querySelector("#capita-toggle").addEventListener("click", function(){
  switchGraphMode();
});

//Updates graphs for the percentage toggle switch
function switchGraphMode() {
  percentageToggle();
  clearGraph();
  drawStackedBars();
  redrawGraph();
}


//Greys out buttons that represent values that aren't shown
function percentageToggle(){
  if (percentageToggled == false) {
    percentageToggled = true;
    document.querySelector("#capita-toggle").classList.remove("greyed");
  } else {
    percentageToggled = false;
    document.querySelector("#capita-toggle").classList.add("greyed");
  }
}

//Function that gets called whenever the year slider is changed
//It sets the filter year to the new value and then redraws the graph
function sliderUpdate(){
  d3.select("#stacked-bars").selectAll("*").remove();
  d3.select("#grouped-bars").selectAll("*").remove();
  filterYear = document.querySelector("#year").value;
  drawStackedBars();
  drawGroupedBars();
}

//https://bl.ocks.org/tomshanley/3c49d036610853d380e3fcaf8d3f0b89
var sliderContainer = d3.select("#loan-figures")
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

//Function that builds the whole graph from scratch
//Adapted from Mike Bostock https://bl.ocks.org/mbostock/3886208
function drawStackedBars(){

  var svg = d3.select("#stacked-bars"),
  margin = {top: 20, right: 20, bottom: 30, left: 40},
  width = +svg.attr("width") - margin.left - margin.right,
  height = +svg.attr("height") - margin.top - margin.bottom,
  g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Setting scaling variables
  var x = d3.scaleBand()
  .rangeRound([0, width])
  .paddingInner(0.05)
  .align(0.1);

  var y = d3.scaleLinear()
  .rangeRound([height, 0]);

  var z = d3.scaleOrdinal()
  .range(["1", "0.6"]);

  //Populate percentageData array with contents of PopulationData csv file
  d3.csv(PopulationData, function(popData){
    percentageData = popData;
  });

  d3.csv(StudentData, function(data) {

    //https://github.com/d3/d3-fetch/blob/master/README.md#dsv
    //Filters out rows that aren't in the selected year

    if(data.Year == filterYear){
      if(hideVal.includes(data.Province)){
        return;
      }

      var currProv = data.Province;
      var provPop;

      if (percentageToggled) {
        for (i = 0; i < percentageData.length; i++) {
          if (percentageData[i]["province"] == currProv) {
            provPop = percentageData[i]["population"];
            console.log(currProv + ": " + provPop);
          }
        }

        return {
          Year: data.Year,
          Province: data.Province,
          ['Students without loans']: ((data['Students without loans'] - data['Students with loans'])/provPop)*100, //Subtracts students with loans from total to accurately portray the total number of students on the graph
          ['Students with loans']: (data['Students with loans']/provPop)*100
        }

      } else {
        return {
          Year: data.Year,
          Province: data.Province,
          ['Students without loans']: data['Students without loans'] - data['Students with loans'], //Subtracts students with loans from total to accurately portray the total number of students on the graph
          ['Students with loans']: data['Students with loans']
        };
      }
    }
  }, function(error, data) {
    if (error) throw error;


    var keys = data.columns.slice(2).reverse();

    //data.sort(function(a, b) { return b.total - a.total; });
    x.domain(data.map(function(d) { if(d.Year == filterYear) return d.Province; }));
    if (!percentageToggled) {
      y.domain([0, d3.max(data, function(d) { return +d['Students without loans'] + +d['Students with loans']; })]).nice();
    } else {
      y.domain([0, d3.max(data, function(d) { return +d['Students without loans'] + +d['Students with loans']; })]).nice();
    }

    z.domain(keys);

    //Main graph creation
    g.append("g")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data))
    .enter().append("g")
    .attr("opacity", function(d) { return z(d.key); })
    .selectAll("rect")
    .data(function(d) { /*console.log('d');*/ return d; })
    .enter().append("rect")
    .attr("x", function(d) { return x(d.data.Province); })
    .attr("y", function(d) { return y(d[1]); })
    .attr("height", function(d) { return y(d[0]) - y(d[1]); })
    .attr("width", x.bandwidth())
    .on("click", function(d) {
      console.log(d.data.Province);
      selectedProv = d.data.Province;
      d3.select("#grouped-bars").selectAll("*").remove();
      drawGroupedBars();
    })
    .on('mouseover', function(d){
      this.style.cssText = "opacity: 0.8"; //Highlights hovered bar by lightening the colour
      if(!percentageToggled){
        d3.select("#tooltip")
        .transition()
        .attr("x", this.getAttribute("x")) //Moves the tooltip text to the top left of the hovered bar
        .attr("y", this.getAttribute("y"))
        .attr("style", "opacity:1; background:white; padding:1em;")
        .text(d[1]- d[0]);
      }else{
        percentageValue = String(d[1]- d[0]);
        d3.select("#tooltip")
        .transition()
        .attr("x", this.getAttribute("x")) //Moves the tooltip text to the top left of the hovered bar
        .attr("y", this.getAttribute("y"))
        .attr("style", "opacity:1;nbackground:white; padding:1em;")
        .text(percentageValue.slice(0, -12) + "%"); //Trims the end of the string so there isn't a massive amount of decimal values
      }
    })
    .on('mouseout', function(d){
      this.style.cssText = "opacity: 1; background:white; padding:1em;"; //Sets colourof the bar back to normal after mouse leaves
      d3.select("#tooltip")
      .attr("style", "opacity:0; background:white; padding:1em;"); //Makes tooltip text invisible
    })
    .attr("id", function(d) { return d.data.Province.replace(/\s/g, ""); });

    //Creating X Axis
    g.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    //Creating Y Axis
    if (!percentageToggled) {
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
    } else {
      var scale = d3.scaleLinear()
      .domain([d3.max(data, function(d) { return +d['Students without loans'] + +d['Students with loans'];2 }), 0])
      .rangeRound([0, height]);

      var formatPercent = d3.format(".0%");

      var axis = d3.axisLeft()
      .scale(scale)
      .ticks(8)
      .tickFormat(d => d + "%");

      g.append("g")
      .attr("class", "axis")
      .call(axis)
      .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Percentage of population");
    }

    //Creating tool tip object so that it can be moved around the graph based on current hover states
    var toolTip = g.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 12)
    .attr("text-anchor", "end");

    toolTip.append("text")
    .attr("x", 0)
    .attr("width", 190)
    .attr("height", 50)
    .attr("style", "background:white; padding:1em;")
    .attr("id", "tooltip");

    //Colour legend for the stacked bar chart
    var legend = g.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    //Colour square for each legend item
    legend.append("rect")
    .attr("x", width - 19)
    .attr("width", 19)
    .attr("height", 19)
    .attr("opacity", z);

    //Text for each legend item
    legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text(function(d) { return d; });


    //Title text for the stacked bar chart
    var title = g.append("g")
    .attr("id", "stacked-title")
    .attr("text-anchor", "center");

    document.querySelector("#vis2Title").innerHTML = "Student Loan Figures: "+ filterYear;




  });

}
