"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { usePOSStore } from "@/store/useStore";
import { InvoiceItem, PaymentMethod, Product } from "@/types";
import { ReceiptView } from "@/components/receipt/receipt-view";

const paymentMethods: PaymentMethod[] = ["Cash", "Bkash", "Nagad", "Card"];

function mapToInvoiceItem(product: Product): InvoiceItem {
  return {
    id: `${product.id}-${Date.now()}`,
    productId: product.id,
    name: product.name,
    quantity: 1,
    price: product.sellPrice,
    total: product.sellPrice,
  };
}

export function InvoiceBuilder() {
  const products = usePOSStore((state) => state.products);
  const customers = usePOSStore((state) => state.customers);
  const settings = usePOSStore((state) => state.settings);
  const addInvoice = usePOSStore((state) => state.addInvoice);

  const [customerId, setCustomerId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discount, setDiscount] = useState("0");
  const [useVat, setUseVat] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [paidAmount, setPaidAmount] = useState("0");
  const [search, setSearch] = useState("");
  const [lastInvoiceId, setLastInvoiceId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return products;
    }
    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(query)
      );
    });
  }, [products, search]);

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.total, 0),
    [items]
  );
  const discountValue = Math.max(0, Number(discount) || 0);
  const taxable = Math.max(0, subtotal - discountValue);
  const vatAmount = useVat ? (taxable * settings.vatPercent) / 100 : 0;
  const total = taxable + vatAmount;
  const paid = Math.max(0, Number(paidAmount) || 0);
  const due = Math.max(0, total - paid);

  const lastInvoice = usePOSStore((state) =>
    state.invoices.find((invoice) => invoice.id === lastInvoiceId)
  );

  const addItem = (product: Product) => {
    if (product.stock <= 0) {
      return;
    }
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (!existing) {
        return [...prev, mapToInvoiceItem(product)];
      }
      if (existing.quantity >= product.stock) {
        return prev;
      }
      return prev.map((item) =>
        item.productId === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              total: (item.quantity + 1) * item.price,
            }
          : item
      );
    });
  };

  const updateQty = (productId: string, delta: number) => {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      return;
    }
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) {
            return item;
          }
          const nextQty = item.quantity + delta;
          if (nextQty < 0 || nextQty > product.stock) {
            return item;
          }
          return {
            ...item,
            quantity: nextQty,
            total: nextQty * item.price,
          };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleAddSelected = () => {
    const product = products.find((item) => item.id === selectedProductId);
    if (!product) {
      return;
    }
    addItem(product);
    setSelectedProductId("");
  };

  const handleCreateInvoice = () => {
    if (!items.length) {
      return;
    }
    const customer = customers.find((item) => item.id === customerId);
    const invoice = addInvoice({
      customerId: customer?.id,
      customerName: customer?.name,
      items,
      discount: discountValue,
      vatPercent: settings.vatPercent,
      useVat,
      paid,
      paymentMethod,
    });

    setLastInvoiceId(invoice.id);
    setItems([]);
    setDiscount("0");
    setPaidAmount("0");
    setCustomerId("");
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
      <Card className="print:hidden">
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Walk-in Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.phone})
                </option>
              ))}
            </Select>
            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Select
              label="Add Product"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.stock} in stock)
                </option>
              ))}
            </Select>
            <div className="flex min-w-0 items-end">
              <Button
                className="w-full"
                onClick={handleAddSelected}
                disabled={!selectedProductId}
              >
                Add
              </Button>
            </div>
          </div>

          <Input
            label="Search Products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name"
          />

          <div className="grid max-h-48 gap-2 overflow-y-auto rounded-xl border border-slate-200 p-2 dark:border-slate-800">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800/70 dark:hover:bg-slate-800"
                onClick={() => addItem(product)}
                disabled={product.stock <= 0}
              >
                <span>
                  {product.name}
                </span>
                <span>
                  {formatCurrency(product.sellPrice, settings.currency)} | {product.stock}
                </span>
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-slate-50 text-left dark:bg-slate-900">
                <tr>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length ? (
                  items.map((item) => (
                    <tr key={item.id} className="border-t border-slate-200 dark:border-slate-800">
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2">
                        {formatCurrency(item.price, settings.currency)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-2 py-1 dark:border-slate-700">
                          <button onClick={() => updateQty(item.productId, -1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQty(item.productId, 1)}>+</button>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {formatCurrency(item.total, settings.currency)}
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(item.productId)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-3 py-4 text-slate-500" colSpan={5}>
                      No items selected yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              label="Discount"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
            <Input
              label="Paid Amount"
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
            />
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={useVat}
                onChange={(e) => setUseVat(e.target.checked)}
              />
              Apply VAT ({settings.vatPercent}%)
            </label>
          </div>

          <div className="grid gap-1 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-900">
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, settings.currency)}</span>
            </p>
            <p className="flex justify-between">
              <span>Discount</span>
              <span>{formatCurrency(discountValue, settings.currency)}</span>
            </p>
            <p className="flex justify-between">
              <span>VAT</span>
              <span>{formatCurrency(vatAmount, settings.currency)}</span>
            </p>
            <p className="flex justify-between text-base font-semibold">
              <span>Grand Total</span>
              <span>{formatCurrency(total, settings.currency)}</span>
            </p>
            <p className="flex justify-between">
              <span>Due</span>
              <span>{formatCurrency(due, settings.currency)}</span>
            </p>
          </div>

          <Button onClick={handleCreateInvoice} disabled={!items.length}>
            Save Invoice
          </Button>
        </div>
      </Card>

      <Card className="print:border-0 print:bg-transparent print:p-0 print:shadow-none">
        <div className="mb-3 flex items-center justify-between print:hidden">
          <h3 className="text-lg font-semibold">Receipt Preview</h3>
          <Button
            variant="secondary"
            size="sm"
            className="print:hidden"
            onClick={() => window.print()}
            disabled={!lastInvoice}
          >
            Print
          </Button>
        </div>
        {lastInvoice ? (
          <ReceiptView invoice={lastInvoice} settings={settings} />
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create an invoice to preview and print receipt.
          </p>
        )}
      </Card>
    </div>
  );
}
