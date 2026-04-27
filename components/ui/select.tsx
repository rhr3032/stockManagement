import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className, children, ...props }: SelectProps) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm text-slate-700 dark:text-slate-200">
      {label ? <span className="font-medium">{label}</span> : null}
      <select
        className={cn(
          "h-10 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-500",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
