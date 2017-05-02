class Device {
	constructor(type, number = 1, destination = 1, serial_port = "", samples = [], is_connected = 0) {
		var type_to_slots = {
			"extractor": 1,
			"thermocycler": 4,
			"imager": 4
		};
		this.type = type;
		this.name = type + " " + number;
		this.number = number;
		this.num_slots = type_to_slots[type];
		this.destination = destination;
		this.serial_port = serial_port;
		this.samples = samples;
		this.is_connected = is_connected;
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
	status.all_extractors = [];
	status.open_extractors = [];
	status.all_thermocyclers = [];
	status.open_thermocyclers = [];
	status.all_imagers = [];
	status.open_imagers = [];
	for (var i = 0; i < status.total; i++) {
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


function newDeviceInit() {
	// Generate the form:
	// Populate with possible serial ports
	var ports = ['COM1', 'COM2', 'COM3']; // TESTING PURPOSES
	$.each(ports, function(index, value) {
		$("#serial_port_form").append($("<option />").text(value));
	});

	// $.getJSON("/device_management/get_ports", function(data) {
	// 	var ports = data["devices"];
	// 	$.each(ports, function(index, value) {
	// 	  $("#serial_port_form").append($("<option />").text(value));
	// 	});
	// });


	// Show modal after form options generated
	$("#new-device-modal").modal();
	// Erase form options once modal is closed
	$('#new-device-modal').on('hidden.bs.modal', function(e) {
		$("#serial_port_form").empty();
	});
}


function newDeviceDestination(session) {
	$("#receiving_dev_form").empty();
	var dev_val = $("#device_type_form").val();
	if (dev_val > -1 && dev_val < 2) {
		$("#receiving_dev_form_group").show();
		var dest_actives = sessionStatus(session).all_thermocyclers;
		if (dev_val == 1)
			dest_actives = sessionStatus(session).all_imagers;
		for (var i=0; i < dest_actives.length; i++) {
			var dev = dest_actives[i];
			$("#receiving_dev_form").append($("<option />").text(dev.name));
		}
	} else {
		$("#receiving_dev_form_group").hide();
	}

	// Erase form options once modal is closed
	$('#new-device-modal').on('hidden.bs.modal', function(e) {
		$("#device_type_form")[0].selectedIndex = 0;
		$("#receiving_dev_form").empty();
	});
}


function newDeviceConn() {
	// Take values from the form and instantiate device object
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
				number: sessionStatus(session).all_thermocyclers[i].name
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
				number: sessionStatus(session).all_imagers[i].name
			};
		}
		var dropdown = document.getElementById("thermocycler-dropdown-destination");
		for (i in imagers) {
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
