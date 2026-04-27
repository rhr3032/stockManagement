"use client";

import { useMemo, useState } from "react";
import { ProductForm } from "@/components/forms/product-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/ui/section-header";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { usePOSStore } from "@/store/useStore";

export function ProductsScreen() {
  const products = usePOSStore((state) => state.products);
  const settings = usePOSStore((state) => state.settings);
  const addProduct = usePOSStore((state) => state.addProduct);
  const updateProduct = usePOSStore((state) => state.updateProduct);
  const deleteProduct = usePOSStore((state) => state.deleteProduct);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.barcode?.toLowerCase().includes(query);
      return matchesQuery;
    });
  }, [products, search]);

  const editing = products.find((product) => product.id === editingId);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Product Management"
        description="Add, edit, search, and manage stock."
      />

      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <Card>
          <h3 className="mb-3 text-lg font-semibold">
            {editing ? "Edit Product" : "Add Product"}
          </h3>
          <ProductForm
            initial={editing}
            submitLabel={editing ? "Update Product" : "Add Product"}
            onSubmit={(payload) => {
              if (editing) {
                updateProduct(editing.id, payload);
                setEditingId(null);
              } else {
                addProduct(payload);
              }
            }}
            onCancel={editing ? () => setEditingId(null) : undefined}
          />
        </Card>

        <Card>
          <div className="mb-4">
            <Input
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, barcode"
            />
          </div>

          <div className="mb-3 flex items-center justify-between text-sm">
            <p>
              Total Products: <strong>{products.length}</strong>
            </p>
            <p>
              Filtered: <strong>{filtered.length}</strong>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-right">Buy Price</th>
                  <th className="px-3 py-2 text-right">Sell Price</th>
                  <th className="px-3 py-2 text-right">Stock</th>
                  <th className="px-3 py-2 text-left">Updated</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-3 py-2">{product.name}</td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrency(product.buyPrice, settings.currency)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrency(product.sellPrice, settings.currency)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right ${
                        product.stock < 5 ? "text-rose-600 dark:text-rose-400" : ""
                      }`}
                    >
                      {product.stock}
                    </td>
                    <td className="px-3 py-2">{formatDateTime(product.updatedAt)}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setEditingId(product.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => deleteProduct(product.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length ? (
                  <tr>
                    <td className="px-3 py-4 text-slate-500" colSpan={7}>
                      No products found.
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
