"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Product } from "@/types";

interface ProductFormProps {
  initial?: Partial<Product>;
  onSubmit: (payload: {
    name: string;
    categoryId?: string;
    unit?: string;
    buyPrice: number;
    sellPrice: number;
    stock: number;
    supplierName?: string;
  }) => void;
  categories?: Array<{ id: string; name: string }>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ProductForm({
  initial,
  onSubmit,
  categories = [],
  onCancel,
  submitLabel = "Save Product",
}: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [buyPrice, setBuyPrice] = useState(initial?.buyPrice ? String(initial.buyPrice) : "");
  const [sellPrice, setSellPrice] = useState(initial?.sellPrice ? String(initial.sellPrice) : "");
  const [stock, setStock] = useState(initial?.stock ? String(initial.stock) : "");
  const [supplierName, setSupplierName] = useState("");

  const disabled = useMemo(() => {
    return !name.trim() || !buyPrice.trim() || !sellPrice.trim();
  }, [buyPrice, name, sellPrice]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (disabled) {
      return;
    }
    onSubmit({
      name: name.trim(),
      categoryId: categoryId || undefined,
      unit: unit.trim() || undefined,
      buyPrice: Math.max(0, Number(buyPrice) || 0),
      sellPrice: Math.max(0, Number(sellPrice) || 0),
      stock: Math.max(0, Number(stock) || 0),
      supplierName: supplierName.trim() || undefined,
    });
    if (!initial?.id) {
      setName("");
      setCategoryId("");
      setUnit("");
      setBuyPrice("");
      setSellPrice("");
      setStock("");
      setSupplierName("");
    }
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <Input label="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Select
        label="Category"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      >
        <option value="">Select category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <Input
        label="Unit"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        placeholder="e.g. pcs, kg, liter"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Buy Price"
          type="number"
          step="0.01"
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
        />
        <Input
          label="Sell Price"
          type="number"
          step="0.01"
          value={sellPrice}
          onChange={(e) => setSellPrice(e.target.value)}
        />
      </div>
      <Input
        label="Stock Quantity"
        type="number"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
      />
      <Input
        label="Supplier Name"
        value={supplierName}
        onChange={(e) => setSupplierName(e.target.value)}
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
