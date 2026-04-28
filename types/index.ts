export type PaymentMethod = "Cash" | "Bkash" | "Nagad" | "Card";

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  supplierId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  paid: number;
  due: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface BusinessSettings {
  businessName: string;
  logo?: string;
  address: string;
  phone: string;
  vatPercent: number;
  currency: string;
  paperSize: "58mm" | "80mm";
  darkMode: boolean;
}

export interface POSBackup {
  version: number;
  exportedAt: string;
  data: {
    products: Product[];
    customers: Customer[];
    invoices: Invoice[];
    settings: BusinessSettings;
  };
}
