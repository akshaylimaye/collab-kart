import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus, CampaignStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: CampaignStatus | ApplicationStatus }) {
  const warning = status === "DRAFT" || status === "PENDING_REVIEW" || status === "APPLIED";
  const outline = status === "ARCHIVED" || status === "REJECTED";
  return <Badge variant={warning ? "warning" : outline ? "outline" : "default"}>{status.replace("_", " ")}</Badge>;
}
