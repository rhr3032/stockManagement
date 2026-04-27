"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { safeJsonParse } from "@/lib/storage";

export function useLocalStorageState<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const initial = useMemo(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    return safeJsonParse<T>(window.localStorage.getItem(key), initialValue);
  }, [initialValue, key]);

  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
