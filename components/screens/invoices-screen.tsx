"use client";

import { InvoiceBuilder } from "@/components/forms/invoice-builder";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";

export function InvoicesScreen() {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Create Invoice"
        description="Build invoice, collect payment, and print thermal receipt."
        className="print:hidden"
      />
      <Card className="print:hidden">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Shortcuts: <strong>Ctrl/Cmd + I</strong> to open invoice page,{" "}
          <strong>Ctrl/Cmd + P</strong> for products.
        </p>
      </Card>
      <InvoiceBuilder />
    </div>
  );
}
