# Project Structure

## Complete Backend File Tree

```
stockManagement/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/
│   │   │   │   └── route.ts          # POST - User registration
│   │   │   ├── login/
│   │   │   │   └── route.ts          # POST - User login
│   │   │   └── me/
│   │   │       └── route.ts          # GET - Current user info
│   │   ├── product/
│   │   │   ├── list/
│   │   │   │   └── route.ts          # GET - List products (paginated)
│   │   │   ├── create/
│   │   │   │   └── route.ts          # POST - Create product (Admin)
│   │   │   ├── [id]/
│   │   │   │   └── route.ts          # GET/PUT/DELETE - Product detail
│   │   │   └── search/
│   │   │       └── route.ts          # GET - Search products
│   │   ├── customer/
│   │   │   ├── list/
│   │   │   │   └── route.ts          # GET - List customers
│   │   │   ├── create/
│   │   │   │   └── route.ts          # POST - Create customer
│   │   │   ├── [id]/
│   │   │   │   └── route.ts          # GET/PUT/DELETE - Customer detail
│   │   │   └── search/
│   │   │       └── route.ts          # GET - Search customers
│   │   ├── supplier/
│   │   │   ├── list/
│   │   │   │   └── route.ts          # GET - List suppliers
│   │   │   ├── create/
│   │   │   │   └── route.ts          # POST - Create supplier (Admin)
│   │   │   ├── [id]/
│   │   │   │   └── route.ts          # GET/PUT/DELETE - Supplier detail
│   │   │   └── search/
│   │   │       └── route.ts          # GET - Search suppliers
│   │   ├── category/
│   │   │   ├── list/
│   │   │   │   └── route.ts          # GET - List categories
│   │   │   └── create/
│   │   │       └── route.ts          # POST - Create category (Admin)
│   │   ├── payment-method/
│   │   │   ├── list/
│   │   │   │   └── route.ts          # GET - List payment methods
│   │   │   └── create/
│   │   │       └── route.ts          # POST - Create payment method
│   │   ├── invoice/
│   │   │   ├── create/
│   │   │   │   └── route.ts          # POST - Create invoice (CORE)
│   │   │   ├── list/
│   │   │   │   └── route.ts          # GET - List invoices
│   │   │   ├── [id]/
│   │   │   │   └── route.ts          # GET - Invoice detail
│   │   │   └── print/
│   │   │       └── [id]/
│   │   │           └── route.ts      # GET - Printable invoice data
│   │   ├── dashboard/
│   │   │   └── stats/
│   │   │       └── route.ts          # GET - Dashboard statistics
│   │   └── settings/
│   │       └── route.ts              # GET/PUT - Shop settings
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── manifest.ts
│   ├── customers/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── invoices/
│   │   └── page.tsx
│   ├── products/
│   │   └── page.tsx
│   ├── sales/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
├── components/
│   ├── dashboard/
│   │   └── sales-chart.tsx
│   ├── forms/
│   │   ├── barcode-scanner.tsx
│   │   ├── customer-form.tsx
│   │   ├── invoice-builder.tsx
│   │   └── product-form.tsx
│   ├── layout/
│   │   ├── app-shell.tsx
│   │   ├── keyboard-shortcuts.tsx
│   │   └── theme-init-script.tsx
│   ├── pwa/
│   │   ├── pwa-install-prompt.tsx
│   │   └── pwa-register.tsx
│   ├── receipt/
│   │   └── receipt-view.tsx
│   ├── screens/
│   │   ├── customers-screen.tsx
│   │   ├── dashboard-screen.tsx
│   │   ├── invoices-screen.tsx
│   │   ├── products-screen.tsx
│   │   ├── sales-screen.tsx
│   │   └── settings-screen.tsx
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── section-header.tsx
│       ├── select.tsx
│       └── textarea.tsx
├── hooks/
│   ├── useApi.ts                      # NEW - API calls with auth
│   ├── useLocalStorageState.ts
├── lib/
│   ├── auth.ts                        # NEW - JWT & password hashing
│   ├── api-response.ts                # NEW - Standardized API responses
│   ├── middleware.ts                  # NEW - Auth middleware
│   ├── prisma.ts                      # NEW - Prisma client singleton
│   ├── validation.ts                  # NEW - Form validation
│   ├── storage.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma                  # NEW - Complete database schema
├── store/
│   ├── useAuthStore.ts                # NEW - Auth state management
│   └── useStore.ts
├── types/
│   └── index.ts                       # Updated - Supplier type added
├── public/
│   └── sw.js
├── .env.example                       # NEW - Environment variables template
├── .env.local                         # (Create from .env.example)
├── BACKEND_SETUP.md                   # NEW - Setup & migration guide
├── API_REFERENCE.md                   # NEW - Complete API documentation
├── eslint.config.mjs
├── next.config.ts
├── package.json                       # Updated - Added Prisma deps
├── postcss.config.mjs
├── tsconfig.json
├── README.md
└── (other project files)

```

## Key Architecture

### Database Layer
- **prisma/schema.prisma** - Complete relational schema with 9 models
- **lib/prisma.ts** - Singleton client (prevents connection issues)

### Authentication Layer
- **lib/auth.ts** - JWT generation, password hashing
- **lib/middleware.ts** - Request authentication
- **store/useAuthStore.ts** - Frontend state management

### API Layer
- **app/api/** - 30+ REST endpoints
- **lib/api-response.ts** - Standardized responses
- **lib/validation.ts** - Input validation

### Frontend Integration
- **hooks/useApi.ts** - Reusable API hook
- **store/useAuthStore.ts** - Auth state
- **types/index.ts** - Shared types

---

## Data Models

### Users (Authentication)
```
User
├── id (string, primary key)
├── name (string)
├── email (string, unique)
├── password (string, hashed)
├── role (ADMIN | CASHIER)
├── active (boolean)
├── createdAt (datetime)
└── updatedAt (datetime)
```

### Products (Inventory)
```
Product
├── id (string, primary key)
├── name (string)
├── sku (string, unique, barcode)
├── categoryId (foreign key)
├── buyPrice (float)
├── salePrice (float)
├── stockQty (integer)
├── taxPercent (float)
├── image (string, optional)
├── status (string)
├── supplierId (foreign key, optional)
├── createdAt (datetime)
└── updatedAt (datetime)
```

### Categories
```
Category
├── id (string, primary key)
├── name (string, unique)
├── createdAt (datetime)
└── updatedAt (datetime)
```

### Customers
```
Customer
├── id (string, primary key)
├── name (string)
├── phone (string)
├── email (string, optional)
├── address (string, optional)
├── dueBalance (float)
├── createdAt (datetime)
└── updatedAt (datetime)
```

### Suppliers
```
Supplier
├── id (string, primary key)
├── name (string, unique)
├── phone (string)
├── company (string, optional)
├── address (string, optional)
├── createdAt (datetime)
└── updatedAt (datetime)
```

### Payment Methods
```
PaymentMethod
├── id (string, primary key)
├── name (string, unique)
├── active (boolean)
├── createdAt (datetime)
└── updatedAt (datetime)
```

### Invoices (Sales)
```
InvoiceMain
├── id (string, primary key)
├── invoiceNo (string, unique)
├── customerId (foreign key, optional)
├── subtotal (float)
├── discount (float)
├── vatTax (float)
├── grandTotal (float)
├── paidAmount (float)
├── dueAmount (float)
├── paymentMethodId (foreign key)
├── soldByUserId (foreign key)
├── notes (string, optional)
├── createdAt (datetime)
└── updatedAt (datetime)
```

### Invoice Items
```
InvoiceItem
├── id (string, primary key)
├── invoiceId (foreign key)
├── productId (foreign key)
├── qty (integer)
├── unitPrice (float)
├── totalPrice (float)
└── createdAt (datetime)
```

### Stock Logs (Audit Trail)
```
StockLog
├── id (string, primary key)
├── productId (foreign key)
├── type (SALE | PURCHASE | ADJUSTMENT | RETURN)
├── qty (integer, signed)
├── referenceInvoiceId (string, optional)
├── notes (string, optional)
├── createdByUserId (foreign key)
└── createdAt (datetime)
```

### Shop Settings
```
ShopSettings
├── id (string, primary key)
├── shopName (string)
├── address (string, optional)
├── phone (string, optional)
├── invoicePrefix (string, default: "INV")
├── logo (string, optional, URL or base64)
├── footerText (string, optional)
├── createdAt (datetime)
└── updatedAt (datetime)
```

---

## API Endpoints Summary

### Authentication (3)
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Products (5)
- GET /api/product/list
- POST /api/product/create
- GET /api/product/[id]
- PUT /api/product/[id]
- DELETE /api/product/[id]
- GET /api/product/search

### Customers (5)
- GET /api/customer/list
- POST /api/customer/create
- GET /api/customer/[id]
- PUT /api/customer/[id]
- DELETE /api/customer/[id]
- GET /api/customer/search

### Suppliers (5)
- GET /api/supplier/list
- POST /api/supplier/create
- GET /api/supplier/[id]
- PUT /api/supplier/[id]
- DELETE /api/supplier/[id]
- GET /api/supplier/search

### Categories (2)
- GET /api/category/list
- POST /api/category/create

### Payment Methods (2)
- GET /api/payment-method/list
- POST /api/payment-method/create

### Invoices (4) - CORE
- POST /api/invoice/create (with stock deduction)
- GET /api/invoice/list
- GET /api/invoice/[id]
- GET /api/invoice/print/[id]

### Dashboard (1)
- GET /api/dashboard/stats

### Settings (1)
- GET /api/settings
- PUT /api/settings

**Total: 34 endpoints**

---

## Key Features Implemented

✅ JWT-based authentication
✅ Role-based access control (Admin/Cashier)
✅ Complete CRUD for all entities
✅ Transaction-based invoice creation
✅ Automatic stock deduction
✅ Stock audit logging
✅ Customer due balance tracking
✅ Invoice number generation
✅ Printable invoice formatting
✅ Dashboard analytics
✅ Full-text search
✅ Pagination
✅ Input validation
✅ Error handling
✅ Neon PostgreSQL integration
✅ Prisma ORM with migrations

