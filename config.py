import os
from ovlUI import app

DEBUG = True
DATABASE = os.path.join(app.root_path, 'records.db')
app.config['UPLOAD_FOLDER'] = 'ovlUI/static/img/profile_pics/'
app.config['ALLOWED_EXTENSIONS'] = set(['png', 'jpg', 'jpeg'])
# SECRET_KEY = 'development key'
# USERNAME = 'admin'
# PASSWORD = 'default'
