# Complete API Reference

## Authentication

All endpoints (except `/api/auth/register` and `/api/auth/login`) require the `Authorization: Bearer <token>` header.

### Register User
**POST** `/api/auth/register`

Request:
```json
{
  "name": "John Doe",
  "email": "john@pos.local",
  "password": "secure123",
  "role": "CASHIER"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@pos.local",
      "role": "CASHIER"
    },
    "token": "eyJhbGc..."
  },
  "message": "User registered successfully"
}
```

### Login
**POST** `/api/auth/login`

Request:
```json
{
  "email": "john@pos.local",
  "password": "secure123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@pos.local",
      "role": "CASHIER"
    },
    "token": "eyJhbGc..."
  },
  "message": "Login successful"
}
```

### Get Current User
**GET** `/api/auth/me`

Response:
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@pos.local",
    "role": "CASHIER",
    "active": true
  },
  "message": "Current user fetched"
}
```

---

## Products

### List Products
**GET** `/api/product/list?page=1&limit=20`

Response:
```json
{
  "success": true,
  "data": {
      "products": [
      {
        "id": "prod_1",
        "name": "Milk 1L",
        "buyPrice": 50,
        "salePrice": 80,
        "stockQty": 100,
        "status": "active",
        "category": { "id": "cat_1", "name": "Dairy" },
        "supplier": { "id": "sup_1", "name": "Best Foods" }
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "pages": 8
    }
  }
}
```

### Create Product (Admin Only)
**POST** `/api/product/create`

Request:
```json
{
  "name": "Milk 1L",
  "categoryId": "cat_1",
  "buyPrice": 50,
  "salePrice": 80,
  "stockQty": 100,
  "supplierId": "sup_1",
  "image": "url_or_base64"
}
```

### Get Product
**GET** `/api/product/[id]`

### Update Product (Admin Only)
**PUT** `/api/product/[id]`

### Delete Product (Admin Only)
**DELETE** `/api/product/[id]`

### Search Products
**GET** `/api/product/search?q=milk&limit=10`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_1",
      "name": "Milk 1L",
      "salePrice": 80,
      "stockQty": 100
    }
  ]
}
```

---

## Customers

### List Customers
**GET** `/api/customer/list?page=1&limit=20`

### Create Customer
**POST** `/api/customer/create`

Request:
```json
{
  "name": "Ahmed Hassan",
  "phone": "+88017123456",
  "email": "ahmed@email.com",
  "address": "Dhaka, Bangladesh"
}
```

### Get Customer
**GET** `/api/customer/[id]`

### Update Customer
**PUT** `/api/customer/[id]`

### Delete Customer
**DELETE** `/api/customer/[id]`

### Search Customers
**GET** `/api/customer/search?q=ahmed&limit=10`

---

## Suppliers

### List Suppliers
**GET** `/api/supplier/list?page=1&limit=20`

### Create Supplier (Admin Only)
**POST** `/api/supplier/create`

Request:
```json
{
  "name": "Best Foods Ltd",
  "phone": "+88016987654",
  "company": "Best Foods",
  "address": "Chittagong, Bangladesh"
}
```

### Get Supplier
**GET** `/api/supplier/[id]`

### Update Supplier (Admin Only)
**PUT** `/api/supplier/[id]`

### Delete Supplier (Admin Only)
**DELETE** `/api/supplier/[id]`

### Search Suppliers
**GET** `/api/supplier/search?q=best&limit=10`

---

## Payment Methods

### List Payment Methods
**GET** `/api/payment-method/list`

Response:
```json
{
  "success": true,
  "data": [
    { "id": "pm_1", "name": "Cash", "active": true },
    { "id": "pm_2", "name": "Card", "active": true },
    { "id": "pm_3", "name": "Bkash", "active": true },
    { "id": "pm_4", "name": "Nagad", "active": true }
  ]
}
```

### Create Payment Method (Admin Only)
**POST** `/api/payment-method/create`

Request:
```json
{
  "name": "Bank Transfer"
}
```

---

## Categories

### List Categories
**GET** `/api/category/list`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_1",
      "name": "Dairy",
      "_count": { "products": 15 }
    }
  ]
}
```

### Create Category (Admin Only)
**POST** `/api/category/create`

Request:
```json
{
  "name": "Beverages"
}
```

---

## Invoices (Core POS)

### Create Invoice (Most Important)
**POST** `/api/invoice/create`

Request:
```json
{
  "customerId": "cust_1",
  "items": [
    {
      "productId": "prod_1",
      "qty": 2,
      "unitPrice": 80
    },
    {
      "productId": "prod_2",
      "qty": 1,
      "unitPrice": 150
    }
  ],
  "subtotal": 310,
  "discount": 10,
  "vatTax": 15,
  "paidAmount": 315,
  "paymentMethodId": "pm_1",
  "notes": "Thank you for shopping"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "inv_1",
    "invoiceNo": "INV000001",
    "customerId": "cust_1",
    "subtotal": 310,
    "discount": 10,
    "vatTax": 15,
    "grandTotal": 315,
    "paidAmount": 315,
    "dueAmount": 0,
    "paymentMethodId": "pm_1",
    "createdAt": "2024-04-28T10:30:00Z",
    "items": [
      {
        "id": "item_1",
        "productId": "prod_1",
        "qty": 2,
        "unitPrice": 80,
        "totalPrice": 160,
        "product": {
          "id": "prod_1",
          "name": "Milk 1L",
        }
      }
    ],
    "customer": {
      "id": "cust_1",
      "name": "Ahmed Hassan",
      "phone": "+88017123456"
    },
    "paymentMethod": {
      "id": "pm_1",
      "name": "Cash"
    },
    "soldByUser": {
      "id": "user_1",
      "name": "John Cashier"
    }
  },
  "message": "Invoice created successfully"
}
```

**Important Features:**
- ✅ Stock is automatically deducted
- ✅ Stock logs are created
- ✅ Customer due balance is updated
- ✅ All in database transaction (atomic)
- ✅ Validates product availability before creating

### List Invoices
**GET** `/api/invoice/list?page=1&limit=20`

### Get Invoice Details
**GET** `/api/invoice/[id]`

### Get Printable Invoice Data
**GET** `/api/invoice/print/[id]`

Response:
```json
{
  "success": true,
  "data": {
    "shop": {
      "name": "My POS Shop",
      "address": "Dhaka, Bangladesh",
      "phone": "+8801234567",
      "logo": "url",
      "footerText": "Thank you for shopping!"
    },
    "invoice": {
      "number": "INV000001",
      "date": "2024-04-28T10:30:00Z",
      "time": "10:30:00 AM"
    },
    "customer": {
      "name": "Ahmed Hassan",
      "phone": "+88017123456",
      "email": "ahmed@email.com",
      "address": "Dhaka"
    },
    "cashier": {
      "name": "John Cashier"
    },
    "items": [
      {
        "name": "Milk 1L",
        "qty": 2,
        "unitPrice": 80,
        "totalPrice": 160,
        "tax": 8
      }
    ],
    "summary": {
      "subtotal": 310,
      "discount": 10,
      "vat": 15,
      "grandTotal": 315,
      "paidAmount": 315,
      "dueAmount": 0,
      "paymentMethod": "Cash",
      "change": 0
    }
  }
}
```

---

## Settings

### Get Settings
**GET** `/api/settings`

Response:
```json
{
  "success": true,
  "data": {
    "id": "settings_1",
    "shopName": "My POS Shop",
    "address": "Dhaka, Bangladesh",
    "phone": "+8801234567",
    "invoicePrefix": "INV",
    "logo": "url_or_base64",
    "footerText": "Thank you for shopping!"
  }
}
```

### Update Settings (Admin Only)
**PUT** `/api/settings`

Request:
```json
{
  "shopName": "Updated Shop Name",
  "address": "New Address",
  "phone": "+8801234567",
  "invoicePrefix": "RCP",
  "logo": "url_or_base64",
  "footerText": "New footer text"
}
```

---

## Dashboard

### Get Dashboard Statistics
**GET** `/api/dashboard/stats`

Response:
```json
{
  "success": true,
  "data": {
    "sales": {
      "today": 5250,
      "todayInvoiceCount": 12,
      "thisMonth": 145300
    },
    "inventory": {
      "totalProducts": 250,
      "lowStockCount": 8,
      "lowStockProducts": [
        {
          "id": "prod_1",
          "name": "Milk 1L",
          "stockQty": 3,
          "salePrice": 80
        }
      ]
    },
    "customers": {
      "total": 150
    },
    "invoices": {
      "total": 2450,
      "recent": [
        {
          "id": "inv_1",
          "invoiceNo": "INV000001",
          "grandTotal": 315,
          "customer": { "name": "Ahmed Hassan" },
          "paymentMethod": { "name": "Cash" },
          "createdAt": "2024-04-28T10:30:00Z"
        }
      ]
    }
  }
}
```

---

## Error Responses

### Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "status": 401
}
```

### Forbidden (Insufficient Role)
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "status": 403
}
```

### Validation Error
```json
{
  "success": false,
  "error": "Product name is required, Valid buy price is required",
  "message": "status": 422
}
```

### Not Found
```json
{
  "success": false,
  "error": "Product not found",
  "message": "status": 404
}
```

### Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "status": 500
}
```

---

## Usage Tips

1. **Always include token** in Authorization header (except login/register)
2. **Stock deduction is automatic** when invoice is created
3. **Due amount calculation** is automatic for customers
4. **Transactions are atomic** - if any step fails, all changes rollback
5. **Pagination** uses page and limit query params
6. **Search** is case-insensitive and searches multiple fields
7. **Admin-only endpoints** reject CASHIER role with 403 Forbidden
8. **Timestamps** are in ISO 8601 format (UTC)

