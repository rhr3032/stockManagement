import { formatCurrency, formatDateTime } from "@/lib/utils";
import { BusinessSettings, Invoice } from "@/types";

interface ReceiptViewProps {
  invoice: Invoice;
  settings: BusinessSettings;
}

export function ReceiptView({ invoice, settings }: ReceiptViewProps) {
  const currency = settings.currency || "BDT";

  return (
    <article
      className="receipt-print mono mx-auto w-full max-w-sm bg-white p-4 text-[11px] text-black print:p-0 print:mx-0 print:max-w-none"
      data-size={settings.paperSize}
    >
      <div className="text-center">
        {settings.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.logo}
            alt={settings.businessName}
            className="mx-auto mb-2 h-10 w-10 rounded object-cover"
          />
        ) : null}
        <h2 className="text-sm font-semibold">{settings.businessName}</h2>
        <p>{settings.address}</p>
        <p>{settings.phone}</p>
      </div>

      <hr className="my-2 border-dashed border-black" />
      <div className="space-y-1">
        <p>Invoice: {invoice.invoiceNumber}</p>
        <p>Date: {formatDateTime(invoice.createdAt)}</p>
        <p>Customer: {invoice.customerName || "Walk-in Customer"}</p>
        <p>Payment: {invoice.paymentMethod}</p>
      </div>
      <hr className="my-2 border-dashed border-black" />

      <div className="space-y-1">
        {invoice.items.map((item) => (
          <div key={item.id} className="grid grid-cols-[1fr_auto] gap-3">
            <div>
              <p>{item.name}</p>
              <p className="text-[10px]">
                {item.quantity} x {formatCurrency(item.price, currency)}
              </p>
            </div>
            <p className="text-right">{formatCurrency(item.total, currency)}</p>
          </div>
        ))}
      </div>

      <hr className="my-2 border-dashed border-black" />
      <div className="space-y-1">
        <p className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(invoice.subtotal, currency)}</span>
        </p>
        <p className="flex justify-between">
          <span>Discount</span>
          <span>{formatCurrency(invoice.discount, currency)}</span>
        </p>
        <p className="flex justify-between">
          <span>VAT</span>
          <span>{formatCurrency(invoice.vat, currency)}</span>
        </p>
        <p className="flex justify-between text-sm font-semibold">
          <span>Total</span>
          <span>{formatCurrency(invoice.total, currency)}</span>
        </p>
        <p className="flex justify-between">
          <span>Paid</span>
          <span>{formatCurrency(invoice.paid, currency)}</span>
        </p>
        <p className="flex justify-between font-semibold">
          <span>Due</span>
          <span>{formatCurrency(invoice.due, currency)}</span>
        </p>
      </div>

      <hr className="my-2 border-dashed border-black" />
      <p className="text-center">Thank you for shopping with us.</p>
    </article>
  );
}
