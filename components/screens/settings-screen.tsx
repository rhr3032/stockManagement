"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/section-header";
import { Textarea } from "@/components/ui/textarea";
import { downloadJson, fileToBase64, fileToText } from "@/lib/storage";
import { formatDate, todayIso } from "@/lib/utils";
import { usePOSStore } from "@/store/useStore";
import { POSBackup } from "@/types";

export function SettingsScreen() {
  const settings = usePOSStore((state) => state.settings);
  const updateSettings = usePOSStore((state) => state.updateSettings);
  const exportBackup = usePOSStore((state) => state.exportBackup);
  const importBackup = usePOSStore((state) => state.importBackup);

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [vatPercent, setVatPercent] = useState(String(settings.vatPercent));
  const [currency, setCurrency] = useState(settings.currency);
  const [paperSize, setPaperSize] = useState<"58mm" | "80mm">(settings.paperSize);
  const [message, setMessage] = useState("");

  const saveSettings = (event: FormEvent) => {
    event.preventDefault();
    updateSettings({
      businessName: businessName.trim() || "My POS Shop",
      address: address.trim(),
      phone: phone.trim(),
      vatPercent: Math.max(0, Number(vatPercent) || 0),
      currency: currency.trim().toUpperCase() || "BDT",
      paperSize,
    });
    setMessage("Settings saved.");
  };

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const base64 = await fileToBase64(file);
    updateSettings({ logo: base64 });
    setMessage("Logo uploaded.");
  };

  const handleExport = () => {
    const payload = exportBackup();
    const file = `pos-backup-${todayIso()}.json`;
    downloadJson(file, payload);
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const text = await fileToText(file);
      const payload = JSON.parse(text) as POSBackup;
      if (!payload?.data) {
        throw new Error("Invalid backup file");
      }
      importBackup(payload);
      setMessage(`Backup imported (${formatDate(payload.exportedAt)}).`);
    } catch {
      setMessage("Import failed. Please use a valid backup JSON.");
    }
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Settings"
        description="Business profile, print preferences, and data backup."
      />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Business Settings</h3>
          <form className="grid gap-3" onSubmit={saveSettings}>
            <Input
              label="Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
            <Textarea
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="VAT %"
                type="number"
                value={vatPercent}
                onChange={(e) => setVatPercent(e.target.value)}
              />
              <Input
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="BDT"
              />
            </div>
            <Select
              label="Thermal Paper Size"
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as "58mm" | "80mm")}
            >
              <option value="58mm">58mm</option>
              <option value="80mm">80mm</option>
            </Select>

            <label className="grid gap-1.5 text-sm text-slate-700 dark:text-slate-200">
              <span className="font-medium">Logo Upload</span>
              <input
                type="file"
                accept="image/*"
                className="rounded-xl border border-slate-300 p-2 dark:border-slate-700"
                onChange={handleLogoUpload}
              />
            </label>

            {settings.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logo}
                alt="Business logo"
                className="h-14 w-14 rounded object-cover"
              />
            ) : null}

            <Button type="submit">Save Settings</Button>
          </form>
          {message ? (
            <p className="mt-3 text-sm text-sky-700 dark:text-sky-300">{message}</p>
          ) : null}
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold">Backup & Restore</h3>
          <div className="space-y-3">
            <Button className="w-full" onClick={handleExport}>
              Export Data as JSON
            </Button>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">
                Import Backup JSON
              </span>
              <input
                type="file"
                accept="application/json"
                className="rounded-xl border border-slate-300 p-2 dark:border-slate-700"
                onChange={handleImport}
              />
            </label>
          </div>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Backup includes products, customers, invoices, and all settings.
          </p>
        </Card>
      </div>
    </div>
  );
}
