import os
from ovlUI import app

DEBUG = True
DATABASE = os.path.join(app.root_path, 'records.db')
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, '\static\img\profile_pics')
#'D:\ME\OVL\ovlUI\static\img\profile_pics'
#app.config['UPLOAD_FOLDER'] = '/static/img/profile_pics'
app.config['ALLOWED_EXTENSIONS'] = set(['png', 'jpg', 'jpeg'])
# SECRET_KEY = 'development key'
# USERNAME = 'admin'
# PASSWORD = 'default'
