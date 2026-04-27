"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { usePOSStore } from "@/store/useStore";

const SalesChart = dynamic(
  () => import("@/components/dashboard/sales-chart").then((mod) => mod.SalesChart),
  {
    ssr: false,
    loading: () => <p className="text-sm text-slate-500">Loading chart...</p>,
  }
);

function dayKey(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
}

export function DashboardScreen() {
  const invoices = usePOSStore((state) => state.invoices);
  const products = usePOSStore((state) => state.products);
  const settings = usePOSStore((state) => state.settings);

  const today = dayKey(new Date());
  const month = monthKey(new Date());

  const todaySales = invoices
    .filter((invoice) => dayKey(new Date(invoice.createdAt)) === today)
    .reduce((acc, invoice) => acc + invoice.total, 0);

  const monthSales = invoices
    .filter((invoice) => monthKey(new Date(invoice.createdAt)) === month)
    .reduce((acc, invoice) => acc + invoice.total, 0);

  const totalDue = invoices.reduce((acc, invoice) => acc + invoice.due, 0);

  const cards = [
    { label: "Total Sales Today", value: formatCurrency(todaySales, settings.currency) },
    {
      label: "Total Sales This Month",
      value: formatCurrency(monthSales, settings.currency),
    },
    { label: "Total Orders", value: String(invoices.length) },
    { label: "Total Products", value: String(products.length) },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Dashboard"
        description="Quick business snapshot and recent transactions."
        action={
          <Link href="/invoices">
            <Button>Quick Add Invoice</Button>
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card
            key={card.label}
            className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/60"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Sales Trend (Last 7 Days)</h3>
          <SalesChart invoices={invoices} currency={settings.currency} />
        </Card>

        <Card className="bg-slate-900 text-white dark:bg-slate-800">
          <h3 className="text-lg font-semibold">Daily Summary</h3>
          <div className="mt-4 space-y-2 text-sm">
            <p className="flex justify-between">
              <span>Total Orders Today</span>
              <span>
                {
                  invoices.filter(
                    (invoice) => dayKey(new Date(invoice.createdAt)) === today
                  ).length
                }
              </span>
            </p>
            <p className="flex justify-between">
              <span>Today&apos;s Revenue</span>
              <span>{formatCurrency(todaySales, settings.currency)}</span>
            </p>
            <p className="flex justify-between">
              <span>Pending Due</span>
              <span>{formatCurrency(totalDue, settings.currency)}</span>
            </p>
          </div>
        </Card>
      </section>

      <Card>
        <h3 className="mb-3 text-lg font-semibold">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-3 py-2 text-left">Invoice</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-right">Due</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 8).map((invoice) => (
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
                </tr>
              ))}
              {!invoices.length ? (
                <tr>
                  <td className="px-3 py-4 text-slate-500" colSpan={5}>
                    No transactions yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
