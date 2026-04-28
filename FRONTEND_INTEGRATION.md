# Frontend Integration Guide

## How to Connect Your Frontend Components to APIs

### 1. Setup Authentication

Update your main layout or app initialization:

```tsx
// app/layout.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { restoreAuth } = useAuthStore();

  useEffect(() => {
    // Restore auth from localStorage on app load
    restoreAuth();
  }, [restoreAuth]);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 2. Create Login Page

```tsx
// app/login.tsx or app/api/login/page.tsx
"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { post, loading } = useApi();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const response = await post("/api/auth/login", {
      email,
      password,
    });

    if (response?.success) {
      const { user, token } = response.data;
      setAuth(user, token);
      router.push("/dashboard");
    } else {
      setError(response?.error || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
```

### 3. Update Products Screen

```tsx
// components/screens/products-screen.tsx
"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Product } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { get, post } = useApi();

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    if (searchQuery) {
      // Search products
      const response = await get<Product[]>(
        `/api/product/search?q=${encodeURIComponent(searchQuery)}&limit=20`
      );
      if (response?.success) {
        setProducts(response.data || []);
      }
    } else {
      // List products
      const response = await get<PaginatedResponse<Product>>(
        `/api/product/list?page=${page}&limit=20`
      );
      if (response?.success) {
        setProducts(response.data.data || []);
      }
    }
    setLoading(false);
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="products-screen">
      <h2>Products</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setPage(1);
        }}
      />

      {/* Products Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Buy Price</th>
            <th>Sale Price</th>
            <th>Stock</th>
            <th>Supplier</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>৳{product.buyPrice}</td>
              <td>৳{product.salePrice}</td>
              <td>{product.stock}</td>
              <td>{product.supplierName || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 4. Update Invoice Builder Component

```tsx
// components/forms/invoice-builder.tsx
"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { Product, Customer } from "@/types";

interface CartItem {
  productId: string;
  product: Product;
  qty: number;
  unitPrice: number;
}

export function InvoiceBuilder() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const { post, get } = useApi();

  // Add product to cart
  const addProductToCart = async (productId: string, qty: number) => {
    try {
      const response = await get(`/api/product/${productId}`);
      if (!response?.success) {
        alert("Product not found");
        return;
      }

      const product = response.data;

      // Check stock
      if (product.stockQty < qty) {
        alert(`Only ${product.stockQty} items available`);
        return;
      }

      // Check if already in cart
      const existingItem = cartItems.find((item) => item.productId === productId);

      if (existingItem) {
        if (existingItem.qty + qty > product.stockQty) {
          alert("Insufficient stock");
          return;
        }
        setCartItems(
          cartItems.map((item) =>
            item.productId === productId
              ? { ...item, qty: item.qty + qty }
              : item
          )
        );
      } else {
        setCartItems([
          ...cartItems,
          {
            productId,
            product,
            qty,
            unitPrice: product.salePrice,
          },
        ]);
      }
    } catch (error) {
      alert("Error adding product to cart");
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.qty * item.unitPrice,
    0
  );
  const vatTax = subtotal * 0.05; // 5% VAT
  const grandTotal = subtotal + vatTax - discount;
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  // Submit invoice
  const submitInvoice = async () => {
    if (!paymentMethod) {
      alert("Select payment method");
      return;
    }

    if (cartItems.length === 0) {
      alert("Add items to invoice");
      return;
    }

    setLoading(true);

    const response = await post("/api/invoice/create", {
      customerId: selectedCustomer?.id,
      items: cartItems.map((item) => ({
        productId: item.productId,
        qty: item.qty,
        unitPrice: item.unitPrice,
      })),
      subtotal,
      discount,
      vatTax,
      paidAmount,
      paymentMethodId: paymentMethod,
    });

    setLoading(false);

    if (response?.success) {
      const invoice = response.data;
      alert(`Invoice ${invoice.invoiceNo} created successfully`);

      // Get printable data
      const printResponse = await get(`/api/invoice/print/${invoice.id}`);
      if (printResponse?.success) {
        // Print invoice
        printInvoice(printResponse.data);
      }

      // Reset form
      setCartItems([]);
      setSelectedCustomer(null);
      setPaymentMethod("");
      setPaidAmount(0);
      setDiscount(0);
    } else {
      alert(response?.error || "Failed to create invoice");
    }
  };

  const printInvoice = (printData: any) => {
    const printWindow = window.open("", "", "height=500,width=800");
    if (!printWindow) return;

    const html = `
      <html>
        <head><title>Invoice ${printData.invoice.number}</title></head>
        <body style="font-family: monospace; font-size: 12px;">
          <pre>
${printData.shop.name}
${printData.shop.address}
${printData.shop.phone}

Invoice: ${printData.invoice.number}
Date: ${new Date(printData.invoice.date).toLocaleDateString()}
Time: ${printData.invoice.time}

${printData.customer ? `Customer: ${printData.customer.name}` : ""}
${printData.customer ? `Phone: ${printData.customer.phone}` : ""}

${printData.items.map((item: any) => `${item.name} x${item.qty} = ${item.totalPrice}`).join("\n")}

Subtotal: ${printData.summary.subtotal}
Discount: ${printData.summary.discount}
VAT: ${printData.summary.vat}
Total: ${printData.summary.grandTotal}

Paid: ${printData.summary.paidAmount}
Due: ${printData.summary.dueAmount}
Method: ${printData.summary.paymentMethod}

${printData.shop.footerText || ""}
          </pre>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="invoice-builder">
      <h2>Create Invoice</h2>

      {/* Cart Items */}
      <div>
        <h3>Items</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.productId}>
                <td>{item.product.name}</td>
                <td>{item.qty}</td>
                <td>৳{item.unitPrice}</td>
                <td>৳{item.qty * item.unitPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div>
        <p>Subtotal: ৳{subtotal}</p>
        <p>VAT (5%): ৳{vatTax}</p>
        <input
          type="number"
          placeholder="Discount"
          value={discount}
          onChange={(e) => setDiscount(Number(e.target.value))}
        />
        <p>Grand Total: ৳{grandTotal}</p>
        <input
          type="number"
          placeholder="Paid Amount"
          value={paidAmount}
          onChange={(e) => setPaidAmount(Number(e.target.value))}
        />
        <p>Due: ৳{dueAmount}</p>
      </div>

      {/* Payment Method */}
      <div>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="">Select Payment Method</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="bkash">Bkash</option>
          <option value="nagad">Nagad</option>
        </select>
      </div>

      {/* Submit */}
      <button
        onClick={submitInvoice}
        disabled={loading || cartItems.length === 0}
      >
        {loading ? "Creating..." : "Create Invoice"}
      </button>
    </div>
  );
}
```

### 5. Update Dashboard Screen

```tsx
// components/screens/dashboard-screen.tsx
"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";

interface DashboardStats {
  sales: {
    today: number;
    todayInvoiceCount: number;
    thisMonth: number;
  };
  inventory: {
    totalProducts: number;
    lowStockCount: number;
    lowStockProducts: any[];
  };
  customers: {
    total: number;
  };
  invoices: {
    total: number;
    recent: any[];
  };
}

export function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const response = await get("/api/dashboard/stats");
    if (response?.success) {
      setStats(response.data);
    }
    setLoading(false);
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (!stats) return <div>Failed to load stats</div>;

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      {/* Sales Cards */}
      <div className="cards">
        <div className="card">
          <h3>Today's Sales</h3>
          <p className="amount">৳{stats.sales.today}</p>
          <p className="subtitle">{stats.sales.todayInvoiceCount} invoices</p>
        </div>

        <div className="card">
          <h3>This Month</h3>
          <p className="amount">৳{stats.sales.thisMonth}</p>
        </div>

        <div className="card">
          <h3>Total Customers</h3>
          <p className="amount">{stats.customers.total}</p>
        </div>

        <div className="card">
          <h3>Total Invoices</h3>
          <p className="amount">{stats.invoices.total}</p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.inventory.lowStockCount > 0 && (
        <div className="alert">
          <h3>⚠️ Low Stock Products ({stats.inventory.lowStockCount})</h3>
          <ul>
            {stats.inventory.lowStockProducts.map((product) => (
              <li key={product.id}>
                {product.name} - Only {product.stockQty} left
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Invoices */}
      <div>
        <h3>Recent Invoices</h3>
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {stats.invoices.recent.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.invoiceNo}</td>
                <td>{invoice.customer?.name || "Walk-in"}</td>
                <td>৳{invoice.grandTotal}</td>
                <td>{invoice.paymentMethod?.name}</td>
                <td>
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### 6. Protected Routes Example

```tsx
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { extractToken, verifyToken } from "@/lib/auth";

const protectedRoutes = [
  "/dashboard",
  "/products",
  "/customers",
  "/invoices",
  "/suppliers",
  "/settings",
];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if route needs protection
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected) {
    const token = extractToken(request.headers.get("Authorization") || "");

    if (!token || !verifyToken(token)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|public).*?)"],
};
```

---

## Testing with Postman

1. **Create Admin User** via registration endpoint
2. **Login** and copy token
3. **Add token to Authorization header** for all requests
4. **Test product creation**
5. **Create customer**
6. **Create invoice** - should automatically deduct stock
7. **Check dashboard** - should show updated stats

---

## Common Patterns

### Handle Loading States

```tsx
const { loading, error } = useApi();

if (loading) return <Loader />;
if (error) return <Error message={error} />;
```

### Form Submission with Validation

```tsx
const handleSubmit = async (formData) => {
  const validation = validateProductForm(formData);
  if (!validation.valid) {
    setErrors(validation.errors);
    return;
  }

  const response = await post("/api/product/create", formData);
  if (response?.success) {
    showToast("Product created!");
    resetForm();
  } else {
    showToast(response?.error, "error");
  }
};
```

### Token Management

```tsx
// Auto-save token on login
const { setAuth } = useAuthStore();
setAuth(user, token);

// Auto-restore on page load
useEffect(() => {
  useAuthStore().restoreAuth();
}, []);

// Auto-clear on logout
const logout = () => {
  useAuthStore().logout();
  router.push("/login");
};
```

---

