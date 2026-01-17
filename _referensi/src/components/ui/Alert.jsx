import { cn } from "@/lib/utils";

export function Alert({ className, variant = "info", ...props }) {
  const variants = {
    info: "alert-info",
    success: "alert-success", 
    warning: "alert-warning",
    error: "alert-error",
  };

  return (
    <div
      className={cn("alert", variants[variant], className)}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }) {
  return (
    <div
      className={cn("text-sm", className)}
      {...props}
    />
  );
}