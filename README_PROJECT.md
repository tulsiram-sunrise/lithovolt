# Lithovolt Battery Management Platform

Enterprise-grade battery management system for manufacturers, wholesalers, and consumers.

## 🚀 Project Overview

Lithovolt is a comprehensive battery management platform that provides end-to-end tracking, warranty management, and sales intelligence for battery manufacturers. The system connects manufacturers, wholesalers/distributors, and end consumers through a unified digital platform.

## 📦 Project Structure

```
lithovolt/
├── backend/              # Django REST API
│   ├── apps/            # Django applications
│   ├── config/          # Project settings
│   ├── core/            # Shared utilities
│   └── requirements.txt
├── frontend/            # React web application
│   ├── src/            
│   │   ├── components/ 
│   │   ├── pages/      
│   │   └── services/   
│   └── package.json
├── mobile/              # React Native mobile app
│   ├── src/            
│   │   ├── screens/    
│   │   └── navigation/ 
│   └── package.json
├── docs/                # Documentation
├── development-guide/   # Development logs
└── plan-documents/      # Project requirements
```

## 🎯 Features

### Phase 1 (MVP) - Current
- ✅ Multi-role authentication (Admin, Wholesaler, Consumer)
- ✅ Battery model management
- ✅ Serial number generation & tracking
- ✅ Stock allocation system
- ✅ Order management workflow
- ✅ Warranty generation & verification
- ✅ QR code generation
- ✅ PDF certificate generation
- ✅ Admin dashboard & analytics
- ✅ Wholesaler portal (web + mobile)
- ✅ Consumer mobile app

### Phase 2 (Future)
- Payment gateway integration
- Advanced analytics & reports
- Warranty claim workflow
- Multi-warehouse support
- Demand forecasting
- CRM integration

## 🛠️ Technology Stack

### Backend
- **Framework**: Django 5.0 + Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT (SimpleJWT)
- **Task Queue**: Celery + Redis
- **File Storage**: AWS S3 / Local
- **Documentation**: drf-spectacular (OpenAPI/Swagger)

### Frontend (Web)
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand + TanStack Query
- **Styling**: TailwindCSS
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

### Mobile
- **Framework**: React Native + Expo
- **Navigation**: React Navigation
- **State Management**: Zustand
- **QR Scanner**: Expo Camera

## 🚦 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### Quick Start

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Configure .env with your settings
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend will run on http://localhost:8000

#### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend will run on http://localhost:3000

#### 3. Mobile Setup
```bash
cd mobile
npm install
npm start
```

Scan QR code with Expo Go app on your device

## 📚 Documentation

- [Backend README](backend/README.md) - Django API documentation
- [Frontend README](frontend/README.md) - React web app documentation
- [Mobile README](mobile/README.md) - React Native app documentation
- [API Documentation](http://localhost:8000/api/docs/) - Swagger UI (when backend is running)

## 🏗️ Architecture

### System Architecture
- **Client Layer**: Web (React) + Mobile (React Native)
- **API Layer**: Django REST Framework
- **Data Layer**: PostgreSQL
- **Storage**: Cloud storage for PDFs, QR codes
- **Queue**: Celery for async tasks

### Key Components
1. **Authentication Module**: JWT-based auth with OTP support
2. **Inventory Module**: Battery models, serial numbers, stock management
3. **Order Module**: Order creation, approval, tracking
4. **Warranty Module**: Activation, verification, certificate generation
5. **Notification Module**: Email, SMS, push notifications

## 👥 User Roles

### Admin
- Manage users (create wholesalers)
- Manage battery models & inventory
- Allocate stock to wholesalers
- Approve orders
- Monitor warranties
- View analytics & reports

### Wholesaler
- Place orders
- View allocated inventory
- Sell batteries
- Generate warranty certificates
- Track sales history
- Manage profile

### Consumer
- OTP-based login
- Register warranties (QR scan)
- View warranty details
- Download certificates
- Place orders
- Track orders

## 🔐 Security

- JWT token authentication
- Role-based access control (RBAC)
- Environment-based configuration
- HTTPS in production
- CORS protection
- SQL injection prevention (Django ORM)
- XSS protection

## 🧪 Testing

### Backend
```bash
cd backend
pytest
pytest --cov=apps
```

### Frontend
```bash
cd frontend
npm test
```

## 📈 Deployment

### Backend (Django)
- Gunicorn + Nginx
- PostgreSQL database
- Redis for caching
- AWS S3 for media files
- Ubuntu VPS / AWS EC2

### Frontend (React)
- Build: `npm run build`
- Deploy dist/ folder to:
  - Netlify
  - Vercel
  - AWS S3 + CloudFront
  - Nginx static hosting

### Mobile (React Native)
- Build APK/AAB for Android (Play Store)
- Build IPA for iOS (App Store)
- Use EAS Build (Expo Application Services)

## 🤝 Development Workflow

1. Create feature branch from `main`
2. Implement feature with tests
3. Run linters and tests
4. Create pull request
5. Code review
6. Merge to `main`
7. Deploy to staging
8. Test on staging
9. Deploy to production

## 📝 Environment Variables

### Backend (.env)
- `SECRET_KEY` - Django secret key
- `DEBUG` - Debug mode
- `DB_*` - Database credentials
- `AWS_*` - S3 credentials
- `EMAIL_*` - Email settings
- `TWILIO_*` - SMS settings

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

### Mobile (app.json extra)
- `apiUrl` - Backend API URL

## 🐛 Troubleshooting

### Backend Issues
- Database connection: Check PostgreSQL is running
- Migrations: Run `python manage.py migrate`
- Static files: Run `python manage.py collectstatic`

### Frontend Issues
- Build errors: Clear node_modules and reinstall
- API errors: Check CORS settings in backend

### Mobile Issues
- Metro bundler: Clear cache with `expo start -c`
- Build errors: Check Expo configuration

## 📊 Project Status

**Current Phase**: Phase 1 (MVP)
**Status**: Structure Created ✅
**Next Steps**: 
1. Complete remaining app implementations
2. Integration testing
3. UI/UX refinement
4. Deployment preparation

## 📞 Support

For development queries, refer to:
- Backend: Check Django logs
- Frontend: Check browser console
- Mobile: Check Expo logs

## 📄 License

Proprietary - Lithovolt Platform

---

**Built with ❤️ for battery manufacturers**
