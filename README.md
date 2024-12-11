# The 404 API

## .env

```env
APP_NAME="The404Back"
SECRET_KEY=something_secret
PROJECT_RESOURCES=/home/dashanddata_user/project_resources/The404Back
DB_CONNECTION_STRING=mongodb+srv://<user>:<****user_key ****>@cluster0.8puct.mongodb.net/The404
FILE_PATH_SYSLOG=/var/log/syslog
FILE_PATH_PM2_OUTPUT=/home/dashanddata_user/.pm2/logs/combined.log
FILE_PATH_PM2_ERROR=/home/dashanddata_user/.pm2/logs/combined-error.log
NGINX_CONF_D_PATH=/etc/nginx/conf.d
NGINX_SITES_AVAILABLE_PATH=/etc/nginx/sites-available
STORE_CREATED_NGINX_FILE_HOME=/home/dashanddata_user
STORE_CREATED_NGINX_FILE_NGINX_DIR=/etc/nginx/conf.d
```

- replacing `NGINX_FILES_CREATED` with `STORE_CREATED_NGINX_FILE_HOME`
