"use client";

import { useEffect, useRef } from "react";
import { usePOSStore } from "@/store/useStore";

export function useInitializeStore() {
  const hydrated = usePOSStore((state) => state.hydrated);
  const setHydrated = usePOSStore((state) => state.setHydrated);
  const setProducts = usePOSStore((state) => state.setProducts);
  const setCustomers = usePOSStore((state) => state.setCustomers);
  const updateSettings = usePOSStore((state) => state.updateSettings);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current || hydrated) return;
    hasInitialized.current = true;

    const initializeData = async () => {
      try {
        // Load products
        const productsRes = await fetch("/api/product/list?limit=1000");

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          if (productsData.data?.products) {
            setProducts(productsData.data.products);
          }
        }

        // Load customers
        const customersRes = await fetch("/api/customer/list?limit=1000");

        if (customersRes.ok) {
          const customersData = await customersRes.json();
          if (customersData.data?.customers) {
            setCustomers(customersData.data.customers);
          }
        }

        // Load settings
        const settingsRes = await fetch("/api/settings");

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.data) {
            updateSettings({
              businessName: settingsData.data.shopName || "My POS Shop",
              address: settingsData.data.address || "Dhaka, Bangladesh",
              phone: settingsData.data.phone || "+8801XXXXXXXXX",
              vatPercent: settingsData.data.vatPercent || 5,
              currency: settingsData.data.currency || "BDT",
              paperSize: settingsData.data.paperSize || "58mm",
            });
          }
        }

        setHydrated(true);
      } catch (error) {
        console.error("Failed to initialize store:", error);
        setHydrated(true);
      }
    };

    initializeData();
  }, [hydrated, setHydrated, setProducts, setCustomers, updateSettings]);
}
