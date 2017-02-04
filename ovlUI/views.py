from flask import render_template, request, flash, redirect
from ovlUI import app, database_ops


@app.route('/', methods=['GET', 'POST'])
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
        db = database_ops.get_db()
        cur = db.execute(
            "select patient_id, first_name, last_name from patients \
            where {0} = {1} \
            order by patient_id asc".format(search_filter, search_text))
        patients = cur.fetchall()
    return render_template('index.html', patients=patients)


@app.route('/patient_form')
def new_patient():
    return render_template('patient_form.html')
