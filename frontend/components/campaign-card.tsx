import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, Tag } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCommission } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/lib/types";

type CampaignCardProps = {
  campaign: Campaign;
  brandName?: string;
  actionHref?: string;
  actionLabel?: string;
  secondaryAction?: React.ReactNode;
  meta?: React.ReactNode;
  compact?: boolean;
};

export function CampaignCard({ campaign, brandName, actionHref, actionLabel = "View details", secondaryAction, meta, compact = false }: CampaignCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className={cn("grid", compact ? "md:grid-cols-[190px_1fr]" : "sm:grid-cols-[220px_1fr]")}> 
        <div className="relative min-h-52 overflow-hidden bg-secondary/55 sm:min-h-full">
<ProductImage src={campaign.productImageUrl} alt={campaign.productName} category={campaign.category} variant="card" className="absolute inset-0" fallbackClassName="absolute inset-0 min-h-52" />
          <div className="absolute left-3 top-3">
            <StatusBadge status={campaign.status} />
          </div>
        </div>
        <CardContent className="flex h-full flex-col gap-4 p-5 md:p-6">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-primary">{brandName || campaign.brandName || "Brand partner"}</p>
            <h3 className="line-clamp-2 text-xl font-semibold leading-snug text-foreground">{campaign.title}</h3>
            <p className="text-sm font-medium text-muted-foreground">{campaign.productName}</p>
          </div>
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{campaign.description}</p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/70 px-3 py-1 font-semibold text-secondary-foreground"><Tag className="h-3.5 w-3.5" />{campaign.category}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary"><BadgeIndianRupee className="h-3.5 w-3.5" />{formatCommission(campaign.commissionType, campaign.commissionValue)}</span>
          </div>
          {meta ? <div className="text-sm leading-6 text-muted-foreground">{meta}</div> : null}
          <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {actionHref ? <Button asChild variant="outline" size="sm"><Link href={actionHref}>{actionLabel}<ArrowRight className="h-4 w-4" /></Link></Button> : <span />}
            {secondaryAction ? <div className="flex flex-wrap gap-2">{secondaryAction}</div> : null}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
