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
        // Pop open modal to tell user which tab it was added to
        var device_name = session[i]["device_type"] + " " + session[i]["device_num"];
        $("#modal-assigned-device").text(device_name);
        $("#start-test-modal-append").modal();
      }
    }
  }
  // If no extractors available (session = []) then invoke modal-init
  if (extractors_avail == 0) {
    // $("#start-test-modal-init").modal();
  }
}

// var new_dev = {
//   "device_type": "extractor",
//   "device_num": max_extractor_num + 1;
//    "samples": [{
//      "patient_id": new_sample["patient_id"],
//      "patient_lname": new_sample["patient_lname"]
//    }],
//    "max_slots": 3,
//    "serial_port_id": 1234,
//    "rate": 12,
//    "destination": "therm_1"}
