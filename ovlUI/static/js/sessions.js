class Device {
	constructor(type, number = 1, destination = 1, serial_port = "", samples = []) {
		var type_to_slots = {
			"extractor": 1,
			"thermocycler": 4,
			"imager": 4
		};
		this.type = type;
		this.number = number;
		this.num_slots = type_to_slots[type];
		this.destination = destination;
		this.serial_port = serial_port;
		this.samples = samples;
	}

	fetchName() {
		return this.type + this.number.toString();
	}

	addSample(new_sample) {
		this.samples.push(new_sample);
	}

	hasOpenSlot() {
		if (this.samples.length < this.num_slots) {
			return true;
		} else {
			return false;
		}
	}
}


function loadSession() {
	// Fetch localStorage session or init empty session
	var session = [];
	if (localStorage.devices == null) {
		localStorage.devices = JSON.stringify([]);
		session = JSON.parse(localStorage.devices);
	} else {
		session = JSON.parse(localStorage.devices);
	}
	return session;
}


function sessionStatus(session) {
	var status = {};
	status.total = session.length;
	status.num_extractors = 0;
	status.num_thermocyclers = 0;
	status.num_imagers = 0;
	status.all_extractors = []; status.open_extractors = [];
	status.all_thermocyclers = []; status.open_thermocyclers = [];
	status.all_imagers = []; status.open_imagers = [];
	for (var i = 0; i < total_num_devices; i++) {
		if (session[i].type == "extractor") {
			status.num_extractors++;
			status.all_extractors.push(session[i]);
			if (session[i].hasOpenSlot()) {
				status.open_extractors.push(session[i]);
			}
		}
		if (session[i].type == "thermocycler") {
			status.num_thermocyclers++;
			status.all_thermocyclers.push(session[i]);
			if (session[i].hasOpenSlot()) {
				status.open_thermocyclers.push(session[i]);
			}
		}
		if (session[i].type == "imager") {
			status.num_imagers++;
			status.all_imagers.push(session[i]);
			if (session[i].hasOpenSlot()) {
				status.open_imagers.push(session[i]);
			}
		}
	}
	return status;
}


function startTest(session, sample) {
	need_more_devices = true;
	for (var i; i < session.length; i++) {
		if (session[i].type == "extractor" && session.hasOpenSlot()) {
			need_more_devices = false;
			session[i].addSample(sample);
			// TODO: dropdown to let user pick which extractor to add to?
			// Modal to tell user which device it was added to
			var device_name = session[i].type + " " + session[i].number;
			$("#modal-assigned-device").text(device_name);
			$("#start-test-modal-append").modal();
			// Update the localStorage object
			localStorage.devices = JSON.stringify(session);
			// Go to Devices page
			window.location.href = "/devices";
			break;
		}
	}
	if (need_more_devices == true) {
		$("#no-avail-extractor-modal").modal();
	}
}


// TODO: build the corresponding "Settings" page for this
function createExtractor(session) {
	// Generate dropdown options for extractor destination
	// if there are thermocyclers active
	if (sessionStatus(session).num_thermocyclers > 0) {
		var thermocyclers = {};
		for (var i = 0; i < sessionStatus(session).num_thermocyclers; i++) {
			var number = i + 1;
			var thermocyclers = {
				number : sessionStatus(session).all_thermocyclers[i].fetchName()
			};
		}
		var dropdown = document.getElementById("extractor-dropdown-destination");
		for (i in thermocyclers) {
		    select.options[select.options.length] = new Option(thermocyclers[i], i);
		}
	} else { // default to 1 if no thermocyclers active
		var destination = 1;
	}
	// Open modal with extractor params form
	$("#create-extractor-modal").modal();
	// Take data from filled form and create device object
	$("#create-extractor-continue").click(function() {
		if (sessionStatus(session).num_thermocyclers > 0) {
			var destination = $("#extractor-destination-form").val();
		}
		// TODO: Get avail serial ports via ajax + flask API
		var serial_port = $("#extractor-serial-port-form").val();
		var number = sessionStatus(session).num_extractors + 1;
		var new_extractor = new Device("extractor", number, destination, serial_port);
		session.push(new_extractor);
		if (sessionStatus(session).num_thermocyclers == 0) {
			createThermocycler();
		}
		// Update the localStorage object
		localStorage.devices = JSON.stringify(session);
	});
}


function createThermocycler(session) {
	// Generate dropdown options for thermocycler destination
	// if there are imagers active
	if (sessionStatus(session).num_imagers > 0) {
		var imagers = {};
		for (var i = 0; i < sessionStatus(session).num_imagers; i++) {
			number = i + 1;
			var imagers = {
				number : sessionStatus(session).all_imagers[i].fetchName()
			};
		}
		var dropdown = document.getElementById("thermocycler-dropdown-destination");
		for(i in imagers) {
		    select.options[select.options.length] = new Option(imagers[i], i);
		}
	} else { // default to 1 if no thermocyclers active
		var destination = 1;
	}
	// Open modal with thermo params form
	$("#create-thermocycler-modal").modal();
	// Take data from filled form and create device object
	$("#create-thermocycler-continue").click(function() {
		if (sessionStatus(session).num_imagers > 0) {
			var destination = $("#thermocycler-destination-form").val();
		}
		// TODO: Get avail serial ports via ajax + flask API
		var serial_port = $("#thermocycler-serial-port-form").val();
		var number = sessionStatus(session).num_thermocyclers + 1;
		var new_thermocycler = new Device("thermocycler", number, destination, serial_port);
		session.push(new_thermocycler);
		if (sessionStatus(session).num_imagers == 0) {
			createImager();
		}
		// Update the localStorage object
		localStorage.devices = JSON.stringify(session);
	});
}


function createImager(session) {
	var destination = 0;
	// Open modal with imager params form
	$("#create-imager-modal").modal();
	// Take data from filled form and create device object
	$("#create-thermocycler-continue").click(function() {
		// TODO: Get avail serial ports via ajax + flask API
		var serial_port = $("#imager-serial-port-form").val();
		var number = sessionStatus(session).num_imagers + 1;
		var new_imagers = new Device("imager", number, destination, serial_port);
		session.push(new_imager);
		// Update the localStorage object
		localStorage.devices = JSON.stringify(session);
	});
}
