# 🧪 Quick Testing Guide - See Everything Work

## 🚀 Start the Server

```bash
npm run dev
```

Server runs at: **http://localhost:3000**

---

## 📝 Quick Reference: Test Credentials

```
Admin User:    admin@pos.local / admin123
Cashier User:  cashier@pos.local / cashier123
```

---

## 🔐 Step 1: Get Your Authentication Token

### **Via cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pos.local",
    "password": "admin123"
  }'
```

### **Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clq...",
      "email": "admin@pos.local",
      "name": "Admin User",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbHE..."
  }
}
```

**Save this token!** You'll use it for all other requests.

Set it as a variable:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📊 Step 2: List Products (See All 6 Products)

### **Request:**
```bash
curl "http://localhost:3000/api/product/list?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### **What You'll See:**

```json
{
  "success": true,
  "data": [
    {
      "id": "prod_cola",
      "name": "Coca Cola 330ml",
      "sku": "COLA001",
      "stockQty": 98,
      "salePrice": 2.5,
      "categoryName": "Beverages",
      "supplierName": "Global Beverages Inc"
    },
    {
      "id": "prod_rice",
      "name": "Jasmine Rice 5kg",
      "sku": "RICE001",
      "stockQty": 49,
      "salePrice": 18.5,
      "categoryName": "Groceries",
      "supplierName": "Fresh Farms Co"
    },
    ...
  ]
}
```

**Notice:** Coca Cola stock is **98** (was 100, sold 2 in INV-001)

---

## 👤 Step 3: List Customers

### **Request:**
```bash
curl "http://localhost:3000/api/customer/list?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### **What You'll See:**

```json
{
  "success": true,
  "data": [
    {
      "id": "cust_john",
      "name": "John Doe",
      "phone": "+65 9111 2222",
      "email": "john@example.com",
      "dueBalance": 0
    },
    {
      "id": "cust_jane",
      "name": "Jane Smith",
      "phone": "+65 9333 4444",
      "email": "jane@example.com",
      "dueBalance": 0
    },
    ...
  ]
}
```

---

## 🛒 Step 4: Create Your Own Invoice (See Stock Update!)

Get IDs first:

```bash
# Get a customer ID
CUSTOMER_ID="customer_id_from_previous_response"

# Get product IDs
COLA_ID="cola_product_id_from_product_list"
MILK_ID="milk_product_id_from_product_list"

# Get payment method ID
CASH_ID="cash_payment_method_id"
```

### **Create Invoice Request:**

```bash
curl -X POST http://localhost:3000/api/invoice/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "'"$CUSTOMER_ID"'",
    "items": [
      {
        "productId": "'"$COLA_ID"'",
        "qty": 3,
        "unitPrice": 2.5
      },
      {
        "productId": "'"$MILK_ID"'",
        "qty": 2,
        "unitPrice": 5.5
      }
    ],
    "subtotal": 18.5,
    "discount": 0,
    "vatTax": 1.295,
    "paidAmount": 19.795,
    "paymentMethodId": "'"$CASH_ID"'",
    "notes": "Customer purchase"
  }'
```

### **Response: Invoice Created!**

```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "id": "inv_xyz",
    "invoiceNo": "INV-1714337896123",
    "customerId": "cust_john",
    "subtotal": 18.5,
    "discount": 0,
    "vatTax": 1.295,
    "grandTotal": 19.795,
    "paidAmount": 19.795,
    "dueAmount": 0,
    "items": [
      {
        "qty": 3,
        "unitPrice": 2.5,
        "totalPrice": 7.5,
        "product": {
          "name": "Coca Cola 330ml",
          "sku": "COLA001"
        }
      },
      {
        "qty": 2,
        "unitPrice": 5.5,
        "totalPrice": 11,
        "product": {
          "name": "Fresh Milk 1L",
          "sku": "MILK001"
        }
      }
    ]
  }
}
```

---

## ✨ Step 5: See Stock DECREASED!

### **List Products Again:**

```bash
curl "http://localhost:3000/api/product/list?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### **Watch the Changes:**

```
BEFORE:
  Coca Cola: 98 units
  Fresh Milk: 120 units

AFTER:
  Coca Cola: 95 units (98 - 3 sold)
  Fresh Milk: 118 units (120 - 2 sold)
```

**✅ Stock automatically decreased!**

---

## 📊 Step 6: Check Dashboard Stats

### **Request:**

```bash
curl "http://localhost:3000/api/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN"
```

### **Response: Business Metrics!**

```json
{
  "success": true,
  "data": {
    "sales": {
      "today": 45.01,
      "todayInvoiceCount": 2,
      "thisMonth": 45.01
    },
    "inventory": {
      "totalProducts": 6,
      "lowStockCount": 0,
      "lowStockProducts": []
    },
    "customers": {
      "total": 3
    },
    "invoices": {
      "total": 2,
      "recent": [
        {
          "invoiceNo": "INV-1714337896123",
          "customerId": "cust_john",
          "grandTotal": 19.795,
          "createdAt": "2026-04-28T07:31:36.123Z"
        },
        {
          "invoiceNo": "INV-001",
          "grandTotal": 25.15,
          "createdAt": "2026-04-28T07:31:28.000Z"
        }
      ]
    }
  }
}
```

**See your sales metrics in real-time!**

---

## 🔍 Step 7: Check Invoice Details

### **Request:**

```bash
# Get the invoice ID from the create response
INVOICE_ID="inv_xyz_from_response"

curl "http://localhost:3000/api/invoice/$INVOICE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### **Response: Complete Invoice Data**

```json
{
  "success": true,
  "data": {
    "id": "inv_xyz",
    "invoiceNo": "INV-1714337896123",
    "customer": {
      "name": "John Doe",
      "phone": "+65 9111 2222"
    },
    "items": [...],
    "paymentMethod": "Cash",
    "soldByUser": {
      "name": "Admin User",
      "email": "admin@pos.local"
    },
    "createdAt": "2026-04-28T07:31:36.123Z"
  }
}
```

---

## 🖨️ Step 8: Get Printable Invoice

### **Request:**

```bash
curl "http://localhost:3000/api/invoice/print/$INVOICE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### **Response: Formatted for Printing**

```json
{
  "success": true,
  "data": {
    "shop": {
      "name": "NUY's Store",
      "address": "123 Business Street, Singapore",
      "phone": "+65 9123 4567",
      "footer": "Thank you for your purchase!"
    },
    "invoice": {
      "invoiceNo": "INV-1714337896123",
      "createdAt": "2026-04-28"
    },
    "customer": {
      "name": "John Doe",
      "phone": "+65 9111 2222"
    },
    "items": [
      {
        "product": "Coca Cola 330ml",
        "qty": 3,
        "unitPrice": 2.5,
        "tax": 0.525,
        "total": 7.5
      },
      {
        "product": "Fresh Milk 1L",
        "qty": 2,
        "unitPrice": 5.5,
        "tax": 0.77,
        "total": 11
      }
    ],
    "summary": {
      "subtotal": 18.5,
      "tax": 1.295,
      "total": 19.795,
      "paid": 19.795,
      "change": 0
    }
  }
}
```

**Perfect for thermal printer or A4 printing!**

---

## 🔎 Step 9: View Audit Trail (Stock Logs)

```bash
# Via Neon Console SQL
SELECT * FROM stock_logs 
WHERE type = 'SALE' 
ORDER BY created_at DESC;
```

### **Result:**

```
Log Entry 1: SALE, 3x Coca Cola, INV-1714337896123, 2026-04-28 07:31:36
Log Entry 2: SALE, 2x Fresh Milk, INV-1714337896123, 2026-04-28 07:31:36
Log Entry 3: SALE, 2x Coca Cola, INV-001, 2026-04-28 07:31:28
Log Entry 4: SALE, 1x Rice, INV-001, 2026-04-28 07:31:28
```

**Perfect for compliance and audit!**

---

## 🎯 All 34 API Endpoints at a Glance

### **Authentication (3)**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Get JWT token
- `GET /api/auth/me` - Get current user

### **Products (6)**
- `GET /api/product/list` - List all products
- `POST /api/product/create` - Create product (Admin only)
- `GET /api/product/[id]` - Get product details
- `PUT /api/product/[id]` - Update product
- `DELETE /api/product/[id]` - Delete product
- `GET /api/product/search?q=...` - Search products

### **Customers (6)**
- `GET /api/customer/list` - List customers
- `POST /api/customer/create` - Create customer
- `GET /api/customer/[id]` - Get customer
- `PUT /api/customer/[id]` - Update customer
- `DELETE /api/customer/[id]` - Delete customer
- `GET /api/customer/search?q=...` - Search customers

### **Suppliers (6)**
- `GET /api/supplier/list` - List suppliers
- `POST /api/supplier/create` - Create supplier (Admin)
- `GET /api/supplier/[id]` - Get supplier
- `PUT /api/supplier/[id]` - Update supplier
- `DELETE /api/supplier/[id]` - Delete supplier
- `GET /api/supplier/search?q=...` - Search suppliers

### **Categories (2)**
- `GET /api/category/list` - List categories
- `POST /api/category/create` - Create category (Admin)

### **Payment Methods (2)**
- `GET /api/payment-method/list` - List payment methods
- `POST /api/payment-method/create` - Create payment method (Admin)

### **Invoices (4)** ⭐
- `POST /api/invoice/create` - Create invoice with stock deduction
- `GET /api/invoice/list` - List invoices
- `GET /api/invoice/[id]` - Get invoice details
- `GET /api/invoice/print/[id]` - Get printable format

### **Dashboard (1)**
- `GET /api/dashboard/stats` - Get business metrics

### **Settings (1)**
- `GET /api/settings` - Get shop settings
- `PUT /api/settings` - Update shop settings

---

## 📱 Testing in Postman (Import These)

1. Download Postman: https://www.postman.com/downloads/
2. Create a new collection
3. Add these requests:

**Request 1: Login**
```
POST http://localhost:3000/api/auth/login
Body (JSON):
{
  "email": "admin@pos.local",
  "password": "admin123"
}
```

**Request 2: List Products**
```
GET http://localhost:3000/api/product/list?page=1&limit=20
Header: Authorization: Bearer {{token}}
```

**Request 3: Create Invoice**
```
POST http://localhost:3000/api/invoice/create
Header: Authorization: Bearer {{token}}
Body (JSON):
{
  "customerId": "...",
  "items": [{"productId": "...", "qty": 1, "unitPrice": 2.5}],
  "subtotal": 2.5,
  "discount": 0,
  "vatTax": 0.175,
  "paidAmount": 2.675,
  "paymentMethodId": "..."
}
```

---

## ✅ Verification Checklist

- [ ] Server running at http://localhost:3000
- [ ] Can login with admin@pos.local / admin123
- [ ] Can list products (6 total)
- [ ] Can list customers (3 total)
- [ ] Can create invoice and see stock decrease
- [ ] Can view invoice details
- [ ] Can see dashboard stats
- [ ] Audit trail in stock_logs table

---

## 🎉 You're All Set!

Your POS backend is **fully functional** and ready for frontend integration!

Next step: Connect your React components to these APIs using the integration guide.
