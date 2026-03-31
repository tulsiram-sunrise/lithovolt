# CORE FEATURES - TESTING CHECKLIST
**Reference for sequential feature testing**  
**Date:** March 17, 2026

---

## FEATURE GROUP 1: WARRANTY CERTIFICATE MODULE

### Feature 1.1: Create Warranty Certificate
- [ ] User can access "Create Certificate" option
- [ ] Form accepts product details (battery model, serial, purchase date)
- [ ] Form accepts customer details (name, phone, email)
- [ ] Form validates all required fields
- [ ] Certificate ID auto-generates on submit
- [ ] API call succeeds (POST `/api/warranty/activate/`)

### Feature 1.2: Certificate Persistence & Retrieval
- [ ] Certificate stores in database
- [ ] User can view certificate from dashboard
- [ ] Certificate lists in user certificate history
- [ ] Can retrieve specific certificate by ID

### Feature 1.3: Certificate Download & Export
- [ ] Certificate downloads as PDF
- [ ] PDF contains all certificate details
- [ ] PDF is viewable/printable
- [ ] QR code embedded in PDF (for verification)

### Feature 1.4: Certificate Sharing
- [ ] Share option visible in UI
- [ ] Can share via email (async task)
- [ ] Can share via SMS (async task)
- [ ] Share notification sent to recipient

---

## FEATURE GROUP 2: WHOLESALER REGISTRATION MODULE

### Feature 2.1: Wholesaler Signup Form
- [ ] Form accessible from dashboard
- [ ] Fields: Business name, ABN/registration number, address, contact
- [ ] Form validates all required fields
- [ ] Optional document upload field present

### Feature 2.2: Document Upload
- [ ] File picker opens on "Upload Document" click
- [ ] Accepts PDFs, images, documents
- [ ] File uploads to storage (S3 or local)
- [ ] Upload confirmation message shown

### Feature 2.3: Verification Workflow
- [ ] Wholesaler form submits successfully
- [ ] Success message confirms submission
- [ ] Admin receives approval task
- [ ] Admin can approve/reject in admin panel
- [ ] User notified of approval status

### Feature 2.4: Wholesaler Dashboard Access
- [ ] After approval, wholesaler can access dealer dashboard
- [ ] Dashboard shows: allocated inventory, place orders, sales history
- [ ] Wholesaler role confirmed in database

---

## FEATURE GROUP 3: USER AUTHENTICATION & NAVIGATION

### Feature 3.1: Splash Screen
- [ ] Logo displays on app launch
- [ ] Login state auto-checks
- [ ] Routes to appropriate screen (login or dashboard)

### Feature 3.2: Login Screen
- [ ] Email/password inputs present
- [ ] Login button submits credentials
- [ ] Invalid credentials show error
- [ ] "Forgot Password" link works
- [ ] "Sign Up" link works

### Feature 3.3: User Roles & Navigation
- [ ] Consumer sees consumer dashboard
- [ ] Wholesaler sees wholesaler dashboard
- [ ] Admin sees admin dashboard
- [ ] Navigation bar/menu reflects role

---

## FEATURE GROUP 4: ADMIN DASHBOARD

### Feature 4.1: Customer Management
- [ ] View all customers (with pagination/search)
- [ ] View customer profile details
- [ ] View customer warranty certificates
- [ ] Edit/update customer info
- [ ] Disable/remove customer

### Feature 4.2: Product Management
- [ ] View all products/battery models
- [ ] Add new product
- [ ] Edit product details
- [ ] Delete product
- [ ] Filter by category (Automotive, Solar, Marine, Accessories)

### Feature 4.3: Seller/Wholesaler Management
- [ ] View all registered wholesalers
- [ ] View wholesaler approval status
- [ ] Approve/reject wholesaler registration
- [ ] View wholesaler allocation
- [ ] Add/remove wholesaler

### Feature 4.4: Inventory Management
- [ ] View total inventory
- [ ] View inventory by product/wholesaler
- [ ] Track stock allocation
- [ ] Low stock alerts
- [ ] Update stock quantities

### Feature 4.5: Order Management
- [ ] View all orders (with filters/search)
- [ ] View order details (items, customer, status)
- [ ] Approve/reject orders
- [ ] Update order status
- [ ] View order payment status

---

## FEATURE GROUP 5: API INTEGRATION (BACKEND VERIFICATION)

### Feature 5.1: Authentication API
- [ ] POST `/api/auth/login/` returns JWT token
- [ ] POST `/api/auth/register/` creates new user
- [ ] POST `/api/auth/otp/send/` initiates OTP
- [ ] POST `/api/auth/otp/verify/` validates OTP

### Feature 5.2: Warranty API
- [ ] POST `/api/warranty/activate/` creates certificate
- [ ] GET `/api/warranty/` lists user certificates
- [ ] GET `/api/warranty/{id}/` retrieves certificate details
- [ ] GET `/api/warranty/{id}/certificate/` downloads PDF

### Feature 5.3: User/Wholesaler API
- [ ] GET `/api/users/` lists users
- [ ] POST `/api/users/` creates wholesaler
- [ ] GET `/api/users/{id}/` retrieves user profile
- [ ] PATCH `/api/users/{id}/` updates profile

### Feature 5.4: Inventory API
- [ ] GET `/api/inventory/models/` lists products
- [ ] POST `/api/inventory/models/` creates product
- [ ] GET `/api/inventory/serials/` lists serial numbers
- [ ] POST `/api/inventory/allocate/` allocates to wholesaler

### Feature 5.5: Order API
- [ ] GET `/api/orders/` lists orders
- [ ] POST `/api/orders/` creates order
- [ ] PATCH `/api/orders/{id}/approve/` approves order
- [ ] GET `/api/orders/{id}/invoice/` downloads invoice

---

## FEATURE GROUP 6: MOBILE APP SPECIFIC

### Feature 6.1: Mobile Home & Navigation
- [ ] Bottom tab navigation visible (consumer)
- [ ] Drawer navigation visible (wholesaler)
- [ ] Screens accessible from navigation
- [ ] Proper back/forward navigation

### Feature 6.2: Mobile Certificate Creation
- [ ] Create certificate screen on mobile
- [ ] Product picker works (dropdown or search)
- [ ] Serial number lookup works
- [ ] Form submission on mobile
- [ ] Certificate preview on mobile

### Feature 6.3: Mobile QR Scanning
- [ ] Camera permission request
- [ ] QR code scanner opens
- [ ] Scans warranty QR code
- [ ] Retrieves warranty details
- [ ] Displays warranty information

### Feature 6.4: Mobile Ordering (Wholesaler)
- [ ] Wholesaler can browse products
- [ ] Can add items to cart
- [ ] Can place order
- [ ] Order confirmation shown
- [ ] Order history viewable

---

## FEATURE GROUP 7: WEB FRONTEND SPECIFIC

### Feature 7.1: Web Dashboard
- [ ] Responsive layout on desktop
- [ ] Sidebar navigation works
- [ ] Dashboard cards/widgets load
- [ ] Charts/analytics display (if applicable)

### Feature 7.2: Web Forms
- [ ] Certificate creation form on web
- [ ] Wholesaler registration form on web
- [ ] Admin management forms
- [ ] Form validation shows errors
- [ ] Form submission successful

### Feature 7.3: Web Data Display
- [ ] Tables load with data
- [ ] Pagination works
- [ ] Search/filter works
- [ ] Sorting works (if applicable)
- [ ] Data exports/downloads available

---

## TESTING PROTOCOL

**When user requests to test a feature:**

1. User specifies: `Test Feature X.Y: [Feature Name]`
2. I will:
   - Identify the feature from the checklist
   - Test each sub-item systematically
   - Check both API layer (backend) and UI layer (frontend/mobile)
   - Report pass/fail with specific evidence (file paths, API responses, screen captures if possible)
   - Identify any blockers or dependencies
   - Suggest fixes if failures found

3. I will log results in: `TEST_RESULTS.md` (accumulated per session)

---

## DEPENDENCIES TO TRACK

- **Django backend:** Required for Features 1.x, 2.x, 5.x
- **Laravel backend:** Alternative to Django (parallel implementation)
- **Frontend React app:** Required for Features 3.x, 7.x
- **Mobile React Native app:** Required for Features 6.x
- **Database:** PostgreSQL (configured)
- **Redis:** For async tasks/caching (configured)
- **Celery:** For notifications/sharing (partially set up)

---

**Status:** Ready for one-by-one feature testing.  
**Last Updated:** March 17, 2026

**Next Action:** User requests `Test Feature [Group].[Number]: [Name]`
