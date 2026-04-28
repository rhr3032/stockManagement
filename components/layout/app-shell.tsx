"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useInitializeStore } from "@/hooks/useInitializeStore";
import { cn } from "@/lib/utils";
import { usePOSStore } from "@/store/useStore";

interface AppShellProps {
  children: ReactNode;
}

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/customers", label: "Customers" },
  { href: "/invoices", label: "Create Invoice" },
  { href: "/sales", label: "Sales History" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ children }: AppShellProps) {
  useInitializeStore();
  const pathname = usePathname();
  const settings = usePOSStore((state) => state.settings);
  const updateSettings = usePOSStore((state) => state.updateSettings);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compactNav, setCompactNav] = useLocalStorageState(
    "pos-compact-nav",
    false
  );

  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [settings.darkMode]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f5f7ff_0%,_#f8fafc_45%,_#ffffff_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top,_#0b1220_0%,_#020617_55%,_#020617_100%)] dark:text-slate-100">
      <button
        className="fixed left-3 top-3 z-30 rounded-xl border border-slate-300 bg-white px-3 py-1 text-xs dark:border-slate-700 dark:bg-slate-900 lg:hidden print:hidden"
        onClick={() => setMobileOpen((prev) => !prev)}
      >
        Menu
      </button>
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[220px_1fr]">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-20 w-64 border-r border-slate-200 bg-white/90 p-5 backdrop-blur transition-transform dark:border-slate-800 dark:bg-slate-950/90 lg:static lg:w-auto lg:translate-x-0 print:hidden",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">POS</p>
              <h2 className="font-semibold tracking-tight">
                {settings.businessName}
              </h2>
            </div>
            <button
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-700"
              onClick={() => setCompactNav((prev) => !prev)}
            >
              {compactNav ? "Wide" : "Compact"}
            </button>
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block rounded-xl px-3 py-2 text-sm transition",
                    active
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                    compactNav && "px-2 py-1.5 text-xs"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-10 flex items-center justify-end gap-3 border-b border-slate-200/80 bg-white/85 px-5 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 print:hidden">
            <button
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium dark:border-slate-700"
              onClick={() =>
                updateSettings({
                  darkMode: !settings.darkMode,
                })
              }
            >
              {settings.darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </header>

          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
