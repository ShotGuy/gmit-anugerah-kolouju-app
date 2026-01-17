import { cn } from "@/lib/utils";

export function Heading({ level = 2, className, ...props }) {
  const tags = {
    1: "h1",
    2: "h2",
    3: "h3",
    4: "h4",
    5: "h5",
    6: "h6",
  };
  const Tag = tags[level] || "h2";

  return (
    <Tag
      className={cn(
        "font-bold text-neutral",
        level === 1 && "text-3xl",
        level === 2 && "text-2xl",
        level === 3 && "text-xl",
        level === 4 && "text-lg",
        level === 5 && "text-base",
        level === 6 && "text-sm",
        className
      )}
      {...props}
    />
  );
}
