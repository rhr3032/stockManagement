# POS Backend Setup & Migration Guide

## Prerequisites
- Node.js 18+ installed
- Neon PostgreSQL account (https://console.neon.tech)
- Git for version control

## Step 1: Install Dependencies

```bash
npm install
# or
yarn install
```

This installs all required packages including:
- `@prisma/client` - ORM for database
- `prisma` - Migration CLI
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication

## Step 2: Set Up Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your values:

```env
# Get DATABASE_URL from Neon Console
# https://console.neon.tech → Project → Connection string
DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require"

# Generate a secure JWT secret
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-change-in-production"

# JWT expiration time
JWT_EXPIRATION="7d"
```

### Getting Neon DATABASE_URL:
1. Go to https://console.neon.tech
2. Create a new project or select existing
3. Click "Connection string" 
4. Copy the PostgreSQL connection string
5. Paste into `DATABASE_URL` in `.env.local`

## Step 3: Generate Prisma Client

```bash
npx prisma generate
```

## Step 4: Create Database Schema

Run migrations to create all tables:

```bash
npx prisma migrate deploy
```

Or for development with auto-migration:

```bash
npx prisma migrate dev --name init
```

## Step 5: Seed Initial Data (Optional)

Create a seed script `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth";

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const electronics = await prisma.category.create({
    data: { name: "Electronics" },
  });

  // Create payment methods
  await prisma.paymentMethod.createMany({
    data: [
      { name: "Cash" },
      { name: "Card" },
      { name: "Bkash" },
      { name: "Nagad" },
      { name: "Bank Transfer" },
    ],
  });

  // Create default admin user
  const adminPassword = await hashPassword("admin123");
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@pos.local",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Then run:
```bash
npx prisma db seed
```

## Step 6: Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

## Step 7: Test API Endpoints

Use Postman or cURL to test:

### 1. Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Cashier",
  "email": "cashier@pos.local",
  "password": "cashier123",
  "role": "CASHIER"
}
```

### 2. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@pos.local",
  "password": "admin123"
}
```

Response includes `token` - use for all subsequent requests:
```bash
Authorization: Bearer <your-token>
```

### 3. Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

### 4. Create Category
```bash
POST /api/category/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Groceries"
}
```

### 5. Create Product
```bash
POST /api/product/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Milk 1L",
  "categoryId": "category_id_here",
  "buyPrice": 50,
  "salePrice": 80,
  "stockQty": 100,
  "image": null
}
```

### 6. Create Customer
```bash
POST /api/customer/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Ahmed",
  "phone": "+88017123456",
  "email": "ahmed@email.com",
  "address": "Dhaka, Bangladesh"
}
```

### 7. Create Supplier
```bash
POST /api/supplier/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Best Foods Ltd",
  "phone": "+88016987654",
  "company": "Best Foods",
  "address": "Chittagong, Bangladesh"
}
```

### 8. Get Payment Methods
```bash
GET /api/payment-method/list
Authorization: Bearer <token>
```

### 9. Create Invoice
```bash
POST /api/invoice/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "customer_id_or_null",
  "items": [
    {
      "productId": "product_id_1",
      "qty": 2,
      "unitPrice": 80
    },
    {
      "productId": "product_id_2",
      "qty": 1,
      "unitPrice": 150
    }
  ],
  "subtotal": 310,
  "discount": 10,
  "vatTax": 15,
  "paidAmount": 315,
  "paymentMethodId": "payment_method_id",
  "notes": "Thank you for shopping"
}
```

### 10. Get Dashboard Stats
```bash
GET /api/dashboard/stats
Authorization: Bearer <token>
```

### 11. Get Printable Invoice
```bash
GET /api/invoice/print/invoice_id
Authorization: Bearer <token>
```

## Database Schema Overview

```
User (Admin/Cashier)
├── invoices (created by user)
└── stockLogs (created by user)

Product
├── Category
├── Supplier
└── invoiceItems

Customer
└── invoices

Invoice
├── InvoiceItem (line items)
├── Product (via items)
├── Customer
└── PaymentMethod

StockLog
├── Product
└── User

Category
└── Product

Supplier
└── Product

PaymentMethod
└── Invoice

ShopSettings (global)
```

## Common Operations

### Add Stock (Purchase)
```typescript
// Create stock adjustment entry
await prisma.stockLog.create({
  data: {
    productId: "product_id",
    type: "PURCHASE",
    qty: 50,
    notes: "Purchased from supplier ABC",
    createdByUserId: "user_id",
  },
});

// Update product stock
await prisma.product.update({
  where: { id: "product_id" },
  data: { stockQty: { increment: 50 } },
});
```

### Record Customer Payment
```typescript
await prisma.invoiceMain.update({
  where: { id: "invoice_id" },
  data: {
    paidAmount: { increment: 1000 },
    dueAmount: { decrement: 1000 },
  },
});
```

## Troubleshooting

### Connection Error
- Check DATABASE_URL format
- Ensure Neon project is active
- Verify IP whitelist (Neon allows all IPs by default)

### Migration Issues
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Create new migration
npx prisma migrate dev --name add_new_field
```

### Query Errors
- Always include `Authorization: Bearer <token>` header
- Verify JSON format matches schema
- Check all required fields are provided

## Production Deployment

1. **Set JWT_SECRET to strong random value**
2. **Use production DATABASE_URL** from Neon
3. **Enable Prisma query logging** for monitoring:
   ```typescript
   new PrismaClient({
     log: ["query", "error", "warn"],
   })
   ```
4. **Setup database backups** via Neon Console
5. **Configure CORS** for frontend domain
6. **Enable rate limiting** for API endpoints

## Next Steps

1. Connect frontend components to APIs
2. Implement loading/error states
3. Add toast notifications
4. Create user role-based UI
5. Setup invoice printing
6. Add backup/restore functionality

---

**Questions?** Check Neon docs: https://neon.tech/docs
