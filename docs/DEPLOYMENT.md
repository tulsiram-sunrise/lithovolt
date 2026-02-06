# Lithovolt Deployment Guide

## Prerequisites

- Ubuntu 20.04+ server
- Domain name pointed to server IP
- SSH access to server
- sudo privileges

## Server Setup

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Dependencies
```bash
# Python
sudo apt install python3.11 python3.11-venv python3-pip -y

# PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Redis
sudo apt install redis-server -y

# Nginx
sudo apt install nginx -y

# Supervisor (for process management)
sudo apt install supervisor -y
```

### 3. Setup PostgreSQL
```bash
sudo -u postgres psql

CREATE DATABASE lithovolt_db;
CREATE USER lithovolt_user WITH PASSWORD 'your_secure_password';
ALTER ROLE lithovolt_user SET client_encoding TO 'utf8';
ALTER ROLE lithovolt_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE lithovolt_user SET timezone TO 'Asia/Kolkata';
GRANT ALL PRIVILEGES ON DATABASE lithovolt_db TO lithovolt_user;
\q
```

## Backend Deployment

### 1. Clone Repository
```bash
cd /var/www
sudo git clone <repository_url> lithovolt
cd lithovolt/backend
```

### 2. Setup Virtual Environment
```bash
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

### 3. Configure Environment
```bash
cp .env.example .env
nano .env
# Update all production values
```

### 4. Run Migrations
```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### 5. Setup Gunicorn
```bash
sudo nano /etc/supervisor/conf.d/lithovolt-api.conf
```

Add:
```ini
[program:lithovolt-api]
directory=/var/www/lithovolt/backend
command=/var/www/lithovolt/backend/venv/bin/gunicorn config.wsgi:application --bind 127.0.0.1:8000 --workers 3
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/lithovolt-api.log
```

### 6. Setup Celery
```bash
sudo nano /etc/supervisor/conf.d/lithovolt-celery.conf
```

Add:
```ini
[program:lithovolt-celery]
directory=/var/www/lithovolt/backend
command=/var/www/lithovolt/backend/venv/bin/celery -A config worker -l info
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/lithovolt-celery.log
```

### 7. Start Services
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl status
```

## Frontend Deployment

### 1. Build Frontend
```bash
cd /var/www/lithovolt/frontend
npm install
npm run build
```

### 2. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/lithovolt
```

Add:
```nginx
# API Server
server {
    listen 80;
    server_name api.lithovolt.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /var/www/lithovolt/backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/lithovolt/backend/media/;
    }
}

# Frontend
server {
    listen 80;
    server_name lithovolt.com www.lithovolt.com;

    root /var/www/lithovolt/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/lithovolt /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d lithovolt.com -d www.lithovolt.com -d api.lithovolt.com
```

## Mobile App Deployment

### Android (Play Store)

1. Update version in `app.json`
2. Build APK/AAB:
```bash
cd mobile
eas build --platform android
```
3. Upload to Play Console

### iOS (App Store)

1. Update version in `app.json`
2. Build IPA:
```bash
cd mobile
eas build --platform ios
```
3. Upload to App Store Connect

## Backup Strategy

### Database Backup
```bash
sudo nano /etc/cron.daily/backup-db
```

Add:
```bash
#!/bin/bash
BACKUP_DIR=/var/backups/lithovolt
DATE=$(date +%Y%m%d_%H%M%S)
sudo -u postgres pg_dump lithovolt_db > $BACKUP_DIR/db_$DATE.sql
find $BACKUP_DIR -type f -mtime +7 -delete
```

```bash
sudo chmod +x /etc/cron.daily/backup-db
```

### Media Files Backup
```bash
# Sync to S3
aws s3 sync /var/www/lithovolt/backend/media/ s3://your-bucket/media/
```

## Monitoring

### Application Logs
```bash
# API logs
sudo tail -f /var/log/lithovolt-api.log

# Celery logs
sudo tail -f /var/log/lithovolt-celery.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### System Monitoring
- Setup Sentry for error tracking
- Use New Relic or Datadog for APM
- Configure Uptime monitoring

## Maintenance

### Update Application
```bash
cd /var/www/lithovolt
sudo git pull
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo supervisorctl restart all
```

### Restart Services
```bash
# Django + Celery
sudo supervisorctl restart all

# Nginx
sudo systemctl restart nginx

# PostgreSQL
sudo systemctl restart postgresql

# Redis
sudo systemctl restart redis
```

## Security Checklist

- [x] Change default passwords
- [x] Configure firewall (ufw)
- [x] Setup fail2ban
- [x] Enable HTTPS
- [x] Regular security updates
- [x] Backup strategy
- [x] Monitor logs
- [x] Limit SSH access
- [x] Use strong SECRET_KEY
- [x] Disable DEBUG in production

## Troubleshooting

### 502 Bad Gateway
- Check Gunicorn is running: `sudo supervisorctl status`
- Check Gunicorn logs: `sudo tail -f /var/log/lithovolt-api.log`

### Database Connection Error
- Check PostgreSQL: `sudo systemctl status postgresql`
- Verify credentials in `.env`

### Static Files Not Loading
- Run collectstatic: `python manage.py collectstatic`
- Check Nginx configuration
- Verify file permissions

## Performance Optimization

1. **Database**:
   - Add indexes
   - Use connection pooling
   - Regular VACUUM

2. **Caching**:
   - Redis for session caching
   - Browser caching headers
   - CDN for static files

3. **Application**:
   - Optimize queries (select_related, prefetch_related)
   - Use pagination
   - Async tasks for heavy operations

## Scaling

### Horizontal Scaling
- Load balancer (Nginx/HAProxy)
- Multiple application servers
- Database replication
- Redis cluster

### Vertical Scaling
- Increase server resources
- Optimize database
- CDN for media files
