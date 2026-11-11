import React from "react";
import { cn } from "@/lib/utils";

export interface GlassTableProps extends React.HTMLAttributes<HTMLTableElement> {
  wrapperClassName?: string;
}

export function GlassTable({
  className,
  wrapperClassName,
  children,
  ...props
}: GlassTableProps) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 glass-solid shadow-sm",
        wrapperClassName
      )}
    >
      <table className={cn("w-full text-left text-sm text-slate-700 dark:text-slate-300", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "bg-slate-50/80 dark:bg-slate-800/80 text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-700/80 font-semibold",
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableRow({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-slate-100 dark:border-slate-800/60 transition-colors hover:bg-brand-50/40 dark:hover:bg-slate-800/40 last:border-b-0",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableCell({
  className,
  children,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("p-3.5 align-middle", className)} {...props}>
      {children}
    </td>
  );
}

export function TableHeaderCell({
  className,
  children,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn("px-3.5 py-3 align-middle font-medium", className)} {...props}>
      {children}
    </th>
  );
}
