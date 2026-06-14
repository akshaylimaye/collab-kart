import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DashboardCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "default",
  href,
  ariaLabel
}: {
  label: string;
  value: string | number;
  helper?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "muted";
  href?: string;
  ariaLabel?: string;
}) {
  const toneClass = {
    default: "bg-primary/10 text-primary ring-primary/10",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    warning: "bg-accent/55 text-accent-foreground ring-accent/70",
    muted: "bg-secondary/70 text-secondary-foreground ring-secondary"
  }[tone];

  const card = (
    <Card className={cn("overflow-hidden", href ? "transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_60px_-30px_rgba(15,118,110,0.42)]" : "")}>
      <CardContent className="flex items-start justify-between gap-4 p-5 md:p-6">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold leading-none text-foreground">{value}</p>
          {helper ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{helper}</p> : null}
        </div>
        {Icon ? <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1", toneClass)}><Icon className="h-5 w-5" /></span> : null}
      </CardContent>
    </Card>
  );

  if (!href) return card;

  return (
    <Link
      href={href}
      aria-label={ariaLabel || label}
      className="block rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {card}
    </Link>
  );
}

