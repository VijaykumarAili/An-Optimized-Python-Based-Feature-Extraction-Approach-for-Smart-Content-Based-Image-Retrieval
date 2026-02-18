# ⚡ Quick Deployment Guide

## Fastest Way: Render + Vercel (15 minutes)

### Backend (Render)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Go to [Render Dashboard](https://dashboard.render.com/)**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Use these settings:
     - **Root Directory:** `cbir_backend`
     - **Build Command:** `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
     - **Start Command:** `gunicorn cbir_backend.wsgi:application --bind 0.0.0.0:$PORT`
   - Add environment variables:
     - `SECRET_KEY` (generate random key)
     - `DEBUG=False`
     - `ALLOWED_HOSTS=your-service-name.onrender.com`
   - Click "Create Web Service"
   - Wait for deployment (~5-10 min)
   - **Copy your backend URL** (e.g., `https://visionfind-backend.onrender.com`)

3. **Create superuser** (use Render Shell):
   ```bash
   cd cbir_backend
   python manage.py createsuperuser
   ```

### Frontend (Vercel)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure:
     - **Root Directory:** `frontend`
     - **Framework:** Vite (auto-detected)
   - Add environment variable:
     - `VITE_API_BASE_URL=https://your-backend-url.onrender.com`
   - Click "Deploy"
   - **Copy your frontend URL** (e.g., `https://visionfind.vercel.app`)

2. **Update Backend CORS**
   - Go back to Render dashboard
   - Add environment variable:
     - `CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app`
   - Redeploy backend

### ✅ Done!

Your app is now live:
- **Frontend:** `https://your-frontend-url.vercel.app`
- **Backend:** `https://your-backend-url.onrender.com`

---

## Need More Details?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Detailed step-by-step instructions
- Docker deployment
- Manual server setup
- Troubleshooting guide
- Environment variable reference

---

## Common Issues

**CORS Error?**
- Make sure `CORS_ALLOWED_ORIGINS` in Render includes your Vercel URL
- Use HTTPS URLs (not HTTP)

**Backend not starting?**
- Check Render logs
- Verify `SECRET_KEY` is set
- Check `ALLOWED_HOSTS` includes your Render domain

**Frontend can't connect?**
- Verify `VITE_API_BASE_URL` is set correctly
- Check backend is accessible (visit backend URL in browser)
- Check browser console for errors
