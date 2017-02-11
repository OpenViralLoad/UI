from flask import render_template, request, flash, redirect, url_for
from ovlUI import app, database_ops
from werkzeug import secure_filename
import os


@app.route("/", methods=["GET", "POST"])
def index():
    patients = None
    if request.method == "POST":
        search_filter = request.form['search_filter']
        if search_filter == "ID":
            search_filter = "patient_id"
        elif search_filter == "Lastname":
            search_filter = "last_name"
        else:
            search_filter == "phone_number"
        search_text = request.form['search_text']
        # NOTE: need to handle special chars and text-matching
        # leading 0's, uppercase vs lowercase
        db = database_ops.get_db()
        cur = db.execute(
            "select patient_id, first_name, last_name from patients \
            where {0} = {1} \
            order by patient_id asc".format(search_filter, search_text)
        )
        patients = cur.fetchall()
    return render_template("index.html", patients=patients)

def allowed_file(filename):
	return '.' in filename and \
			filename.rsplit('.',1)[1] in app.config['ALLOWED_EXTENSIONS']

@app.route("/patient_form", methods=['GET', 'POST'])
def patient_form():
	if request.method == 'POST':
		db = database_ops.get_db()
		firstName = request.form['first_name']
		lastName = request.form['last_name']
		sex = request.form['sex']
		if sex == 'Female':
			sex = 'F'
		else:
			sex = 'M'
		dateOfBirth = request.form['date_of_birth']
		phoneNum = request.form['phone_number']
		comments = request.form['extra_comments']
		cur = db.execute('''SELECT COUNT (*) FROM patients''')
		numPatient = cur.fetchone()[0]
		patientID = numPatient + 1
		file = request.files['photo']
		if file and allowed_file(file.filename):
			file.filename = str(patientID) + '.jpg'
			filename = secure_filename(file.filename)
			file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
		cur = db.execute(
			'''INSERT INTO patients(patient_id, first_name, \
			last_name, sex, date_of_birth, phone_number, notes) VALUES \
			(?, ?, ?, ?, ?, ?, ?)''', (patientID, firstName, lastName, sex, \
			dateOfBirth, phoneNum, comments))
		db.commit()
		return redirect('/profile/{0}'.format(patientID))

	return render_template("patient_form.html")


@app.route("/profile/<patient_id>")
def profile(patient_id):
    # NOTE: check if patient_id exists in db
    db = database_ops.get_db()
    cur = db.execute(
        "select patient_id, first_name, last_name, sex, \
        date_of_birth, phone_number, notes \
        from patients where patient_id={0}".format(patient_id)
    )
    patient = cur.fetchone()
    cur = db.execute(
        "select appt_date, appt_doctor from appointments \
        where patient_id={0} order by appt_date desc".format(patient_id)
    )
    appointments = cur.fetchall()
    try:
    	appointment = appointments[0][0]
    	last_visit = appointments[1][0]
    except:
    	appointment = 'N/A'
    	last_visit = 'N/A'
    return render_template("patient_profile.html", patient=patient,
                           appointment=appointment, last_visit=last_visit)


@app.route("/profile/<patient_id>/delete")
def delete_profile(patient_id):
    db = database_ops.get_db()
    cur = db.execute(
        "delete from patients where patient_id={0}".format(patient_id)
    )
    return redirect(urlfor("index"))


@app.route("/profile/<patient_id>/start_test")
def start_test(patient_id):
    return redirect(url_for("devices", patient_id=patient_id))


@app.route("/devices")
def devices():
    return render_template("devices.html")

