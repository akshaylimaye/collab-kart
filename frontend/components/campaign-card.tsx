/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, ImageIcon, Tag } from "lucide-react";
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

export function CampaignCard({ campaign, brandName = "Brand partner", actionHref, actionLabel = "View details", secondaryAction, meta, compact = false }: CampaignCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className={cn("grid", compact ? "md:grid-cols-[180px_1fr]" : "sm:grid-cols-[200px_1fr]")}> 
        <div className="relative min-h-44 bg-secondary sm:min-h-full">
          {campaign.productImageUrl ? (
            <img className="absolute inset-0 h-full w-full object-cover" src={campaign.productImageUrl} alt={campaign.productName} />
          ) : (
            <div className="flex h-full min-h-44 flex-col items-center justify-center gap-2 bg-secondary text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
              <span className="text-xs font-medium uppercase tracking-wide">Product image</span>
            </div>
          )}
        </div>
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <p className="text-sm text-muted-foreground">{brandName}</p>
              <h3 className="line-clamp-2 text-lg font-semibold leading-snug">{campaign.title}</h3>
              <p className="text-sm font-medium text-muted-foreground">{campaign.productName}</p>
            </div>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{campaign.description}</p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 font-medium"><Tag className="h-3.5 w-3.5" />{campaign.category}</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 font-medium text-primary"><BadgeIndianRupee className="h-3.5 w-3.5" />{formatCommission(campaign.commissionType, campaign.commissionValue)}</span>
          </div>
          {meta ? <div className="text-sm text-muted-foreground">{meta}</div> : null}
          <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {actionHref ? <Button asChild variant="outline" size="sm"><Link href={actionHref}>{actionLabel}<ArrowRight className="h-4 w-4" /></Link></Button> : <span />}
            {secondaryAction ? <div className="flex flex-wrap gap-2">{secondaryAction}</div> : null}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
