# Lithovolt Frontend

React + Vite web application for Lithovolt Battery Management Platform.

## Features

- **Admin Panel**: Manage inventory, users, orders, and warranties
- **Wholesaler Portal**: Place orders, manage stock, generate warranties
- **Modern Stack**: React 18, Vite, TailwindCSS, React Query

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/       # Buttons, inputs, modals
│   │   ├── layout/       # Layout components
│   │   └── features/     # Feature-specific components
│   ├── pages/            # Page components
│   │   ├── admin/        # Admin pages
│   │   ├── wholesaler/   # Wholesaler pages
│   │   └── auth/         # Authentication pages
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   ├── store/            # State management (Zustand)
│   ├── utils/            # Utility functions
│   ├── constants/        # Constants and configs
│   ├── styles/           # Global styles
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── public/               # Static assets
└── package.json
```

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

Application will run on http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Key Technologies

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **React Hook Form** - Forms
- **Zod** - Schema validation
- **Recharts** - Data visualization

## Features by Role

### Admin
- Dashboard with analytics
- User management (create wholesalers)
- Battery model management
- Serial number generation
- Stock allocation
- Order approval
- Warranty oversight
- Reports and analytics

### Wholesaler
- Dashboard
- Place orders
- View allocated inventory
- Sell batteries
- Generate warranty certificates
- Sales history
- Profile management

## API Integration

API calls are configured in `src/services/api.js` with:
- Axios instance with interceptors
- JWT token management
- Error handling
- Request/response transformations

## Authentication Flow

1. User logs in → receives JWT tokens
2. Tokens stored in localStorage
3. Axios interceptor adds token to requests
4. On 401, redirect to login
5. Token refresh handled automatically

## Routing

- `/` - Landing/Login
- `/admin/*` - Admin routes (protected)
- `/wholesaler/*` - Wholesaler routes (protected)
- `/login` - Login page
- `/register` - Registration page

## State Management

### Server State (React Query)
- API data caching
- Background refetching
- Optimistic updates

### Client State (Zustand)
- Auth state
- UI state (modals, sidebar)
- User preferences

## Styling

- TailwindCSS for utility-first styling
- Custom theme in `tailwind.config.js`
- Global styles in `src/styles/index.css`

## Components

### Common Components
- Button, Input, Select, Checkbox
- Modal, Dialog, Dropdown
- Table, Pagination
- Loading, Error states
- Toast notifications

### Layout Components
- Navbar, Sidebar
- AdminLayout, WholesalerLayout
- AuthLayout

## Environment Variables

- `VITE_API_URL` - Backend API URL
- `VITE_APP_NAME` - Application name

## Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy dist/ folder to hosting
```

## Development Guidelines

1. Use functional components with hooks
2. Follow component naming conventions
3. Use absolute imports with @ alias
4. Write reusable components
5. Handle loading and error states
6. Use TypeScript (future enhancement)

## License

Proprietary - Lithovolt Platform
