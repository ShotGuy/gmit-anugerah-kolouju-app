import { cn } from "@/lib/utils";

const buttonVariants = {
  variant: {
    default:
      "bg-blue-600 text-white shadow hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200",
    destructive:
      "bg-red-600 text-white shadow hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors duration-200",
    outline:
      "border border-gray-300 bg-white shadow hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors duration-200",
    secondary:
      "bg-gray-100 text-gray-900 shadow hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 transition-colors duration-200",
    ghost:
      "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:text-gray-200 transition-colors duration-200",
    link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200",
  },
  size: {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9",
  },
};

function Button({
  className,
  variant = "default",
  size = "default",
  href,
  children,
  isLoading = false,
  loadingText,
  disabled,
  onClick,
  ...props
}) {
  const variantClass =
    buttonVariants.variant[variant] || buttonVariants.variant.default;
  const sizeClass = buttonVariants.size[size] || buttonVariants.size.default;

  const baseClassName = cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 disabled:pointer-events-none disabled:opacity-50",
    variantClass,
    sizeClass,
    className
  );

  const isDisabled = disabled || isLoading;

  const content = isLoading ? (
    <>
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          fill="currentColor"
        />
      </svg>
      {loadingText || children}
    </>
  ) : (
    children
  );

  if (href && !isDisabled) {
    return (
      <a className={baseClassName} href={href} onClick={onClick} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      className={baseClassName}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );
}

export { Button };
