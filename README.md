# VisionFind - Content-Based Image Retrieval (CBIR) System

A complete, professional, deploy-ready full-stack web application for content-based image retrieval using deep learning.

## 🎯 Overview

VisionFind is an advanced Content-Based Image Retrieval system that leverages OpenAI's CLIP (Contrastive Language-Image Pre-training) model to extract deep feature vectors from images. These vectors are indexed using FAISS for fast similarity search, enabling users to find visually similar images from their collections in real-time.

## ✨ Features

### Core Functionality
- **Image Upload**: Drag-and-drop interface for seamless image management
- **Feature Extraction**: Automatic deep feature extraction using CLIP ViT-B/32
- **Similarity Search**: GPU-accelerated FAISS-based image-to-image search
- **Real-time Results**: Instant search results with similarity percentages

### User Features
- **JWT Authentication**: Secure user registration and login
- **Role-Based Access Control**: Admin and User roles with different permissions
- **Personal Image Collections**: Users can manage their own image libraries
- **Search History**: Track and analyze search queries

### Admin Features
- **System Dashboard**: Comprehensive statistics and analytics
- **User Management**: View all users and promote to admin
- **GPU Status Monitoring**: Real-time GPU availability and usage
- **System Metrics**: Total users, images, searches, and recent activity

### Technical Features
- **GPU Acceleration**: Automatic CUDA support when available, CPU fallback
- **RESTful API**: Complete API with Swagger documentation
- **Responsive Design**: Modern UI with dark/light mode
- **Smooth Animations**: Framer Motion for enhanced UX

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages  │  │Components│  │ Context  │  │   API    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                        │ HTTP/REST
┌───────────────────────▼──────────────────────────────────────┐
│                    Backend (Django)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   API    │  │  Users   │  │   Auth   │  │  Images  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              CLIP Feature Extraction                  │   │
│  │         (OpenAI CLIP ViT-B/32 → 512-dim vectors)     │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │              FAISS Vector Index                      │   │
│  │         (GPU-accelerated similarity search)          │   │
│  └──────────────────────┬───────────────────────────────┘   │
└─────────────────────────┼────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│                    SQLite3 Database                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  Users   │  │  Images   │  │  Search  │                 │
│  │          │  │  + Vectors│  │  History │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└──────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Django 5.0.1**: Web framework
- **Django REST Framework**: RESTful API
- **SimpleJWT**: JWT authentication
- **OpenAI CLIP**: Deep learning model for feature extraction
- **FAISS**: Vector similarity search (GPU/CPU)
- **PyTorch**: Deep learning framework
- **SQLite3**: Database
- **Pillow**: Image processing
- **drf-yasg**: Swagger API documentation

### Frontend
- **React 18**: UI library
- **Vite**: Build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client
- **React Toastify**: Toast notifications
- **Lucide React**: Icon library
- **React Dropzone**: File upload component

### Deployment
- **Render**: Backend hosting
- **Vercel**: Frontend hosting
- **Docker**: Containerization

## 📦 Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- CUDA-capable GPU (optional, for GPU acceleration)
- pip and npm

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd cbir_backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

**Note:** For GPU support, you may need to install PyTorch with CUDA separately:
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

6. **Run development server:**
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`
- API: `http://localhost:8000/api/`
- Swagger: `http://localhost:8000/swagger/`
- Admin: `http://localhost:8000/admin/`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp .env.example .env
```

Edit `.env` and set:
```
VITE_API_BASE_URL=http://localhost:8000
```

4. **Run development server:**
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🚀 Usage

### Getting Started

1. **Register an account:**
   - Navigate to `/register`
   - Fill in username, email, and password
   - Click "Create account"

2. **Upload images:**
   - Go to `/upload`
   - Drag and drop images or click to select
   - Images are automatically processed and features extracted

3. **Search for similar images:**
   - Go to `/search`
   - Upload a query image
   - View results with similarity percentages

4. **View your profile:**
   - Go to `/profile`
   - See all your uploaded images
   - Manage your collection

### Admin Features

1. **Access admin dashboard:**
   - Login as admin user
   - Navigate to `/admin`
   - View system statistics and metrics

2. **Promote users:**
   - Use API endpoint: `POST /api/auth/promote/<user_id>/`
   - Or use Django admin panel

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/auth/user/` - Get current user
- `POST /api/auth/promote/<id>/` - Promote user to admin (admin-only)

### Images
- `POST /api/images/upload/` - Upload image
- `GET /api/images/list/` - List user's images (all if admin)
- `DELETE /api/images/<id>/` - Delete image

### Search
- `POST /api/search/` - Search for similar images
  - Body: `image` (file), `top_k` (optional, default: 10)

### Statistics (Admin-only)
- `GET /api/stats/` - Get system statistics

### API Documentation
- Swagger UI: `http://localhost:8000/swagger/`
- ReDoc: `http://localhost:8000/redoc/`

## 🐳 Deployment

### Backend (Render)

1. **Create a new Web Service on Render**
2. **Connect your repository**
3. **Configure build settings:**
   - Build Command: `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
   - Start Command: `gunicorn cbir_backend.wsgi:application`
4. **Set environment variables:**
   - `SECRET_KEY`: Generate a secure key
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: Your Render domain
   - `CORS_ALLOWED_ORIGINS`: Your frontend URL

### Frontend (Vercel)

1. **Import your repository to Vercel**
2. **Set root directory to `frontend`**
3. **Configure environment variables:**
   - `VITE_API_BASE_URL`: Your backend API URL
4. **Deploy**

### Docker (Alternative)

**Backend:**
```bash
cd cbir_backend
docker build -t visionfind-backend .
docker run -p 8000:8000 visionfind-backend
```

## 📊 Demo Script

### Presentation Flow

1. **Introduction (Home Page)**
   - Show hero section with animated intro
   - Highlight key features

2. **Registration/Login**
   - Register a new user
   - Demonstrate JWT authentication

3. **Upload Images**
   - Upload multiple images
   - Show automatic feature extraction
   - Display uploaded images

4. **Image Search**
   - Upload a query image
   - Show loading state with GPU status
   - Display results with similarity scores
   - Highlight interactive image cards

5. **Admin Dashboard** (if admin)
   - Show system statistics
   - Display GPU status
   - Show user metrics and activity

6. **API Documentation**
   - Navigate to Swagger UI
   - Demonstrate API endpoints
   - Show authentication flow

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend (.env):**
```
VITE_API_BASE_URL=http://localhost:8000
```

### GPU Configuration

The system automatically detects and uses GPU if available. To verify:
- Check admin dashboard for GPU status
- GPU will be used for CLIP inference and FAISS search
- Falls back to CPU if GPU is unavailable

## 📝 Project Structure

```
finalpro/
├── cbir_backend/              # Django backend
│   ├── cbir_backend/          # Project settings
│   ├── users/                 # User authentication app
│   ├── api/                   # Image API app
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── render.yaml
│
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React contexts
│   │   ├── api/               # API client
│   │   ├── layouts/           # Layout components
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
└── README.md
```

## 🧪 Testing

### Backend
```bash
cd cbir_backend
python manage.py test
```

### Frontend
```bash
cd frontend
npm run test  # If test suite is configured
```

## 🐛 Troubleshooting

### Common Issues

1. **CLIP model not loading:**
   - Ensure PyTorch is installed correctly
   - Check internet connection (model downloads on first use)
   - Verify CUDA installation if using GPU

2. **FAISS GPU errors:**
   - System automatically falls back to CPU
   - Check GPU drivers and CUDA installation

3. **CORS errors:**
   - Verify `CORS_ALLOWED_ORIGINS` in settings
   - Check frontend `VITE_API_BASE_URL`

4. **Image upload fails:**
   - Check file size limits
   - Verify image format (JPEG, PNG, GIF, WebP)
   - Check media directory permissions

## 📄 License

This project is provided as-is for educational and demonstration purposes.

## 👥 Credits

- **OpenAI CLIP**: Feature extraction model
- **Facebook FAISS**: Vector similarity search
- **Django & React**: Web frameworks

## 🎯 Future Enhancements

- [ ] Batch image upload
- [ ] Image preview and editing
- [ ] Advanced search filters
- [ ] Export search results
- [ ] Cloud storage integration (Cloudinary)
- [ ] Real-time notifications
- [ ] Image tagging and categorization
- [ ] Multi-modal search (text + image)

---

**Built with ❤️ using Django, React, CLIP**

#   c o n t e n t - b a s e d - i m a g e - r e t r i e v a l - s y s y t e m  
 # content-based-image-retrieval-sysytem
#   c o n t e n t - b a s e d - i m a g e - r e t r i e v a l - s y s y t e m  
 #   c o n t e n t - b a s e d - i m a g e - r e t r i e v a l - s y s y t e m  
 #   c o n t e n t - b a s e d - i m a g e - r e t r i e v a l - s y s y t e m  
 