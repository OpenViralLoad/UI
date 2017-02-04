from flask import Flask


app = Flask(__name__)
app.config.from_object('config')


from ovlUI import views, database_ops
with app.app_context():
    database_ops.init_db()
