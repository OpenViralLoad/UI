from flask import render_template, request, flash, redirect
from ovlUI import app, database_ops


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


@app.route("/patient_form")
def new_patient():
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
    appointment = appointments[0][0]
    last_visit = appointments[1][0]
    return render_template("patient_profile.html", patient=patient,
                           appointment=appointment, last_visit=last_visit)
