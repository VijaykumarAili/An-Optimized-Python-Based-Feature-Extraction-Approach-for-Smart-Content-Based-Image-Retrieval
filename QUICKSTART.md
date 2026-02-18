# VisionFind - Quick Start Guide

## 🚀 Run the Application

### Terminal 1 - Backend
```bash
cd cbir_backend
python -m venv venv
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📍 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Swagger Docs**: http://localhost:8000/swagger/
- **Admin Panel**: http://localhost:8000/admin/

## ✅ First Steps

1. Open http://localhost:5173
2. Click "Register" to create an account
3. Go to "Upload" and add some images
4. Go to "Search" and find similar images!

## 🔑 Create Admin User

```bash
cd cbir_backend
python manage.py createsuperuser
# Follow prompts to create admin account
```

Then use the API to promote users:
```bash
POST /api/auth/promote/<user_id>/
```

## 🎯 Key Features to Test

1. **Image Upload** - Drag & drop images, see automatic processing
2. **Image Search** - Upload query image, get similarity results
3. **Profile** - View your uploaded images
4. **Admin Dashboard** - See system stats (if admin)
5. **Dark Mode** - Toggle theme in navbar

## 🐛 Common Issues

- **CLIP model download**: First run downloads ~300MB model
- **GPU not available**: System automatically uses CPU
- **CORS errors**: Check backend CORS settings match frontend URL

## 📚 Full Documentation

See `README.md` for complete documentation.

