"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { generateId, generateInvoiceNumber, sumItems } from "@/lib/utils";
import {
  BusinessSettings,
  Customer,
  Invoice,
  InvoiceItem,
  PaymentMethod,
  POSBackup,
  Product,
} from "@/types";

interface InvoicePayload {
  customerId?: string;
  customerName?: string;
  items: InvoiceItem[];
  discount: number;
  vatPercent: number;
  useVat: boolean;
  paid: number;
  paymentMethod: PaymentMethod;
}

interface POSState {
  hydrated: boolean;
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  settings: BusinessSettings;
  setHydrated: (value: boolean) => void;
  setProducts: (products: Product[]) => void;
  setCustomers: (customers: Customer[]) => void;
  addProduct: (payload: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
  updateProduct: (id: string, payload: Partial<Omit<Product, "id">>) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (
    payload: Omit<Customer, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateCustomer: (id: string, payload: Partial<Omit<Customer, "id">>) => void;
  deleteCustomer: (id: string) => void;
  addInvoice: (payload: InvoicePayload) => Invoice;
  deleteInvoice: (id: string) => void;
  updateSettings: (payload: Partial<BusinessSettings>) => void;
  exportBackup: () => POSBackup;
  importBackup: (payload: POSBackup) => void;
}

const defaultSettings: BusinessSettings = {
  businessName: "My POS Shop",
  address: "Dhaka, Bangladesh",
  phone: "+8801XXXXXXXXX",
  vatPercent: 5,
  currency: "BDT",
  paperSize: "58mm",
  darkMode: false,
};

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      products: [],
      customers: [],
      invoices: [],
      settings: defaultSettings,
      setHydrated: (value) => set({ hydrated: value }),
      setProducts: (products) => set({ products }),
      setCustomers: (customers) => set({ customers }),
      addProduct: (payload) =>
        set((state) => ({
          products: [
            ...state.products,
            {
              ...payload,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      updateProduct: (id, payload) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? {
                  ...product,
                  ...payload,
                  updatedAt: new Date().toISOString(),
                }
              : product
          ),
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        })),
      addCustomer: (payload) =>
        set((state) => ({
          customers: [
            ...state.customers,
            {
              ...payload,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      updateCustomer: (id, payload) =>
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === id
              ? {
                  ...customer,
                  ...payload,
                  updatedAt: new Date().toISOString(),
                }
              : customer
          ),
        })),
      deleteCustomer: (id) =>
        set((state) => ({
          customers: state.customers.filter((customer) => customer.id !== id),
        })),
      addInvoice: (payload) => {
        const state = get();
        const subtotal = sumItems(payload.items);
        const discount = Math.max(0, payload.discount || 0);
        const taxableAmount = Math.max(0, subtotal - discount);
        const vat =
          payload.useVat && payload.vatPercent > 0
            ? (taxableAmount * payload.vatPercent) / 100
            : 0;
        const total = taxableAmount + vat;
        const paid = Math.max(0, payload.paid || 0);
        const due = Math.max(0, total - paid);

        const resolvedCustomerName =
          payload.customerId &&
          state.customers.find((customer) => customer.id === payload.customerId)
            ?.name
            ? state.customers.find(
                (customer) => customer.id === payload.customerId
              )?.name
            : payload.customerName;

        const invoice: Invoice = {
          id: generateId(),
          invoiceNumber: generateInvoiceNumber(state.invoices),
          customerId: payload.customerId,
          customerName: resolvedCustomerName || "Walk-in Customer",
          items: payload.items,
          subtotal,
          discount,
          vat,
          total,
          paid,
          due,
          paymentMethod: payload.paymentMethod,
          createdAt: new Date().toISOString(),
        };

        const nextProducts = state.products.map((product) => {
          const sold = payload.items.find((item) => item.productId === product.id);
          if (!sold) {
            return product;
          }
          return {
            ...product,
            stock: Math.max(0, product.stock - sold.quantity),
            updatedAt: new Date().toISOString(),
          };
        });

        set({
          invoices: [invoice, ...state.invoices],
          products: nextProducts,
        });

        return invoice;
      },
      deleteInvoice: (id) =>
        set((state) => {
          const invoice = state.invoices.find((item) => item.id === id);
          if (!invoice) {
            return {};
          }

          const revertedProducts = state.products.map((product) => {
            const sold = invoice.items.find((item) => item.productId === product.id);
            if (!sold) {
              return product;
            }
            return {
              ...product,
              stock: product.stock + sold.quantity,
              updatedAt: new Date().toISOString(),
            };
          });

          return {
            invoices: state.invoices.filter((invoiceItem) => invoiceItem.id !== id),
            products: revertedProducts,
          };
        }),
      updateSettings: (payload) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...payload,
          },
        })),
      exportBackup: () => {
        const state = get();
        return {
          version: 1,
          exportedAt: new Date().toISOString(),
          data: {
            products: state.products,
            customers: state.customers,
            invoices: state.invoices,
            settings: state.settings,
          },
        };
      },
      importBackup: (payload) => {
        set({
          products: payload.data.products ?? [],
          customers: payload.data.customers ?? [],
          invoices: payload.data.invoices ?? [],
          settings: {
            ...defaultSettings,
            ...(payload.data.settings ?? {}),
          },
        });
      },
    }),
    {
      name: "pos-storage-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        products: state.products,
        customers: state.customers,
        invoices: state.invoices,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
