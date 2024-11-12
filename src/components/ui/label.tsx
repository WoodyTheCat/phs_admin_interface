import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import * as Lucide from "lucide-react";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm flex gap-1 items-center font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants> & {
      icon?: React.ComponentType<any>;
      locked?: boolean;
    }
>(({ className, children, icon, locked, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  >
    {icon &&
      React.createElement<React.ComponentProps<typeof icon>>(icon, {
        size: 16,
      })}
    {children}
    {locked && <Lucide.Lock size={16} />}
  </LabelPrimitive.Root>
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
