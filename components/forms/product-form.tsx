"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types";

interface ProductFormProps {
  initial?: Partial<Product>;
  onSubmit: (payload: {
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
    barcode?: string;
  }) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ProductForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save Product",
}: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [price, setPrice] = useState(initial?.price ? String(initial.price) : "");
  const [stock, setStock] = useState(initial?.stock ? String(initial.stock) : "");
  const [barcode, setBarcode] = useState(initial?.barcode ?? "");

  const disabled = useMemo(() => {
    return !name.trim() || !sku.trim() || !category.trim();
  }, [category, name, sku]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (disabled) {
      return;
    }
    onSubmit({
      name: name.trim(),
      sku: sku.trim(),
      category: category.trim(),
      price: Math.max(0, Number(price) || 0),
      stock: Math.max(0, Number(stock) || 0),
      barcode: barcode.trim() || undefined,
    });
    if (!initial?.id) {
      setName("");
      setSku("");
      setCategory("");
      setPrice("");
      setStock("");
      setBarcode("");
    }
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <Input label="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
        <Input
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Price"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Input
          label="Stock Quantity"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
      </div>
      <Input
        label="Barcode (optional)"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
      />

      <div className="flex flex-wrap justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={disabled}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
