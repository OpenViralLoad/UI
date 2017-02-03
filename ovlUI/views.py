from flask import render_template
from ovlUI import app


@app.route('/')
@app.route('/index')
@app.route('/index.html')
def index():
    return render_template('index.html')


@app.route('/patient_form')
@app.route('/patient_form.html')
def new_patient():
    return render_template('patient_form.html')
