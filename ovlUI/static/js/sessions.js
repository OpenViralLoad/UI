class Device {
	constructor(type, number = 1, destination = 1,
		serial_port = "", samples = [], is_connected = 0,
		serial_number = 0, subscription_id = 0) {
		var type_to_slots = {
			"extractor": 1,
			"thermocycler": 4,
			"imager": 4
		};
		this.type = type.toLowerCase();
		this.name = type + " " + number;
		this.number = number;
		this.num_slots = type_to_slots[type];
		this.destination = destination;
		this.serial_port = serial_port;
		this.samples = samples;
		this.is_connected = is_connected;
		this.serial_number = serial_number;
		this.subscription_id = subscription_id;
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


// extended function for posting clientside json to flask views.py
jQuery.extend({
  postJSON: function(params) {
    return jQuery.ajax(jQuery.extend(params, {
      type: "POST",
      data: JSON.stringify(params.data),
      dataType: "json",
      contentType: "application/json",
      processData: false
    }));
  }
});


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
	status.all_serials = []
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
		status.all_serials.push(session[i].serial_number);
	}
	return status;
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


function newDevice0() {
	// Generate the form:
	// Populate with possible serial ports

	// TESTING PURPOSES //////
	// var ports = ['COM1', 'COM2', 'COM3'];
	// $.each(ports, function(index, value) {
	// 	$("#serial_port_form").append($("<option />").text(value).val(index));
	// });
	//////////////////////////

	$.getJSON("/device_management/get_ports", function(data) {
		var ports = data["devices"];
		$.each(ports, function(index, value) {
			$("#serial_port_form").append($("<option />").text(value).val(index));
		});
		console.log(ports);
	});


	// Show modal after form options generated
	$("#new-device-modal").modal();
	// Erase form options once modal is closed
	$('#new-device-modal').on('hidden.bs.modal', function(e) {
		$("#serial_port_form").empty();
	});
}


function newDevice1(session) {
	$("#receiving_dev_form").empty();
	var dev_val = $("#device_type_form").val();
	if (dev_val > -1 && dev_val < 2) {
		$("#receiving_dev_form_group").show();
		var dest_actives = sessionStatus(session).all_thermocyclers;
		if (dev_val == 1)
			dest_actives = sessionStatus(session).all_imagers;
		for (var i = 0; i < dest_actives.length; i++) {
			var dev = dest_actives[i];
			$("#receiving_dev_form").append($("<option />").text(dev.name).val(i));
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


function newDevice2(session) {
	// Take values from the form
	console.log(session);
	var dev_type = $("#device_type_form option:selected").text();
	var dev_num = "";
	if (dev_type == "extractor") {
		dev_num = sessionStatus(session).num_extractors;
	} else if (dev_type == "thermocycler") {
		dev_num = sessionStatus(session).num_thermocyclers;
	} else if (dev_type == "imager") {
		dev_num = sessionStatus(session).num_imagers;
	}
	var dev_port = $("#serial_port_form option:selected").text();
	var dev_rec = $("#receiving_dev_form option:selected").text();
	var conn_string = "/device_management/connect_device/" + String(dev_port)
	$.getJSON(conn_string, function(data) {
		var ser_num = data['serial_number'];
		var sub_id = data['device_subscription_id'];
		console.log(ser_num);
		var new_dev = new Device(dev_type, dev_num, dev_rec, dev_port, [], 1, ser_num, sub_id);
		// Add to session
		session.push(new_dev);
		// Update the localStorage object
		localStorage.devices = JSON.stringify(session);
	});
	console.log(session);
}


function reconnectKnown(session) {
	if (session.length > 0) {
		$.postJSON({
				url: '/devices/reconnect_known',
				data: {dev_serials: sessionStatus(session).all_serials},
				success: function(json) {
					console.log(json);
				},
		});
	}
}
