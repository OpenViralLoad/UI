class Device {
	constructor(type, number = 0, destination = 0, serial_port = "", samples = []) {
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

	fetchSample() {
		return this.samples;
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


function startTest(session, sample) {
	need_more_devices = true;
	for (var i; i < session.length; i++) {
		if (session[i].type == "extractor" && session.hasOpenSlot()) {
			need_more_devices = false;
			session[i].addSample(sample);
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
