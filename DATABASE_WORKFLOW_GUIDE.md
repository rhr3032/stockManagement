# 🚀 Complete Guide: Understanding Your POS Backend ↔️ Neon Database

## 📊 What Just Happened

Your database now contains:
- ✅ **2 Users** (Admin + Cashier)
- ✅ **4 Categories** (Beverages, Groceries, Electronics, Household)
- ✅ **3 Suppliers** (Global Beverages Inc, Fresh Farms Co, Tech World Ltd)
- ✅ **6 Products** (Coca Cola, Sprite, Rice, Milk, USB Drive, Soap)
- ✅ **3 Customers** (John Doe, Jane Smith, Bob Wilson)
- ✅ **4 Payment Methods** (Cash, Credit Card, Debit Card, PayPal)
- ✅ **1 Sample Invoice** (INV-001 with automatic stock deduction)
- ✅ **Audit Trail** (Stock logs showing inventory changes)

---

## 🔗 Architecture: How It All Connects

```
┌─────────────────────────────────────────────────────────────┐
│ Your Browser / Postman                                      │
│ (Makes HTTP requests)                                       │
└────────────────┬────────────────────────────────────────────┘
                 │ API Request
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ Next.js API Routes (localhost:3000/api/*)                   │
│ ├── /auth/login          - Authenticates users (JWT)        │
│ ├── /product/list        - Lists all products               │
│ ├── /invoice/create      - Creates invoices + stock update  │
│ ├── /customer/list       - Lists all customers              │
│ └── ... (34 endpoints total)                                │
└────────────────┬────────────────────────────────────────────┘
                 │ Database Query via Prisma
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ Prisma ORM                                                  │
│ (Handles database communication)                            │
│ prisma/schema.prisma defines 9 models                       │
└────────────────┬────────────────────────────────────────────┘
                 │ SQL Query
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ Neon PostgreSQL Database                                    │
│ Region: Singapore (AWS Asia Pacific 1)                      │
│ ├── users              (stores login info)                  │
│ ├── products           (inventory)                          │
│ ├── invoices           (sales transactions)                 │
│ ├── invoice_items      (line items)                         │
│ ├── stock_logs         (audit trail)                        │
│ ├── customers          (customer profiles)                  │
│ ├── categories         (product categories)                 │
│ ├── suppliers          (supplier info)                      │
│ ├── payment_methods    (payment options)                    │
│ └── shop_settings      (business config)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 TASK 2: Test Database Connection

### **Option 1: Use Prisma Studio (Visual GUI)**

```bash
npx prisma studio
```
- Opens at: http://localhost:5555
- You can browse all tables
- Edit data directly
- See relationships visually

### **Option 2: SQL Queries in Neon Console**

1. Go to: https://console.neon.tech
2. Click "SQL Editor"
3. Run these queries:

```sql
-- See all users
SELECT * FROM users;

-- See all products with categories
SELECT p.name, p.sku, p.stock_qty, c.name as category 
FROM products p 
JOIN categories c ON p.category_id = c.id;

-- See stock changes (audit trail)
SELECT * FROM stock_logs;

-- See invoices created
SELECT * FROM invoices;

-- Count data
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'Products', COUNT(*) FROM products
UNION ALL SELECT 'Invoices', COUNT(*) FROM invoices;
```

### **Option 3: Using Your API**

```bash
# Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pos.local","password":"admin123"}'

# Response:
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGc..."
  }
}

# List products using the token
curl http://localhost:3000/api/product/list \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 🔍 TASK 3: Understand a Specific API Endpoint

### **Example: Invoice Creation (Most Important)**

This is the CORE of your POS system. Let's trace what happens:

#### **1. Frontend sends POST request:**

```javascript
// From your React component
const response = await fetch('/api/invoice/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    customerId: 'customer_id_here', // Optional
    items: [
      {
        productId: 'cola_product_id',
        qty: 2,
        unitPrice: 2.5
      },
      {
        productId: 'rice_product_id',
        qty: 1,
        unitPrice: 18.5
      }
    ],
    subtotal: 23.5,
    discount: 0,
    vatTax: 1.65,
    paidAmount: 25.15,
    paymentMethodId: 'cash_method_id',
    notes: 'Customer sale'
  })
});
```

#### **2. API Route Processing (`app/api/invoice/create/route.ts`):**

```javascript
// Here's what the backend does:

// Step 1: Authenticate user
const user = await authenticateRequest(req);
if (!user) return unauthorizedResponse();

// Step 2: Validate items array
if (!items || items.length === 0) {
  return validationErrorResponse({items: 'At least one item required'});
}

// Step 3: Fetch all products
const products = await prisma.product.findMany({
  where: { id: { in: items.map(i => i.productId) } }
});

// Step 4: Check stock for each item
for (const item of items) {
  const product = products.find(p => p.id === item.productId);
  if (!product) {
    return notFoundResponse(`Product ${item.productId} not found`);
  }
  if (product.stockQty < item.qty) {
    return validationErrorResponse({
      stock: `Insufficient stock for ${product.name}`
    });
  }
}

// Step 5-9: DATABASE TRANSACTION (all-or-nothing)
const invoice = await prisma.$transaction(async (tx) => {
  // Create invoice header
  const invoiceMain = await tx.invoiceMain.create({
    data: {
      invoiceNo: `INV-${Date.now()}`,
      customerId,
      subtotal,
      discount,
      vatTax,
      grandTotal: subtotal + vatTax - discount,
      paidAmount,
      dueAmount: (subtotal + vatTax - discount) - paidAmount,
      paymentMethodId,
      soldByUserId: user.id,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          qty: item.qty,
          unitPrice: item.unitPrice,
          totalPrice: item.qty * item.unitPrice
        }))
      }
    }
  });

  // Update product stock for each item
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stockQty: { decrement: item.qty } }
    });

    // Create stock log entry
    await tx.stockLog.create({
      data: {
        productId: item.productId,
        type: 'SALE',
        qty: item.qty,
        referenceInvoiceId: invoiceMain.id,
        notes: `Sold via ${invoiceMain.invoiceNo}`,
        createdByUserId: user.id
      }
    });
  }

  // Update customer due balance (if not full payment)
  if (customerId) {
    const dueAmount = (subtotal + vatTax - discount) - paidAmount;
    if (dueAmount > 0) {
      await tx.customer.update({
        where: { id: customerId },
        data: { dueBalance: { increment: dueAmount } }
      });
    }
  }

  return invoiceMain;
});

// Return complete invoice
return successResponse(invoice);
```

#### **3. Database Changes (Neon PostgreSQL):**

**Before Invoice Creation:**
```sql
-- Product Stock
SELECT name, stock_qty FROM products WHERE sku IN ('COLA001', 'RICE001');
-- Coca Cola: 100 units
-- Rice: 50 units

-- Customer Due Balance
SELECT name, due_balance FROM customers WHERE id = 'john_doe_id';
-- John Doe: $0.00

-- Stock Audit Log (empty for this transaction)
SELECT COUNT(*) FROM stock_logs WHERE type = 'SALE';
-- 0 logs
```

**After Invoice Creation:**
```sql
-- Product Stock DECREASED
SELECT name, stock_qty FROM products WHERE sku IN ('COLA001', 'RICE001');
-- Coca Cola: 98 units (was 100, sold 2)
-- Rice: 49 units (was 50, sold 1)

-- Customer Due Balance UPDATED
SELECT name, due_balance FROM customers WHERE id = 'john_doe_id';
-- John Doe: $0.30 (if partial payment)

-- Stock Audit Log CREATED
SELECT * FROM stock_logs WHERE type = 'SALE';
-- 2 new entries (one per item)

-- Invoice Created
SELECT * FROM invoices WHERE invoice_no = 'INV-...' \G
-- invoice_id, customer_id, subtotal, paid, etc.

-- Invoice Items Created
SELECT * FROM invoice_items WHERE invoice_id = '...' \G
-- 2 items: 2x Coca Cola, 1x Rice
```

#### **4. Response Sent Back:**

```javascript
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "id": "invoice_xyz",
    "invoiceNo": "INV-001",
    "customerId": "john_doe",
    "subtotal": 23.5,
    "discount": 0,
    "vatTax": 1.65,
    "grandTotal": 25.15,
    "paidAmount": 25.15,
    "dueAmount": 0,
    "items": [
      {
        "productId": "cola_id",
        "qty": 2,
        "unitPrice": 2.5,
        "totalPrice": 5.0
      },
      {
        "productId": "rice_id",
        "qty": 1,
        "unitPrice": 18.5,
        "totalPrice": 18.5
      }
    ]
  }
}
```

---

## 📊 TASK 4: Seed Data Created

### **Database Content Summary:**

```
USERS TABLE
├── admin@pos.local (password: admin123)
│   └── Role: ADMIN
│   └── Can create products, manage settings, etc.
│
└── cashier@pos.local (password: cashier123)
    └── Role: CASHIER
    └── Can create invoices, view products, etc.

CATEGORIES TABLE
├── Beverages
├── Groceries
├── Electronics
└── Household

SUPPLIERS TABLE
├── Global Beverages Inc (supplies drinks)
├── Fresh Farms Co (supplies groceries)
└── Tech World Ltd (supplies electronics)

PRODUCTS TABLE (6 products)
├── Coca Cola 330ml
│   ├── SKU: COLA001
│   ├── Buy Price: $1.20
│   ├── Sell Price: $2.50
│   ├── Stock: 98 units (was 100, sold 2 in INV-001)
│   └── Category: Beverages, Supplier: Global Beverages Inc
│
├── Sprite 330ml (80 units, similar structure)
├── Jasmine Rice 5kg (49 units, sold 1 in INV-001)
├── Fresh Milk 1L (120 units)
├── USB Drive 32GB (30 units)
└── Laundry Soap Bar 500g (200 units)

PAYMENT_METHODS TABLE
├── Cash
├── Credit Card
├── Debit Card
└── PayPal

CUSTOMERS TABLE (3 customers)
├── John Doe
│   ├── Phone: +65 9111 2222
│   ├── Email: john@example.com
│   └── Due Balance: $0.00 (paid full INV-001)
│
├── Jane Smith
│   ├── Phone: +65 9333 4444
│   └── Due Balance: $0.00
│
└── Bob Wilson
    ├── Phone: +65 9555 6666
    └── Due Balance: $0.00

INVOICES TABLE (1 invoice - from seed)
├── Invoice No: INV-001
├── Customer: John Doe
├── Items: 2 Coca Cola @ $2.50, 1 Rice @ $18.50
├── Subtotal: $23.50
├── Tax: $1.65
├── Total: $25.15
├── Paid: Full payment
└── Timestamp: 2026-04-28

INVOICE_ITEMS TABLE (2 items)
├── Item 1: 2x Coca Cola @ $2.50
└── Item 2: 1x Rice @ $18.50

STOCK_LOGS TABLE (2 entries - audit trail)
├── Log 1: SALE, 2x Coca Cola, INV-001, timestamp
└── Log 2: SALE, 1x Rice, INV-001, timestamp

SHOP_SETTINGS TABLE
├── Shop Name: NUY's Store
├── Address: 123 Business Street, Singapore
├── Phone: +65 9123 4567
├── Invoice Prefix: INV
└── Footer: Thank you for your purchase!
```

---

## 🎯 How to Use This Setup

### **1. Test Login Endpoint**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pos.local",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "admin@pos.local",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Save the token for testing other endpoints!

### **2. List Products**

```bash
curl http://localhost:3000/api/product/list?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Shows all 6 products with stock levels.

### **3. Create an Invoice**

```bash
curl -X POST http://localhost:3000/api/invoice/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer_id",
    "items": [
      {
        "productId": "cola_product_id",
        "qty": 1,
        "unitPrice": 2.5
      }
    ],
    "subtotal": 2.5,
    "discount": 0,
    "vatTax": 0.175,
    "paidAmount": 2.675,
    "paymentMethodId": "cash_payment_id",
    "notes": "Test invoice"
  }'
```

Watch as:
- Stock decreases
- Stock log created
- Invoice saved
- Customer due balance updated

### **4. Check Dashboard Stats**

```bash
curl http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Returns all business metrics!

---

## 🔐 Database Connection Details

**Your Neon Database:**
- **Host:** ep-dawn-paper-ao9nkm11-pooler.c-2.ap-southeast-1.aws.neon.tech
- **Database:** neondb
- **User:** neondb_owner
- **Region:** Singapore (AWS Asia Pacific 1)
- **PostgreSQL Version:** 17
- **Status:** ✅ Active

**Connection in your code:**
```
prisma/lib.prisma
  ↓
DATABASE_URL from .env.local
  ↓
Neon PostgreSQL
```

---

## 📈 Monitor Your Database

1. **Neon Console:** https://console.neon.tech
   - See real-time metrics
   - Compute usage
   - Storage usage
   - Network transfer

2. **Prisma Studio:** `npx prisma studio`
   - Browse all tables
   - Edit records
   - View relationships

3. **SQL Queries:** In Neon SQL Editor
   - Run custom queries
   - Check specific data
   - Monitor performance

---

## 🚀 Next Steps

1. ✅ Database seeded with test data
2. ✅ Connection verified
3. ✅ Seed script created
4. **→ Start the development server:**

```bash
npm run dev
```

Server runs at: http://localhost:3000

5. **→ Test APIs with Postman or curl**
6. **→ Connect your React components**
7. **→ Start making invoices!**

---

## 💡 Key Concepts

| Concept | What It Does |
|---------|------------|
| **Prisma Schema** | Defines database structure (9 models) |
| **Migration** | Version control for database changes |
| **Transaction** | All-or-nothing database operation (invoice creation) |
| **Stock Log** | Audit trail of inventory changes |
| **JWT Token** | Proves user is authenticated (expires in 7 days) |
| **API Route** | Next.js endpoint that handles requests |
| **Seed Script** | Populates database with initial test data |

---

## ❓ Common Questions

**Q: Why did stock decrease by 2?**
A: In INV-001, we sold 2 Coca Cola (100 - 2 = 98)

**Q: Where's the audit trail?**
A: In stock_logs table - shows every inventory change

**Q: How is payment tracked?**
A: paid_amount vs due_amount in invoices, and customer.dueBalance

**Q: What if stock runs out?**
A: Invoice creation fails with "Insufficient stock" error - atomicity prevents any partial updates

**Q: Can I run multiple invoices at once?**
A: Yes! Each transaction is isolated and ensures data consistency

---

**Everything is now ready for development!** 🎉
