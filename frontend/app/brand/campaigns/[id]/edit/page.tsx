"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, ExternalLink, Send } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { BrandCampaignForm, type BrandCampaignFormValues, type BrandCampaignSubmitPayload } from "@/components/brand-campaign-form";
import { EmptyState, ErrorState, LoadingState } from "@/components/page-state";
import { ProtectedRoute } from "@/components/protected-route";
import { StatusBadge } from "@/components/status-badge";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, ApiClientError } from "@/lib/api";
import { getClientError } from "@/lib/form";
import type { Campaign } from "@/lib/types";

export default function BrandCampaignEditPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyAction, setBusyAction] = useState<"publish" | "archive" | null>(null);

  const initialValues = useMemo<Partial<BrandCampaignFormValues> | undefined>(() => {
    if (!campaign) return undefined;
    return {
      title: campaign.title,
      productName: campaign.productName,
      description: campaign.description,
      category: campaign.category,
      commissionType: campaign.commissionType,
      commissionValue: String(campaign.commissionValue)
    };
  }, [campaign]);

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

  async function saveCampaign(payload: BrandCampaignSubmitPayload, intent: string) {
    if (intent === "publish" && !payload.productImage && !campaign?.productImageUrl) {
      toast({ title: "Product image required", description: "Please upload a product image before publishing.", variant: "error" });
      return;
    }

    setSaving(true);
    if (intent === "publish") setBusyAction("publish");
    try {
      const updated = await api.updateBrandCampaign(params.id, payload);
      if (intent === "publish") {
        const published = await api.publishBrandCampaign(updated.id);
        setCampaign(published);
        toast({ title: campaign?.status === "ARCHIVED" ? "Campaign is live again" : "Campaign published", variant: "success" });
        return;
      }
      setCampaign(updated);
      toast({ title: campaign?.status === "DRAFT" ? "Draft saved" : "Campaign updated", variant: "success" });
    } catch (err) {
      toast({ title: intent === "publish" ? campaign?.status === "ARCHIVED" ? "Unable to make campaign live" : "Unable to publish" : "Unable to save campaign", description: getClientError(err, "Try again later"), variant: "error" });
    } finally {
      setSaving(false);
      setBusyAction(null);
    }
  }

  async function archiveCampaign() {
    if (!campaign) return;
    if (!window.confirm("Are you sure you want to archive this campaign?")) return;

    setBusyAction("archive");
    try {
      const updated = await api.archiveBrandCampaign(campaign.id);
      setCampaign(updated);
      toast({ title: "Campaign archived", variant: "success" });
    } catch (err) {
      toast({ title: "Unable to archive", description: getClientError(err, "Try again later"), variant: "error" });
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <ProtectedRoute role="BRAND" requireProfile>
      <AppShell>
        <section className="section space-y-6">
          <Button asChild variant="ghost" size="sm"><Link href="/brand/campaigns">Back to campaigns</Link></Button>
          {loading ? <LoadingState label="Loading campaign..." /> : statusCode === 403 ? <EmptyState title="Access denied" description="You do not have permission to edit this campaign." action={<Button asChild variant="outline"><Link href="/brand/campaigns">Back to campaigns</Link></Button>} /> : statusCode === 404 ? <EmptyState title="Campaign not found" description="This campaign may have been removed or belongs to another brand." action={<Button asChild variant="outline"><Link href="/brand/campaigns">Back to campaigns</Link></Button>} /> : error ? <ErrorState message={error} onRetry={load} /> : campaign ? (
            <Card>
              <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                <div><CardTitle>Edit campaign</CardTitle><CardDescription>Update campaign details or replace the product image. Existing image stays unchanged unless you select a new file.</CardDescription></div>
                <StatusBadge status={campaign.status} />
              </CardHeader>
              <CardContent>
                <BrandCampaignForm
                  initialValues={initialValues}
                  existingImageUrl={campaign.productImageUrl}
                  status={campaign.status}
                  submitLabel={campaign.status === "DRAFT" ? "Save as draft" : "Save changes"}
                  submitting={saving}
                  onSubmit={saveCampaign}
                  actions={(
                    <>
                      {campaign.status === "DRAFT" || campaign.status === "ARCHIVED" ? <Button data-intent="publish" variant="outline" disabled={busyAction === "publish" || saving}><Send className="h-4 w-4" />{busyAction === "publish" ? "Working..." : campaign.status === "ARCHIVED" ? "Make live again" : "Publish"}</Button> : null}
                      {campaign.status === "DRAFT" || campaign.status === "LIVE" ? <Button type="button" variant="ghost" disabled={busyAction === "archive" || saving} onClick={archiveCampaign}><Archive className="h-4 w-4" />{busyAction === "archive" ? "Archiving..." : "Archive"}</Button> : null}
                      <Button asChild type="button" variant="outline"><Link href={`/brand/campaigns/${campaign.id}`}><ExternalLink className="h-4 w-4" />View preview</Link></Button>
                      <Button asChild type="button" variant="outline"><Link href="/brand/campaigns">Cancel</Link></Button>
                    </>
                  )}
                />
              </CardContent>
            </Card>
          ) : null}
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
