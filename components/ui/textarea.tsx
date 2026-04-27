import { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({
  label,
  className,
  children,
  ...props
}: TextareaProps) {
  return (
    <label className="grid gap-1.5 text-sm text-slate-700 dark:text-slate-200">
      {label ? <span className="font-medium">{label}</span> : null}
      <textarea
        className={cn(
          "min-h-20 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-500",
          className
        )}
        {...props}
      >
        {children}
      </textarea>
    </label>
  );
}
