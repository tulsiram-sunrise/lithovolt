# Lithovolt Backend API

Django REST Framework backend for the Lithovolt Battery Management Platform.

## Architecture

- **Framework**: Django 5.0 + Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT (SimpleJWT)
- **Task Queue**: Celery + Redis
- **File Storage**: AWS S3 / Local storage

## Project Structure

```
backend/
├── config/              # Django project settings
├── apps/
│   ├── authentication/  # User auth, JWT, OTP
│   ├── users/          # User models and roles
│   ├── inventory/      # Battery models, serial numbers
│   ├── orders/         # Order management
│   ├── warranty/       # Warranty generation & tracking
│   └── notifications/  # Email, SMS, push notifications
├── core/               # Shared utilities, base classes
├── media/              # Uploaded files (local)
├── static/             # Static files
└── manage.py
```

## Apps Overview

### 1. Authentication (`apps/authentication/`)
- JWT token generation & refresh
- OTP-based login for consumers
- Password reset functionality
- Role-based access control

### 2. Users (`apps/users/`)
- Custom User model
- Admin, Wholesaler, Consumer roles
- Profile management
- Permissions & groups

### 3. Inventory (`apps/inventory/`)
- Battery model master
- Serial number generation & tracking
- Stock allocation to wholesalers
- Low stock alerts

### 4. Orders (`apps/orders/`)
- Order creation & tracking
- Order approval workflow
- Invoice generation
- Order history

### 5. Warranty (`apps/warranty/`)
- Warranty activation
- QR code generation
- PDF certificate generation
- Warranty verification (public endpoint)
- Expiry tracking

### 6. Notifications (`apps/notifications/`)
- Email notifications
- SMS notifications
- Push notifications (future)
- Notification templates

## Setup Instructions

### Prerequisites
- Python 3.11+
- PostgreSQL 14+
- Redis (for Celery)

### Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Create database:
```bash
createdb lithovolt_db
```

5. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create superuser:
```bash
python manage.py createsuperuser
```

7. Run development server:
```bash
python manage.py runserver
```

### Running Celery (for async tasks)

```bash
# Start Celery worker
celery -A config worker -l info

# Start Celery beat (for scheduled tasks)
celery -A config beat -l info
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/

## Key Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (email/password)
- `POST /api/auth/otp/send/` - Send OTP
- `POST /api/auth/otp/verify/` - Verify OTP
- `POST /api/auth/token/refresh/` - Refresh JWT token

### Inventory
- `GET/POST /api/inventory/models/` - Battery models
- `GET/POST /api/inventory/serials/` - Serial numbers
- `POST /api/inventory/allocate/` - Allocate stock to wholesaler

### Orders
- `GET/POST /api/orders/` - Order management
- `PATCH /api/orders/{id}/approve/` - Approve order
- `GET /api/orders/{id}/invoice/` - Download invoice

### Warranty
- `POST /api/warranty/activate/` - Activate warranty
- `GET /api/warranty/verify/{serial}/` - Public verification
- `GET /api/warranty/{id}/certificate/` - Download PDF

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=apps

# Run specific app tests
pytest apps/warranty/tests/
```

## Database Models

### Core Models
- **User**: Custom user with role field
- **BatteryModel**: Battery specifications
- **SerialNumber**: Unique battery identifier
- **StockAllocation**: Wholesaler inventory
- **Order**: Purchase orders
- **Warranty**: Warranty records
- **WarrantyClaim**: Claim tracking

## Development Workflow

1. Create feature branch
2. Write tests first (TDD)
3. Implement feature
4. Run tests and linters
5. Create pull request

## Code Quality

```bash
# Format code
black .

# Lint code
flake8 .

# Type checking (if using)
mypy .
```

## Deployment

See `docs/deployment.md` for production deployment instructions.

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

1. Follow Django best practices
2. Write tests for new features
3. Update documentation
4. Use meaningful commit messages

## License

Proprietary - Lithovolt Platform
