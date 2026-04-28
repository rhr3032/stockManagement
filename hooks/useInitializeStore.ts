"use client";

import { useEffect, useRef } from "react";
import { usePOSStore } from "@/store/useStore";
import { useAuthStore } from "@/store/useAuthStore";

export function useInitializeStore() {
  const hydrated = usePOSStore((state) => state.hydrated);
  const setHydrated = usePOSStore((state) => state.setHydrated);
  const updateProducts = usePOSStore((state) => state.setProducts);
  const updateCustomers = usePOSStore((state) => state.setCustomers);
  const token = useAuthStore((state) => state.token);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current || hydrated || !token) return;
    hasInitialized.current = true;

    const initializeData = async () => {
      try {
        // Load products
        const productsRes = await fetch("/api/product/list?limit=1000", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          if (productsData.data?.products) {
            updateProducts(productsData.data.products);
          }
        }

        // Load customers
        const customersRes = await fetch("/api/customer/list?limit=1000", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (customersRes.ok) {
          const customersData = await customersRes.json();
          if (customersData.data?.customers) {
            updateCustomers(customersData.data.customers);
          }
        }

        setHydrated(true);
      } catch (error) {
        console.error("Failed to initialize store:", error);
        setHydrated(true);
      }
    };

    initializeData();
  }, [hydrated, token, setHydrated, updateProducts, updateCustomers]);
}
