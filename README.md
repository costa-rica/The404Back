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
NGINX_SITES_ENABLED_PATH=/etc/nginx/sites-enabled
USER_HOME_DIR=/home/dashanddata_user
```

- replacing `NGINX_FILES_CREATED` with `STORE_CREATED_NGINX_FILE_HOME`
- for reverse proxy server servers use:

## Storing nginx files in Nginx Dirs

Most probably need to changed permissions. To do this from the terminal I've done:
`sudo chown -R nick:nick /etc/nginx/conf.d/` or `sudo chown -R dashanddata_user:dashanddata_user /etc/nginx/conf.d/`
