import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm text-slate-700 dark:text-slate-200">
      {label ? <span className="font-medium">{label}</span> : null}
      <input
        id={id}
        className={cn(
          "h-10 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-500",
          className
        )}
        {...props}
      />
    </label>
  );
}
