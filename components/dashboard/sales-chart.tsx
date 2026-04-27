"use client";

import { useMemo } from "react";
import { Invoice } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface SalesChartProps {
  invoices: Invoice[];
  currency: string;
}

export function SalesChart({ invoices, currency }: SalesChartProps) {
  const points = useMemo(() => {
    const daily = new Map<string, number>();
    invoices.forEach((invoice) => {
      const day = new Date(invoice.createdAt).toISOString().slice(0, 10);
      daily.set(day, (daily.get(day) || 0) + invoice.total);
    });
    return Array.from(daily.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-7);
  }, [invoices]);

  if (!points.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No sales data for chart yet.
      </p>
    );
  }

  const max = Math.max(...points.map(([, value]) => value), 1);

  return (
    <div className="space-y-3">
      <div className="grid h-44 grid-cols-7 items-end gap-2">
        {points.map(([day, value]) => (
          <div key={day} className="group relative flex h-full flex-col justify-end">
            <div
              className="rounded-t-lg bg-slate-900/85 transition-all group-hover:bg-sky-600 dark:bg-slate-100/90 dark:group-hover:bg-cyan-400"
              style={{ height: `${Math.max(6, (value / max) * 100)}%` }}
            />
            <div className="mt-2 text-center text-[10px] text-slate-500 dark:text-slate-400">
              {day.slice(5)}
            </div>
            <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-slate-950 px-2 py-1 text-[10px] text-white group-hover:block dark:bg-slate-50 dark:text-slate-900">
              {formatCurrency(value, currency)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
