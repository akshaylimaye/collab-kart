"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BadgeIndianRupee, Building2, CalendarDays, PencilLine, Tag } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/page-state";
import { ProductImage } from "@/components/product-image";
import { ProtectedRoute } from "@/components/protected-route";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, ApiClientError } from "@/lib/api";
import { formatCommission, formatDate } from "@/lib/format";
import { getClientError } from "@/lib/form";
import type { Campaign } from "@/lib/types";

export default function BrandCampaignPreviewPage({ params }: { params: { id: string } }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setStatusCode(null);
    try {
      setCampaign(await api.getBrandCampaign(params.id));
    } catch (err) {
      setCampaign(null);
      setStatusCode(err instanceof ApiClientError ? err.status : null);
      setError(getClientError(err, "Unable to load campaign"));
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  return (
    <ProtectedRoute role="BRAND" requireProfile>
      <AppShell>
        <section className="section space-y-6">
          <Button asChild variant="ghost" size="sm"><Link href="/brand/campaigns">Back to campaigns</Link></Button>
          {loading ? <LoadingState label="Loading campaign..." /> : statusCode === 403 ? <EmptyState title="Access denied" description="You do not have permission to view this campaign." action={<Button asChild variant="outline"><Link href="/brand/campaigns">Back to dashboard</Link></Button>} /> : statusCode === 404 ? <EmptyState title="Campaign not found" description="This campaign may have been removed or belongs to another brand." action={<Button asChild variant="outline"><Link href="/brand/campaigns">Back to dashboard</Link></Button>} /> : error ? <ErrorState message={error} onRetry={load} /> : campaign ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
              <Card className="overflow-hidden">
                <div className="relative h-56 w-full overflow-hidden bg-secondary/45 sm:h-72 lg:h-[360px]"><ProductImage src={campaign.productImageUrl} alt={campaign.productName} category={campaign.category} variant="detail" /></div>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2"><p className="text-sm text-muted-foreground">{campaign.brandName || "Brand partner"}</p><CardTitle className="text-2xl leading-tight">{campaign.title}</CardTitle><p className="text-muted-foreground">{campaign.productName}</p></div>
                    <StatusBadge status={campaign.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-border/70 bg-white/70 p-3.5 shadow-sm"><Tag className="mb-2 h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Category</p><p className="font-medium">{campaign.category}</p></div>
                    <div className="rounded-2xl border border-border/70 bg-white/70 p-3.5 shadow-sm"><BadgeIndianRupee className="mb-2 h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Commission</p><p className="font-medium">{formatCommission(campaign.commissionType, campaign.commissionValue)}</p></div>
                    <div className="rounded-2xl border border-border/70 bg-white/70 p-3.5 shadow-sm"><CalendarDays className="mb-2 h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Created</p><p className="font-medium">{formatDate(campaign.createdAt)}</p></div>
                    <div className="rounded-2xl border border-border/70 bg-white/70 p-3.5 shadow-sm"><Building2 className="mb-2 h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Brand</p><p className="font-medium">{campaign.brandName || "Brand partner"}</p></div>
                  </div>
                  <div><h2 className="font-semibold">Campaign brief</h2><p className="mt-2 whitespace-pre-line leading-7 text-muted-foreground">{campaign.description}</p></div>
                </CardContent>
              </Card>
              <Card className="h-fit lg:sticky lg:top-24">
                <CardHeader><CardTitle>Campaign management</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full"><Link href={`/brand/campaigns/${campaign.id}/edit`}><PencilLine className="h-4 w-4" />Edit campaign</Link></Button>
                  <Button asChild variant="outline" className="w-full"><Link href="/brand/campaigns">Manage applicants</Link></Button>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
