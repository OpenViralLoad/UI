var ctx = document.getElementsByClassName("cycleGraph");
var data = {
    labels: ["Begin Denaturization", "Maintain", "Begin Ramp Up 1", "Maintain", "Cooling", "Maintaining", "Ramp Up Cycle 2", "Maintain"],
    datasets: [{

        data: [20, 60, 60, 95, 95, 60, 60, 95, 95],
        spanGaps: false,
        steppedLine: false,
        lineTension: 0,
        fill: false,
        label: 'Temperature (in C)'
    }]
};
var graph = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            xAxes: [{
                display: false
            }]
        }

    }
});
