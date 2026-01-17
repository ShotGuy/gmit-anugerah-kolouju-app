import { cn } from "@/lib/utils";

export function Text({ size = "md", className, ...props }) {
  return (
    <p
      className={cn(
        "text-neutral",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-lg",
        className,
      )}
      {...props}
    />
  );
}
