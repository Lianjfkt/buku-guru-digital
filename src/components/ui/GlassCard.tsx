import React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  solid?: boolean;
  hoverEffect?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, solid = false, hoverEffect = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          solid ? "glass-solid" : "glass-panel",
          "rounded-2xl p-4 sm:p-6 transition-all duration-200",
          hoverEffect && "hover:shadow-lg hover:-translate-y-0.5 hover:border-brand-500/30",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

