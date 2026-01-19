import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumb?: BreadcrumbItem[];
    className?: string;
    children?: React.ReactNode;
}

export default function PageHeader({
    title,
    description,
    breadcrumb,
    className,
    children,
}: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-4 pb-4 md:flex-row md:items-center md:justify-between border-b mb-6", className)}>
            <div className="space-y-1.5">
                {breadcrumb && breadcrumb.length > 0 && (
                    <nav className="flex items-center flex-wrap text-sm text-muted-foreground mb-2">
                        {breadcrumb.map((item, index) => (
                            <div key={index} className="flex items-center">
                                {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
                                {item.href ? (
                                    <Link
                                        href={item.href}
                                        className="hover:text-foreground transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span className="font-medium text-foreground">{item.label}</span>
                                )}
                            </div>
                        ))}
                    </nav>
                )}
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-muted-foreground">{description}</p>
                )}
            </div>
            {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
    );
}
