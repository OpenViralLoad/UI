CREATE TABLE IF NOT EXISTS patients (
  patient_id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL CHECK(
        typeof(first_name) = "text" AND
        length(first_name) <= 35
    ),
  last_name TEXT NOT NULL CHECK(
        typeof(last_name) = "text" AND
        length(last_name) <= 35
    ),
  sex TEXT CHECK(
      typeof(sex) = "text" AND
      (sex = "M" OR sex = "F")
  ),
  date_of_birth TEXT CHECK(
      typeof(date_of_birth) = "text" AND
      date_of_birth = strftime('%Y-%m-%d', date_of_birth)
  ),
  phone_number INTEGER UNIQUE,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS appointments (
    appt_id INTEGER PRIMARY KEY,
    patient_id INTEGER,
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
    appt_date TEXT CHECK(
        typeof(appt_date) = "text" AND
        appt_date = strftime('%Y-%m-%d %H:%M:%S', appt_date)
    ),
    appt_doctor TEXT CHECK(
        typeof(appt_doctor) = "text" AND
        length(appt_doctor) <= 70
    )
);

CREATE TABLE IF NOT EXISTS test_results (
    test_id INTEGER PRIMARY KEY,
    patient_id INTEGER,
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
    test_time TEXT DEFAULT CURRENT_TIMESTAMP,
    test_value REAL
);

CREATE TABLE IF NOT EXISTS treatments (
    treatment_id INTEGER PRIMARY KEY,
    patient_id INTEGER,
    FOREIGN KEY(patient_id) REFERENCES patients(patient_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
    treatment_name TEXT,
    treatment_startdate TEXT CHECK(
        typeof(treatment_startdate) = "text" AND
        treatment_startdate = strftime('%Y-%m-%d', treatment_startdate)
    ),
    treatment_enddate TEXT CHECK(
        typeof(treatment_enddate) = "text" AND
        treatment_enddate = strftime('%Y-%m-%d', treatment_enddate)
    )
);
