# Quick Setup Guide

## Backend Setup

1. **Navigate to backend:**
```bash
cd cbir_backend
```

2. **Create and activate virtual environment:**
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

**Note:** For GPU support, install PyTorch with CUDA:
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

4. **Run migrations:**
```bash
python manage.py migrate
```

5. **Create superuser (optional):**
```bash
python manage.py createsuperuser
```

6. **Run server:**
```bash
python manage.py runserver
```

Backend runs at: `http://localhost:8000`

## Frontend Setup

1. **Navigate to frontend:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create .env file:**
```bash
# Create .env file with:
VITE_API_BASE_URL=http://localhost:8000
```

4. **Run dev server:**
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

## First Run

1. Open `http://localhost:5173` in your browser
2. Register a new account
3. Upload some images
4. Search for similar images!

## Environment Variables

### Backend
Create `cbir_backend/.env`:
```
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend
Create `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:8000
```

## Troubleshooting

- **CLIP model download:** First run will download the model (~300MB)
- **GPU not detected:** System will use CPU automatically
- **CORS errors:** Check backend CORS settings and frontend API URL

