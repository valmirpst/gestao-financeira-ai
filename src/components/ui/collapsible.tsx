import { cn } from "@/lib/utils";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { forwardRef } from "react";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>
>(({ className, ...props }, ref) => {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      ref={ref}
      className={cn(
        "data-[state=open]:animate-fade-in-0 data-[state=closed]:animate-fade-out-0",
        className,
      )}
      {...props}
    />
  );
});

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
