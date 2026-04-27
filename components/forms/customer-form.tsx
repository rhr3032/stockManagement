"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Customer } from "@/types";

interface CustomerFormProps {
  initial?: Partial<Customer>;
  onSubmit: (payload: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  }) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function CustomerForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save Customer",
}: CustomerFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");

  const disabled = useMemo(() => !name.trim() || !phone.trim(), [name, phone]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (disabled) {
      return;
    }

    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
    });

    if (!initial?.id) {
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
    }
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <Input label="Customer Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Input
        label="Email (optional)"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Textarea
        label="Address (optional)"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
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
