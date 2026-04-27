"use client";

import { useMemo, useState } from "react";
import { CustomerForm } from "@/components/forms/customer-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { formatDateTime } from "@/lib/utils";
import { usePOSStore } from "@/store/useStore";

export function CustomersScreen() {
  const customers = usePOSStore((state) => state.customers);
  const addCustomer = usePOSStore((state) => state.addCustomer);
  const updateCustomer = usePOSStore((state) => state.updateCustomer);
  const deleteCustomer = usePOSStore((state) => state.deleteCustomer);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return customers;
    }
    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query)
      );
    });
  }, [customers, search]);

  const editing = customers.find((customer) => customer.id === editingId);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Customer Management"
        description="Manage customer records for faster billing."
      />

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card>
          <h3 className="mb-3 text-lg font-semibold">
            {editing ? "Edit Customer" : "Add Customer"}
          </h3>
          <CustomerForm
            initial={editing}
            submitLabel={editing ? "Update Customer" : "Add Customer"}
            onSubmit={(payload) => {
              if (editing) {
                updateCustomer(editing.id, payload);
                setEditingId(null);
                return;
              }
              addCustomer(payload);
            }}
            onCancel={editing ? () => setEditingId(null) : undefined}
          />
        </Card>

        <Card>
          <Input
            label="Search Customers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, phone, email"
          />

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Phone</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Address</th>
                  <th className="px-3 py-2 text-left">Updated</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-3 py-2">{customer.name}</td>
                    <td className="px-3 py-2">{customer.phone}</td>
                    <td className="px-3 py-2">{customer.email || "-"}</td>
                    <td className="px-3 py-2">{customer.address || "-"}</td>
                    <td className="px-3 py-2">{formatDateTime(customer.updatedAt)}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditingId(customer.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => deleteCustomer(customer.id)}
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
                      No customers found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
