"use strict";

var totalStudents = './data/TotalStudents.csv';

var totalLoans = './data/TotalLoans.csv';


//http://learnjsdata.com/combine_data.html
d3.queue()
.defer(d3.csv, "./data/TotalStudents.csv")
.defer(d3.csv, "./data/TotalLoans.csv")
.await(combine);

function combine(error, big_data_1, big_data_2) {
  if (error) {
    console.log(error);
  }

  var mergedData = d3.merge([big_data_1, big_data_2]);
  console.log(mergedData);

  var currYear = 1992;

  var totalStudents = true;

  for (let i=0; i<mergedData.length; i++) {
    mergedData[i].year = currYear;

    if(totalStudents == true) mergedData[i].Total = "TotalStudents";
    else mergedData[i].Total = "TotalLoans";
    currYear++

    if(currYear >= 2015) {
      currYear = 1992;
      totalStudents = false;
    }
  }
  console.log(mergedData);

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
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  d3.select("body").selectAll("p")
  .data(mergedData)
  .enter()
  .append("p")
  .text(function(d) {
    if(d.Total == "TotalLoans"){

      var output;

      output = d.year + " " + d.Alberta;

      return output;
    }
    return;
  });

}
