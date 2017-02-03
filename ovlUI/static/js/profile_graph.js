Chart.defaults.global.responsive = true;
Chart.defaults.global.animation = false;

var ctx = document.getElementById("viral-load-plot");
var data = {
    labels: ["2016-02-20", "2016-04-23", "2016-06-17", "2016-08-19", "2016-10-14", "2016-12-29", "2017-02-11"],
    datasets: [{
        label: "Viral Load (cp/mL)",
        data: [25500, 23560, 4234, 2937, 1235, 830, 540],
        fill: false,
        lineTension: 0.2,
        borderColor: "#0275d8",
        backgroundColor: "#0275d8",
        pointBorderColor: "#0275d8",
        pointHoverBorderColor: "#FFFFFF",
    }]
};
var myLineChart = new Chart(ctx, {
    type: 'line',
    data: data
});
