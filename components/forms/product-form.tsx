"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/types";

interface ProductFormProps {
  initial?: Partial<Product>;
  onSubmit: (payload: {
    name: string;
    buyPrice: number;
    sellPrice: number;
    stock: number;
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
  const [buyPrice, setBuyPrice] = useState(initial?.buyPrice ? String(initial.buyPrice) : "");
  const [sellPrice, setSellPrice] = useState(initial?.sellPrice ? String(initial.sellPrice) : "");
  const [stock, setStock] = useState(initial?.stock ? String(initial.stock) : "");

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
      buyPrice: Math.max(0, Number(buyPrice) || 0),
      sellPrice: Math.max(0, Number(sellPrice) || 0),
      stock: Math.max(0, Number(stock) || 0),
    });
    if (!initial?.id) {
      setName("");
      setBuyPrice("");
      setSellPrice("");
      setStock("");
    }
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <Input label="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
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
