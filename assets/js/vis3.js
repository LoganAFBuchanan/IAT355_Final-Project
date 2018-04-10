//Adapted from Mike Bostock https://bl.ocks.org/mbostock/3887051

var GraduateData ="./data/GraduatesData.csv";

drawGroupedBars();

function drawGroupedBars(){
  var svg = d3.select("#grouped-bars"),
  margin = {top: 20, right: 20, bottom: 30, left: 40},
  width = +svg.attr("width") - margin.left - margin.right,
  height = +svg.attr("height") - margin.top - margin.bottom,
  g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x0 = d3.scaleBand()
  .rangeRound([0, width])
  .paddingInner(0.1);

  var x1 = d3.scaleBand()
  .padding(0.05);

  var y = d3.scaleLinear()
  .rangeRound([height, 0]);

  var z = d3.scaleOrdinal()
  .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  d3.csv(GraduateData, function(data) {

    //Adjusting the year selected based on the main year sliderUpdate
    //The data only has information on three years so the denominations are as follows
    /*
    Before 2000 = 2000
    Between 2000 & 2010 = 2005
    After 2010 = 2010
    */
    var selectedYear;
    if(filterYear <= 2000){
      selectedYear = 2000;
    }else if(filterYear > 2000 && filterYear < 2010){
      selectedYear = 2005;
    }else{
      selectedYear = 2010;
    }


    //Modelling data from the CSV based on selected filters from the year slider and the selected province
    if(data.province == selectedProv && data.year == selectedYear){
      return {
        Year: data.year,
        Province: data.province,
        Level: data.level,
        GraduateType: data.graduatetype,
        Value: data.value
      };
    }else{
      return;
    }

  }, function(error, data) {
    if (error) throw error;

    //Creating keys for the side by side bars
    var keys = [
      "Percentage of graduates who owed debt to the source",
      "Percentage of graduates with large debt at graduation ($25000 and over)"
    ];
    console.log(data.columns);
    console.log(keys);

    x0.domain(data.map(function(d) { return d.Level; }));
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    y.domain([0, 100]).nice();

    g.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("transform", function(d) { return "translate(" + x0(d.Level) + ",0)"; })
    .selectAll("rect")
    .data(function(d) {
      return keys.map(function(key) {
        if(key == d["GraduateType"]){
          return {key: key, Value: d["Value"]};
        }else{
          //ELiminating edge case where the incorrect values were drawn twice on top of one another
          return {key: key, Value: 0};
        }
      });
    })
    .enter().append("rect")
    .attr("x", function(d) { return x1(d.key); })
    .attr("y", function(d) { return y(d.Value); })
    .attr("width", x1.bandwidth())
    .attr("height", function(d) { return height - y(d.Value); })
    .attr("fill", function(d) {
      return z(d.key);
    });

    g.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x0));

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
    .text("Percentage of Graduates");

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

    document.querySelector("#vis3Title").innerHTML = "Graduate Debt: "+ selectedProv;
  });

}
