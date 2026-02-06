# Quick Start Guide - Lithovolt Platform

## 🚀 Get Started in 5 Minutes

### Prerequisites Check
```bash
# Python version (should be 3.11+)
python --version

# Node.js version (should be 18+)
node --version

# PostgreSQL (should be installed)
psql --version

# Git (should be installed)
git --version
```

---

## 📦 Installation Steps

### 1. Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux

# Create database (open another terminal)
createdb lithovolt_db

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser
# Enter: email, password

# Start server
python manage.py runserver
```

✅ Backend running at: http://localhost:8000  
✅ Admin panel: http://localhost:8000/admin  
✅ API Docs: http://localhost:8000/api/docs

---

### 2. Frontend Setup (3 minutes)

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux

# Start development server
npm run dev
```

✅ Frontend running at: http://localhost:3000

---

### 3. Mobile Setup (3 minutes)

```bash
# Open new terminal
cd mobile

# Install dependencies
npm install

# Install Expo CLI globally (if not installed)
npm install -g expo-cli

# Start Expo
npm start
```

✅ Scan QR code with Expo Go app on your phone

---

## 🎯 First Steps

### 1. Access Admin Panel
1. Go to http://localhost:8000/admin
2. Login with superuser credentials
3. Create a test wholesaler user

### 2. Test API
1. Go to http://localhost:8000/api/docs
2. Try the /api/auth/login/ endpoint
3. Use the token for other requests

### 3. Test Frontend
1. Go to http://localhost:3000/login
2. Login with admin or wholesaler credentials
3. Explore the dashboard

---

## 🛠️ Common Issues & Solutions

### Issue: Port already in use
```bash
# Kill process on port 8000 (backend)
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

### Issue: Database connection error
```bash
# Start PostgreSQL
# Windows: Start PostgreSQL service
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Issue: Module not found
```bash
# Backend:
pip install -r requirements.txt

# Frontend/Mobile:
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Development Workflow

### Daily Workflow
```bash
# 1. Pull latest changes
git pull origin main

# 2. Activate backend
cd backend
venv\Scripts\activate
python manage.py runserver

# 3. Start frontend (new terminal)
cd frontend
npm run dev

# 4. Make changes and test

# 5. Commit changes
git add .
git commit -m "Your message"
git push
```

---

## 📚 Important URLs

| Service | URL | Description |
|---------|-----|-------------|
| Backend API | http://localhost:8000 | Django REST API |
| API Docs | http://localhost:8000/api/docs | Swagger UI |
| Admin Panel | http://localhost:8000/admin | Django Admin |
| Frontend | http://localhost:3000 | React Web App |
| Mobile | Expo Go App | React Native App |

---

## 🔑 Default Credentials

### Admin User
- Create using: `python manage.py createsuperuser`
- Role: ADMIN

### Test Wholesaler (create in admin panel)
- Email: wholesaler@test.com
- Password: (set in admin)
- Role: WHOLESALER

### Test Consumer (create via OTP)
- Use mobile app to register
- Role: CONSUMER

---

## 📖 Next Steps

1. ✅ Setup complete!
2. Read [Development Guide](development-guide/2026-02-03_project-structure-setup.md)
3. Check [Backend README](backend/README.md)
4. Check [Frontend README](frontend/README.md)
5. Check [Mobile README](mobile/README.md)
6. Review [Deployment Guide](docs/DEPLOYMENT.md)

---

## 🆘 Need Help?

### Backend Issues
- Check Django logs in terminal
- Visit: http://localhost:8000/admin
- Run: `python manage.py check`

### Frontend Issues
- Check browser console (F12)
- Check terminal for errors
- Clear browser cache

### Mobile Issues
- Check Expo terminal
- Run: `expo start -c` (clear cache)
- Check device connection

---

## 🎉 You're Ready!

Project structure is complete and ready for development.

**What's implemented:**
- ✅ Backend API structure
- ✅ Frontend web app structure
- ✅ Mobile app structure
- ✅ Authentication system
- ✅ User management
- ✅ Documentation

**What's next (TODO):**
- ⚠️ Complete Inventory models
- ⚠️ Complete Order models
- ⚠️ Complete Warranty models
- ⚠️ Implement frontend pages
- ⚠️ Implement mobile screens

**Happy Coding! 🚀**
