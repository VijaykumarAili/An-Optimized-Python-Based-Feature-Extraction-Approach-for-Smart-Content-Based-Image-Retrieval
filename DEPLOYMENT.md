# 🚀 Deployment Guide - VisionFind CBIR System

This guide covers multiple deployment options for your VisionFind project.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Option 1: Render (Backend) + Vercel (Frontend)](#option-1-render--vercel)
3. [Option 2: Docker Deployment](#option-2-docker-deployment)
4. [Option 3: Manual Server Deployment](#option-3-manual-server-deployment)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment Checklist](#post-deployment-checklist)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Git repository (GitHub, GitLab, or Bitbucket)
- ✅ Account on Render (for backend) or Vercel (for frontend)
- ✅ Domain name (optional but recommended)
- ✅ Python 3.11+ and Node.js 18+ installed locally (for testing)

---

## Option 1: Render + Vercel (Recommended)

This is the easiest deployment option, using managed services.

### Backend Deployment on Render

#### Step 1: Prepare Your Repository

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

#### Step 2: Create Render Web Service

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click "New +" → "Web Service"**
3. **Connect your repository**
4. **Configure the service:**

   - **Name:** `visionfind-backend` (or your preferred name)
   - **Environment:** `Python 3`
   - **Region:** Choose closest to your users
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** `cbir_backend`
   - **Build Command:**
     ```bash
     pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
     ```
   - **Start Command:**
     ```bash
     gunicorn cbir_backend.wsgi:application --bind 0.0.0.0:$PORT
     ```

#### Step 3: Configure Environment Variables

In Render dashboard, go to **Environment** tab and add:

```
SECRET_KEY=<generate-a-secure-random-key>
DEBUG=False
ALLOWED_HOSTS=visionfind-backend.onrender.com,your-custom-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
PYTHON_VERSION=3.11.0
```

**To generate SECRET_KEY:**
```python
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

#### Step 4: Update render.yaml (Optional)

Your `render.yaml` is already configured. If you want to customize it:

```yaml
services:
  - type: web
    name: visionfind-backend
    env: python
    buildCommand: pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
    startCommand: gunicorn cbir_backend.wsgi:application --bind 0.0.0.0:$PORT
    envVars:
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: False
      - key: ALLOWED_HOSTS
        value: visionfind-backend.onrender.com
      - key: PYTHON_VERSION
        value: 3.11.0
```

#### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy
3. Wait for deployment to complete (5-10 minutes)
4. Note your backend URL: `https://visionfind-backend.onrender.com`

#### Step 6: Create Superuser

After deployment, use Render's **Shell** feature:

```bash
cd cbir_backend
python manage.py createsuperuser
```

---

### Frontend Deployment on Vercel

#### Step 1: Prepare Frontend

1. **Ensure your frontend code is pushed to Git**

#### Step 2: Import to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "Add New..." → "Project"**
3. **Import your Git repository**
4. **Configure the project:**

   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

#### Step 3: Configure Environment Variables

In Vercel project settings → **Environment Variables**, add:

```
VITE_API_BASE_URL=https://visionfind-backend.onrender.com
```

**Important:** Add this for all environments (Production, Preview, Development)

#### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy automatically
3. Your frontend will be available at: `https://your-project.vercel.app`

#### Step 5: Update CORS Settings

After getting your frontend URL, update Render backend environment variables:

```
CORS_ALLOWED_ORIGINS=https://your-project.vercel.app
```

Then redeploy the backend.

---

## Option 2: Docker Deployment

### Prerequisites

- Docker installed
- Docker Compose (optional, for easier management)

### Step 1: Create Dockerfile for Backend

Create `cbir_backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD python manage.py migrate && gunicorn cbir_backend.wsgi:application --bind 0.0.0.0:8000
```

### Step 2: Build and Run Backend

```bash
cd cbir_backend
docker build -t visionfind-backend .
docker run -d \
  -p 8000:8000 \
  -e SECRET_KEY=your-secret-key \
  -e DEBUG=False \
  -e ALLOWED_HOSTS=* \
  -v $(pwd)/media:/app/media \
  visionfind-backend
```

### Step 3: Build Frontend

```bash
cd frontend
npm run build
```

### Step 4: Serve Frontend

You can use a simple HTTP server or nginx:

```bash
# Using Python
cd frontend/dist
python -m http.server 3000

# Or using nginx (create nginx.conf)
```

### Step 5: Docker Compose (Optional)

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  backend:
    build: ./cbir_backend
    ports:
      - "8000:8000"
    environment:
      - SECRET_KEY=${SECRET_KEY}
      - DEBUG=False
      - ALLOWED_HOSTS=*
    volumes:
      - ./cbir_backend/media:/app/media
      - ./cbir_backend/db.sqlite3:/app/db.sqlite3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - VITE_API_BASE_URL=http://backend:8000
    depends_on:
      - backend
```

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Run with:
```bash
docker-compose up -d
```

---

## Option 3: Manual Server Deployment

### Backend on Linux Server (Ubuntu/Debian)

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3.11 python3.11-venv python3-pip nginx git -y

# Install PostgreSQL (optional, better than SQLite for production)
sudo apt install postgresql postgresql-contrib -y
```

#### Step 2: Clone Repository

```bash
cd /var/www
sudo git clone <your-repo-url> visionfind
cd visionfind/cbir_backend
```

#### Step 3: Setup Virtual Environment

```bash
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

#### Step 4: Configure Django Settings

Update `settings.py`:

```python
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com', 'www.your-domain.com']
```

#### Step 5: Run Migrations

```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

#### Step 6: Setup Gunicorn Service

Create `/etc/systemd/system/visionfind.service`:

```ini
[Unit]
Description=VisionFind Gunicorn daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/visionfind/cbir_backend
ExecStart=/var/www/visionfind/cbir_backend/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/var/www/visionfind/cbir_backend/visionfind.sock \
    cbir_backend.wsgi:application

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl start visionfind
sudo systemctl enable visionfind
```

#### Step 7: Configure Nginx

Create `/etc/nginx/sites-available/visionfind`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/visionfind/cbir_backend/visionfind.sock;
    }

    location /static/ {
        alias /var/www/visionfind/cbir_backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/visionfind/cbir_backend/media/;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/visionfind /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 8: Setup SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Frontend on Same Server

#### Step 1: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Step 2: Build Frontend

```bash
cd /var/www/visionfind/frontend
npm install
npm run build
```

#### Step 3: Configure Nginx for Frontend

Update `/etc/nginx/sites-available/visionfind`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/visionfind/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        include proxy_params;
        proxy_pass http://unix:/var/www/visionfind/cbir_backend/visionfind.sock;
    }

    # Static files
    location /static/ {
        alias /var/www/visionfind/cbir_backend/staticfiles/;
    }

    # Media files
    location /media/ {
        alias /var/www/visionfind/cbir_backend/media/;
    }
}
```

---

## Environment Variables

### Backend (.env or Render Environment Variables)

```bash
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
DATABASE_URL=postgresql://user:pass@host:5432/dbname  # If using PostgreSQL
```

### Frontend (Vercel Environment Variables)

```bash
VITE_API_BASE_URL=https://your-backend-domain.com
```

---

## Post-Deployment Checklist

- [ ] Backend is accessible and responding
- [ ] Frontend can connect to backend API
- [ ] CORS is properly configured
- [ ] SSL/HTTPS is enabled
- [ ] Database migrations are applied
- [ ] Superuser account is created
- [ ] Static files are collected and served
- [ ] Media files directory has proper permissions
- [ ] Environment variables are set correctly
- [ ] Error logging is configured
- [ ] Backup strategy is in place

---

## Troubleshooting

### Backend Issues

**Problem: Build fails on Render**
- Check Python version matches (3.11)
- Verify all dependencies in requirements.txt
- Check build logs for specific errors

**Problem: 502 Bad Gateway**
- Check Gunicorn is running: `systemctl status visionfind`
- Check logs: `journalctl -u visionfind -f`
- Verify socket file permissions

**Problem: Static files not loading**
- Run `python manage.py collectstatic --noinput`
- Check STATIC_ROOT path in settings.py
- Verify nginx configuration

**Problem: CORS errors**
- Add frontend URL to CORS_ALLOWED_ORIGINS
- Check CORS middleware is enabled
- Verify environment variables are set

### Frontend Issues

**Problem: API calls fail**
- Verify VITE_API_BASE_URL is set correctly
- Check browser console for errors
- Verify backend is accessible from frontend domain

**Problem: Build fails**
- Check Node.js version (18+)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript/ESLint errors

**Problem: Blank page after deployment**
- Check browser console for errors
- Verify build output directory is correct
- Check Vite configuration

### Database Issues

**Problem: SQLite locked errors**
- Consider migrating to PostgreSQL for production
- Check file permissions on db.sqlite3
- Ensure only one process accesses database

**Problem: Migration errors**
- Run `python manage.py migrate --run-syncdb`
- Check database connection settings
- Verify database user permissions

---

## Important Notes

### Media Files Storage

⚠️ **Important:** Render's free tier has ephemeral storage. Uploaded images will be lost on restart.

**Solutions:**
1. Use external storage (AWS S3, Cloudinary, etc.)
2. Upgrade to Render paid plan with persistent storage
3. Use a separate file storage service

### Database Considerations

- **SQLite:** Good for development, not recommended for production
- **PostgreSQL:** Recommended for production (Render provides managed PostgreSQL)
- **Backup:** Set up regular database backups

### Performance Optimization

1. **Enable caching** (Redis/Memcached)
2. **Use CDN** for static/media files
3. **Optimize images** before upload
4. **Enable Gzip compression** in nginx
5. **Use database connection pooling**

---

## Support

For issues specific to:
- **Render:** [Render Documentation](https://render.com/docs)
- **Vercel:** [Vercel Documentation](https://vercel.com/docs)
- **Docker:** [Docker Documentation](https://docs.docker.com/)

---

**Happy Deploying! 🚀**
