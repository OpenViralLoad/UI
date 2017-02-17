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


function addto_session() {
	// Fetch new input from url query string
	var add = {};
	add.device_type = getParamFromQueryStr('device_type');
	add.patient_id = [getParamFromQueryStr('patient_id')];
	// Fetch saved content from localStorage
	if (localStorage.devices == null) {
		localStorage.devices = JSON.stringify([]);
		session = JSON.parse(localStorage.devices);
	} else {
		session = JSON.parse(localStorage.devices);
	}
	// Check if new samples should go to an existing device tab or new tab
	var devices_list = [];
	session.forEach(function(dev) {
		devices_list.push(dev.device_type);
	});

	if (devices_list.includes(add.device_type)) { // add to existing tab
		session.forEach(function(device) {
			if (add.device_type == device.device_type) {
				device.patient_id = device.patient_id.concat(add.patient_id);
				// console.log(device);
			}
		});
	} else { // add new tab
		session.push(add);
	}
	localStorage.devices = JSON.stringify(session);
	console.log(session);
	return session;
}


function save_session() {
	var tabs = {};
	dev_tab_navs = document.getElementsByClassName("dev_tab_nav");
	for (var i = 0; i < dev_tab_navs.length; i++) {
		tab_nav = dev_tab_navs[i];
		tab_link = tab_nav.getAttribute("href");
		tab_content = document.getElementById(tab_link.replace("#", ""));
		console.log(tab_content);
		children = tab_nav.childNodes;
		for (var j = 0; j < children.length; j++) {
			if (children[j].className == "tab_title") {
				title = children[j].innerHTML;
			} else if (children[j].className == "tab_progress") {
				progress = children[j].innerHTML;
			}
		}
	}
	// tab_titles = document.getElementsByClassName("tab_title");
	// tab_bars = document.getElementsByClassName("tab_progress");
	// tab_samples = document.getElementsByClassName("tab_sample");
	// tab_settings = document.getElementsByClassName("");
	// for (var i = 0; i < tab_titles.length; i++) {
	// 	console.log(tab_titles[i].childNodes);
	// 	title = tab_titles[i].innerHTML;
	// for (var j = 0; j < tab_titles[j].childNodes.length; j++) {
	//
	// }
	// progress = tab_bars[i].getAttribute("style");
	// tabs[title] = [progress];
	// }
	// console.log(tabs);
}


function load_session() {
	session = JSON.parse(localStorage.devices);
	return session;
}


function clear_session() {
	localStorage.clear();
}


save_session();
// TODO: now generate tabs and content based on stored parameters (2-6-17)
// document.getElementById("result").innerHTML = localStorage.session[0].patient_id;
