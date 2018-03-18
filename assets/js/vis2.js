

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
    console.log(d3.merge([big_data_1, big_data_2]));
}
