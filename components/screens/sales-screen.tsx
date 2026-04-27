"use client";

import { useMemo, useState } from "react";
import { ReceiptView } from "@/components/receipt/receipt-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { usePOSStore } from "@/store/useStore";

function toDateKey(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;
}

export function SalesScreen() {
  const invoices = usePOSStore((state) => state.invoices);
  const settings = usePOSStore((state) => state.settings);
  const deleteInvoice = usePOSStore((state) => state.deleteInvoice);

  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const matchesText =
        !text ||
        invoice.invoiceNumber.toLowerCase().includes(text) ||
        invoice.customerName?.toLowerCase().includes(text);
      const matchesDate = !date || toDateKey(invoice.createdAt) === date;
      return matchesText && matchesDate;
    });
  }, [date, invoices, query]);

  const selected = invoices.find((invoice) => invoice.id === selectedId);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Sales History"
        description="Search invoices, inspect details, and reprint receipts."
      />

      <Card className="print:hidden">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Search by Invoice Number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="INV-2026..."
          />
          <Input
            label="Filter by Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </Card>

      <Card className="print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-3 py-2 text-left">Invoice</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-right">Due</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((invoice) => (
                <tr key={invoice.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-3 py-2">{invoice.invoiceNumber}</td>
                  <td className="px-3 py-2">{invoice.customerName}</td>
                  <td className="px-3 py-2">{formatDateTime(invoice.createdAt)}</td>
                  <td className="px-3 py-2 text-right">
                    {formatCurrency(invoice.total, settings.currency)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatCurrency(invoice.due, settings.currency)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedId(invoice.id)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedId(invoice.id);
                          window.print();
                        }}
                      >
                        Reprint
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (selectedId === invoice.id) {
                            setSelectedId(null);
                          }
                          deleteInvoice(invoice.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length ? (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={6}>
                    No invoices found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      {selected ? (
        <Card className="print:border-0 print:bg-transparent print:p-0 print:shadow-none">
          <div className="mb-3 flex items-center justify-between print:hidden">
            <h3 className="text-lg font-semibold">Invoice Detail</h3>
            <Button size="sm" variant="secondary" onClick={() => window.print()}>
              Print
            </Button>
          </div>
          <ReceiptView invoice={selected} settings={settings} />
        </Card>
      ) : null}
    </div>
  );
}
