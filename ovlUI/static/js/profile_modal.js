function startTestModal() {
	var extractors_avail = 0;
	var max_extractor_num = 0;
	for (var i = 0; i < session.length; i++) {
		// Check whether there are already active extractors
		if (session[i]["device_type"] == "extractor") {
			max_extractor_num = session[i]["device_num"];
			if (session[i]["samples"].length < session[i]["max_slots"]) {
				extractors_avail++;
				// Add sample info to session
				session[i]["samples"].push(new_sample);
				// Pop up modal to tell user which tab it was added to
				var device_name = session[i]["device_type"] + " " + session[i]["device_num"];
				$("#modal-assigned-device").text(device_name);
				$("#start-test-modal-append").modal();
				// Update the localStorage object
				localStorage.devices = JSON.stringify(session);
			}
		}
	}
	// If no extractors available (session = []) then invoke modal-init
	if (extractors_avail == 0) {
		// Modal containing form to specify settings for new extractor
		$("#start-test-modal-init").modal();
		// Take data from filled form and create device object
		$("#continue-init").click(function() {
			var serial_port_id = $("#serial_port_form").val()
			var rate = $("#extrac-rate-form").val()
			var destination = $("#rec-device-form").val()
			var new_ext = {
				"device_type": "extractor",
				"device_num": max_extractor_num + 1,
				"samples": [{
					"patient_id": new_sample["patient_id"],
					"patient_lname": new_sample["patient_lname"]
				}],
				"max_slots": 1,
				"serial_port_id": serial_port_id,
				"rate": rate,
				"destination": destination
			}
			// Add device object to the session var
			session.push(new_ext);
			// Pop up modal to tell user which tab it was added to
			var device_name = session[max_extractor_num]["device_type"] + " " + session[max_extractor_num]["device_num"];
			$("#modal-assigned-device").text(device_name);
			// Wait for the previous modal to finish closing animation
			$("#start-test-modal-init").on("hidden.bs.modal", function() {
				$("#start-test-modal-append").modal("show");
			});
			// Update the localStorage object
			localStorage.devices = JSON.stringify(session);
		});
	}
}
