# Admin UI Screens Documentation

## Overview

Created four comprehensive admin screens for managing roles, permissions, staff users, and warranty claims.

---

## 1. RolesPage Component

**Location:** `frontend/src/pages/admin/RolesPage.jsx`

**Purpose:** Manage staff roles (MANAGER, SUPPORT, SALES, TECH)

### Features
- **List Roles:** Table showing all roles with staff count and permission count
- **Create Role:** Modal form to create new role with name selection and description
- **Edit Role:** Update description and active status (name is immutable)
- **Delete Role:** Remove role with confirmation (prevents deletion if staff assigned)

### API Endpoints Used
- `GET /users/roles/` - Fetch all roles
- `POST /users/roles/` - Create new role
- `PATCH /users/roles/{id}/` - Update role
- `DELETE /users/roles/{id}/` - Delete role

### Validation
- Role name must be one of: MANAGER, SUPPORT, SALES, TECH
- Cannot delete role if staff members are assigned
- Active/inactive toggle for role visibility

### Table Columns
| Column | Type | Description |
|--------|------|-------------|
| Role Name | string | MANAGER, SUPPORT, SALES, or TECH |
| Description | string | Role purpose and details |
| Staff Count | number | Number of staff assigned to role |
| Permissions | number | Count of assigned permissions |
| Active | boolean | Whether role is available for assignment |
| Actions | buttons | Edit and Delete buttons |

---

## 2. PermissionsPage Component

**Location:** `frontend/src/pages/admin/PermissionsPage.jsx`

**Purpose:** Assign permissions to roles using interactive matrix

### Features
- **Role Selection:** Dropdown to select which role to manage permissions for
- **Permission Matrix:** Interactive table with:
  - Rows: 6 Resources (INVENTORY, ORDERS, WARRANTY_CLAIMS, USERS, REPORTS, SETTINGS)
  - Columns: 6 Actions (VIEW, CREATE, UPDATE, DELETE, APPROVE, ASSIGN)
  - Checkboxes: Toggle permission for each resource-action combination
- **Real-time Updates:** Permissions saved immediately on checkbox change
- **Summary:** Display selected permissions as tags below matrix

### API Endpoints Used
- `GET /users/roles/` - Fetch all roles
- `GET /users/permissions/?role={id}` - Get permissions for selected role
- `POST /users/permissions/` - Create permission
- `DELETE /users/permissions/{id}/` - Delete permission

### Permission Matrix
```
         VIEW  CREATE  UPDATE  DELETE  APPROVE  ASSIGN
INVENTORY      [✓]    [✓]     [✓]            
ORDERS    [✓]                 [✓]
WARRANTY  [✓]                                [✓]    [✓]
USERS     [✓]  [✓]    [✓]     [✓]
REPORTS   [✓]
SETTINGS            [✓]        [✓]
```

### Resource Definitions
- **INVENTORY:** Manage battery models, accessories, products, serial numbers
- **ORDERS:** Place, view, manage orders
- **WARRANTY_CLAIMS:** View, assign, approve/reject, resolve warranty claims
- **USERS:** Manage user accounts and profiles
- **REPORTS:** Generate and view analytics reports
- **SETTINGS:** Configure system settings

### Action Definitions
- **VIEW:** Read/list access
- **CREATE:** New record creation
- **UPDATE:** Edit existing records
- **DELETE:** Remove records
- **APPROVE:** Accept/reject decisions (used for claims)
- **ASSIGN:** Assign items to users/staff (used for claims)

---

## 3. StaffPage Component

**Location:** `frontend/src/pages/admin/StaffPage.jsx`

**Purpose:** Create and manage staff user assignments

### Features
- **List Staff:** Table showing all active and inactive staff
- **Create Staff:** Modal to:
  - Select admin user to convert to staff
  - Assign role (MANAGER, SUPPORT, SALES, TECH)
  - Set optional supervisor (another staff member)
  - Set hire date
  - Toggle active status
- **Edit Staff:** Update role, supervisor, hire date, and active status
- **Deactivate Staff:** Toggle is_active without deleting

### API Endpoints Used
- `GET /users/staff/` - Fetch all staff users
- `GET /users/` - Fetch available users (filtered to ADMIN only)
- `GET /users/roles/` - Fetch available roles
- `POST /users/staff/` - Create staff profile
- `PATCH /users/staff/{id}/` - Update staff profile
- `DELETE /users/staff/{id}/` - Delete staff profile

### Validation Rules
- Only ADMIN users can be assigned as staff
- Supervisor must be another admin or staff user
- One-to-one relationship: User can only be assigned once
- Supervisor cannot create circular dependencies

### Table Columns
| Column | Type | Description |
|--------|------|-------------|
| User | string | Staff member name |
| Email | email | User email address |
| Role | string | Assigned role |
| Supervisor | string | Reporting manager |
| Hired | date | Hire date |
| Active | boolean | Is staff active |
| Actions | buttons | Edit and Delete |

### Staff Profile Fields
- User ID (immutable after creation)
- Role (MANAGER, SUPPORT, SALES, TECH)
- Supervisor (optional, allows hierarchy)
- Hire Date (YYYY-MM-DD)
- Active Status (true/false)

---

## 4. WarrantyClaimsPage Component

**Location:** `frontend/src/pages/admin/WarrantyClaimsPage.jsx`

**Purpose:** Manage warranty claims through approval workflow

### Features
- **Filter by Status:** Dropdown to view claims by status (PENDING, UNDER_REVIEW, APPROVED, REJECTED, RESOLVED)
- **List Claims:** Table showing all claims with quick action buttons
- **View Details:** Drawer showing full claim details including:
  - Claim and warranty information
  - Consumer details
  - All status history with transitions
  - Notes at each stage
- **Workflow Actions:**
  - **Assign:** Select staff member to review claim (PENDING → UNDER_REVIEW)
  - **Approve:** Confirm claim is valid (UNDER_REVIEW → APPROVED)
  - **Reject:** Deny claim with reason (UNDER_REVIEW → REJECTED)
  - **Resolve:** Complete claim after approval/rejection (→ RESOLVED)

### API Endpoints Used
- `GET /warranty/claims/` - Fetch all claims
- `GET /warranty/claims/?status={status}` - Filter by status
- `GET /warranty/claims/{id}/` - Get claim details
- `POST /warranty/claims/{id}/assign/` - Assign to staff
- `POST /warranty/claims/{id}/approve/` - Approve claim
- `POST /warranty/claims/{id}/reject/` - Reject claim
- `POST /warranty/claims/{id}/resolve/` - Resolve claim
- `GET /users/staff/` - Get staff for assignment dropdown

### Workflow States

```
PENDING (initial)
  ↓
  └─→ [Assign to Staff]
      ↓
  UNDER_REVIEW
      ├─→ [Approve] → APPROVED
      └─→ [Reject]  → REJECTED
           ↓
       [Resolve]
           ↓
       RESOLVED (final)
```

### Table Columns
| Column | Type | Description |
|--------|------|-------------|
| Claim ID | number | Unique claim identifier |
| Warranty | number | Associated warranty ID |
| Consumer | string | Consumer name |
| Status | tag | Color-coded status |
| Assigned To | string | Staff member reviewing |
| Submitted | date | Claim creation date |
| Actions | buttons | View, Assign, Approve, Reject, Resolve |

### Status Colors
- PENDING: Gray default
- UNDER_REVIEW: Blue processing
- APPROVED: Green success
- REJECTED: Red error
- RESOLVED: Cyan/teal

### Drawer Details
Shows when "View" is clicked:
- Warranty information
- Consumer contact details
- Full claim description
- Current status and assignment
- Review notes from all stakeholders
- Complete status history (Timeline view)
- Timestamps for each transition

### Action Modals

**Assign Modal**
- Select staff member from dropdown (staff from /users/staff/)
- Optional assignment notes
- Transitions claim to UNDER_REVIEW

**Approve Modal**
- Optional approval notes
- Transitions claim to APPROVED

**Reject Modal**
- Required rejection reason
- Transitions claim to REJECTED
- Reason becomes review_notes

**Resolve Modal**
- Optional resolution notes
- Transitions claim to RESOLVED
- Can be used after APPROVED or REJECTED

---

## Integration with Backend

### Required Endpoints
All admin pages depend on these API endpoints being available:

**Role Endpoints** (from `users/views.py`)
- `GET /api/users/roles/` - List all roles
- `POST /api/users/roles/` - Create role
- `PATCH /api/users/roles/{id}/` - Update role
- `DELETE /api/users/roles/{id}/` - Delete role

**Permission Endpoints** (from `users/views.py`)
- `GET /api/users/permissions/` - List permissions
- `GET /api/users/permissions/?role={id}` - Filter by role
- `POST /api/users/permissions/` - Create permission
- `DELETE /api/users/permissions/{id}/` - Delete permission

**Staff Endpoints** (from `users/views.py`)
- `GET /api/users/staff/` - List staff
- `POST /api/users/staff/` - Create staff profile
- `PATCH /api/users/staff/{id}/` - Update staff
- `DELETE /api/users/staff/{id}/` - Delete staff

**Warranty Endpoints** (from `warranty/views.py`)
- `GET /api/warranty/claims/` - List claims
- `GET /api/warranty/claims/?status={status}` - Filter by status
- `POST /api/warranty/claims/{id}/assign/` - Assign claim
- `POST /api/warranty/claims/{id}/approve/` - Approve claim
- `POST /api/warranty/claims/{id}/reject/` - Reject claim
- `POST /api/warranty/claims/{id}/resolve/` - Resolve claim

**User Endpoints** (from `authentication/views.py`)
- `GET /api/users/` - List users

### Permission Requirements
All admin screens require `IsAdmin` permission:
- Accessing `/api/users/roles/`
- Accessing `/api/users/permissions/`
- Accessing `/api/users/staff/`
- Accessing `/api/warranty/claims/`

### Error Handling
Each page includes error handling for:
- Network failures (displays message toast)
- Permission denied (403)
- Invalid data (400)
- Server errors (500)
- Duplicate resource creation

---

## Usage Flow

### Creating a New Staff Role with Permissions

1. **RolesPage**
   - Click "Create Role"
   - Select role name: MANAGER
   - Enter description
   - Click OK

2. **PermissionsPage**
   - Select newly created MANAGER role
   - Check permissions in matrix:
     - INVENTORY: VIEW, CREATE, UPDATE
     - WARRANTY_CLAIMS: APPROVE, ASSIGN
   - Permissions auto-save on check/uncheck

3. **StaffPage**
   - Click "Add Staff User"
   - Select admin user
   - Select MANAGER role
   - Set hire date and supervisor (if needed)
   - Click OK

### Approving a Warranty Claim

1. **WarrantyClaimsPage**
   - Filter by PENDING status
   - Click "Assign" on claim
   - Select staff member (MANAGER/SUPPORT role with WARRANTY_CLAIMS:APPROVE)
   - Add notes
   - Click OK (transitions to UNDER_REVIEW)

2. Staff reviews claim
   - Admin clicks "View" to see details
   - Adds approval/rejection notes
   - Clicks "Approve" or "Reject"

3. Final resolution
   - Once approved/rejected, click "Resolve"
   - Add resolution notes
   - Claim moves to RESOLVED state

---

## Frontend Dependencies

These pages use:
- **React Query (@tanstack/react-query)** - API state management
- **Ant Design (antd)** - UI components
  - Table, Button, Modal, Select, Input, Tag, Drawer, Timeline
  - Icons: PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckOutlined, CloseOutlined
- **Custom API Service** (`services/api`)

---

## Testing the Workflow

Run the end-to-end test:
```bash
./test_e2e.sh
```

Or directly:
```bash
cd backend
python manage.py shell < test_role_permission_workflow.py
```

This test:
1. Creates roles (MANAGER, SUPPORT, SALES)
2. Assigns permissions to MANAGER
3. Creates staff user with MANAGER role
4. Tests permission checking
5. Creates warranty and processes it through full workflow:
   - PENDING → UNDER_REVIEW (assign)
   - UNDER_REVIEW → APPROVED (approve)
   - APPROVED → RESOLVED (resolve)
6. Verifies status history is recorded
7. Tests invalid transitions (should fail safely)

---

## Future Enhancements

1. **Bulk Operations**
   - Bulk assign permissions to role
   - Bulk permission import/export

2. **Advanced Filtering**
   - Search staff by email
   - Filter claims by date range
   - Advanced claim search criteria

3. **Analytics**
   - Claim approval rate by staff
   - Average resolution time
   - Permission usage heatmap

4. **Notifications**
   - Toast notifications on action success
   - Email notifications for claim assignments
   - Digest notifications for pending claims

5. **Mobile Views**
   - Mobile-optimized staff dashboard
   - Mobile claim review interface
   - QR code scanning for claims

---

## API Response Examples

### Role List
```json
[
  {
    "id": 1,
    "name": "MANAGER",
    "description": "Management staff role",
    "is_active": true,
    "staff_count": 3,
    "permissions": [
      {
        "id": 1,
        "resource": "INVENTORY",
        "action": "VIEW",
        "description": "View inventory"
      }
    ],
    "created_at": "2026-02-19T10:00:00Z"
  }
]
```

### Staff User Detail
```json
{
  "id": 1,
  "user_id": 5,
  "user_name": "John Manager",
  "user_email": "john@example.com",
  "role_id": 1,
  "role_name": "MANAGER",
  "supervisor_id": null,
  "supervisor_name": null,
  "hire_date": "2026-01-15",
  "is_active": true,
  "created_at": "2026-02-19T10:00:00Z"
}
```

### Warranty Claim Detail
```json
{
  "id": 42,
  "warranty_id": 10,
  "consumer_id": 5,
  "consumer": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  },
  "description": "Battery not charging",
  "status": "UNDER_REVIEW",
  "status_display": "Under Review",
  "assigned_to": 7,
  "assigned_to_name": "Manager John",
  "reviewed_by": null,
  "reviewed_by_name": null,
  "review_notes": "Investigating...",
  "status_history": [
    {
      "from_status": "PENDING",
      "to_status": "UNDER_REVIEW",
      "changed_by": 7,
      "notes": "Assigned for review",
      "created_at": "2026-02-19T11:30:00Z"
    }
  ],
  "created_at": "2026-02-19T10:00:00Z",
  "resolution_date": null
}
```
