function getParamFromQueryStr(name, url) {
	if (!url) {
		url = window.location.href;
	}
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}
// localStorage.clear();
// New Input
var add = {};
add.device_type = getParamFromQueryStr('device_type');
add.patient_id = getParamFromQueryStr('patient_id');

// var devices = [{
// 	"device_type": "ext1",
// 	"patient_ids": ["1", "2"]
// }, {
// 	"device_type": "therm1",
// 	"patient_ids": ["2", "4"]
// }];

// Stored Features
if (localStorage.devices == null) {
	console.log("null");
	localStorage.devices = JSON.stringify([]);
} else {
	devices = JSON.parse(localStorage.devices);
	console.log(devices);
}


var devices_list = [];
devices.forEach(function(dev) {
	devices_list.push(dev.device_type);
});
console.log(devices_list);
if (devices_list.includes(add.device_type)) { // add more samples to existing tab
	localStorage.devices.forEach(function(device) {
		if (add.device_type == device.device_type) {
			device.patient_ids.push(add.patient_id);
		}
	});
} else { // add another tab
	localStorage.devices.push(add);
}
console.log(devices);
// console.log(localStorage.devices);
// localStorage.setItem('devices', JSON.stringify(devices));
// var session = JSON.parse(localStorage.getItem('devices'));
// console.log(session);
// TODO: now generate tabs and content based on stored parameters (2-6-17)
// document.getElementById("result").innerHTML = localStorage.session[0].patient_id;
