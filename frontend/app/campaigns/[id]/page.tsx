"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BadgeIndianRupee, Building2, CalendarDays, CheckCircle2, Instagram, LinkIcon, PencilLine, RotateCcw, Tag, Ticket } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/page-state";
import { ProductImage } from "@/components/product-image";
import { ProtectedRoute } from "@/components/protected-route";
import { StatusBadge } from "@/components/status-badge";
import { useToast } from "@/components/toast-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { formatCommission, formatDate, formatRewardRule } from "@/lib/format";
import { getClientError } from "@/lib/form";
import type { Campaign, CampaignApplication } from "@/lib/types";

function applicationHelp(status: CampaignApplication["status"]) {
  if (status === "APPLIED") return "Your application is pending brand review. You can edit or withdraw it from your applications page.";
  if (status === "ACCEPTED") return "This application was accepted by the brand.";
  if (status === "REJECTED") return "This application was rejected and is now locked.";
  return "You withdrew this application, so it is no longer active.";
}

function acceptedCampaignMessage(application: CampaignApplication, campaign?: Campaign | null) {
  if (application.campaignStatus === "ARCHIVED" || campaign?.status === "ARCHIVED") {
    return "This campaign is no longer live. Please do not promote this coupon unless the brand makes the campaign live again.";
  }

  return "You can promote this campaign using your coupon code.";
}

function acceptedCampaignContext(application: CampaignApplication, campaign?: Campaign | null) {
  if (application.campaignStatus === "ARCHIVED" || campaign?.status === "ARCHIVED") {
    return "Your application was accepted earlier, but this campaign is currently archived, so the coupon is inactive.";
  }

  return "Create content and share this coupon code with your audience.";
}

export default function CampaignDetailsPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const currentApplication = useMemo(() => applications.find((application) => application.campaignId === params.id) || null, [applications, params.id]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [campaignResult, applicationsResult] = await Promise.allSettled([
        api.getCreatorCampaign(params.id),
        api.getCreatorApplications()
      ]);
      if (campaignResult.status === "fulfilled") {
        setCampaign(campaignResult.value);
      } else {
        setCampaign(null);
        setError(getClientError(campaignResult.reason, "Campaign not found"));
      }
      setApplications(applicationsResult.status === "fulfilled" ? applicationsResult.value : []);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { load(); }, [load]);

  async function apply(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const application = await api.applyToCampaign(params.id, message.trim());
      setApplications((items) => [application, ...items.filter((item) => item.applicationId !== application.applicationId)]);
      toast({ title: "Application submitted", description: "Your application is now with the brand.", variant: "success" });
      setMessage("");
    } catch (err) {
      toast({ title: "Unable to apply", description: getClientError(err, "Try again later"), variant: "error" });
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function withdrawApplication() {
    if (!currentApplication || !window.confirm("Are you sure you want to withdraw this application?")) return;

    setSaving(true);
    try {
      const updated = await api.withdrawCreatorApplication(currentApplication.applicationId);
      setApplications((items) => items.map((item) => item.applicationId === updated.applicationId ? updated : item));
      toast({ title: "Application withdrawn", variant: "success" });
    } catch (err) {
      toast({ title: "Unable to withdraw application", description: getClientError(err, "Try again later"), variant: "error" });
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute role="CREATOR">
      <AppShell>
        <section className="section space-y-6">
          <Button asChild variant="ghost" size="sm"><Link href="/campaigns">Back to campaigns</Link></Button>
          {loading ? <LoadingState label="Loading campaign..." /> : error ? <ErrorState message={error} onRetry={load} /> : !campaign ? <EmptyState title="Campaign unavailable" /> : (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <Card className="overflow-hidden">
                <div className="relative h-56 w-full overflow-hidden bg-secondary/45 sm:h-72 lg:h-[380px]"><ProductImage src={campaign.productImageUrl} alt={campaign.productName} category={campaign.category} variant="detail" /></div>
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
                    <div className="rounded-2xl border border-border/70 bg-white/70 p-3.5 shadow-sm"><CalendarDays className="mb-2 h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Published</p><p className="font-medium">{formatDate(campaign.createdAt)}</p></div>
                    <div className="rounded-2xl border border-border/70 bg-white/70 p-3.5 shadow-sm"><Building2 className="mb-2 h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Brand</p><p className="font-medium">{campaign.brandName || "Brand partner"}</p></div>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-white/70 p-4 shadow-sm">
                    <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /><h2 className="font-semibold">Brand details</h2></div>
                    <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                      <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{campaign.brandName || "Brand partner"}</p></div>
                      {campaign.brandCategory ? <div><p className="text-xs text-muted-foreground">Category</p><p className="font-medium">{campaign.brandCategory}</p></div> : null}
                      {campaign.brandInstagramHandle ? <div className="flex items-start gap-2"><Instagram className="mt-0.5 h-4 w-4 text-primary" /><div><p className="text-xs text-muted-foreground">Instagram</p><p className="font-medium">{campaign.brandInstagramHandle}</p></div></div> : null}
                      {campaign.brandWebsite ? <div className="flex items-start gap-2"><LinkIcon className="mt-0.5 h-4 w-4 text-primary" /><div><p className="text-xs text-muted-foreground">Website</p><a className="font-medium text-primary hover:underline" href={campaign.brandWebsite} target="_blank" rel="noreferrer">{campaign.brandWebsite}</a></div></div> : null}
                    </div>
                  </div>
                  <div><h2 className="font-semibold">Campaign brief</h2><p className="mt-2 whitespace-pre-line leading-7 text-muted-foreground">{campaign.description}</p></div>
                </CardContent>
              </Card>
              <Card className="sticky bottom-3 z-20 h-fit lg:top-24">
                {currentApplication ? (
                  <>
                    <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" />Application submitted</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl border border-border/70 bg-white/70 p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold">Status</span><StatusBadge status={currentApplication.status} /></div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{applicationHelp(currentApplication.status)}</p>
                        <p className="mt-3 text-xs text-muted-foreground">Applied {formatDate(currentApplication.appliedAt)} · Updated {formatDate(currentApplication.updatedAt)}</p>
                      </div>
                      {currentApplication.message ? <div className="rounded-2xl bg-secondary/45 p-3 text-sm text-muted-foreground"><p className="font-medium text-foreground">Your message</p><p className="mt-1 line-clamp-4 whitespace-pre-line">{currentApplication.message}</p></div> : null}
                      {currentApplication.status === "ACCEPTED" && currentApplication.couponCode ? <div className="rounded-2xl border border-primary/15 bg-primary/5 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><Ticket className="h-4 w-4 text-primary" /><span className="font-semibold text-primary">Coupon code: {currentApplication.couponCode}</span><Badge variant="default">ACCEPTED</Badge>{currentApplication.campaignStatus === "ARCHIVED" || campaign.status === "ARCHIVED" ? <Badge variant="outline">CAMPAIGN ARCHIVED</Badge> : null}<Badge variant={currentApplication.couponStatus === "INACTIVE" ? "outline" : "default"}>COUPON {currentApplication.couponStatus || "ACTIVE"}</Badge></div><p className="mt-2 text-muted-foreground">{formatRewardRule(currentApplication.campaignCommissionType, currentApplication.campaignCommissionValue)}</p>{currentApplication.brandInstructions ? <p className="mt-2 whitespace-pre-line text-muted-foreground">{currentApplication.brandInstructions}</p> : null}<p className="mt-2 text-muted-foreground">{acceptedCampaignMessage(currentApplication, campaign)}</p><p className="mt-1 text-muted-foreground">{acceptedCampaignContext(currentApplication, campaign)}</p></div> : null}
                      {currentApplication.status === "REJECTED" ? <div className="rounded-2xl bg-secondary/45 p-3 text-sm text-muted-foreground"><span className="font-medium text-foreground">Brand message: </span>{currentApplication.rejectionReason || "The brand did not add a reason."}</div> : null}
                      {currentApplication.status === "APPLIED" ? (
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                          <Button asChild variant="outline"><Link href="/creator/applications?status=APPLIED"><PencilLine className="h-4 w-4" />Edit message</Link></Button>
                          <Button variant="ghost" disabled={saving} onClick={withdrawApplication}><RotateCcw className="h-4 w-4" />{saving ? "Withdrawing..." : "Withdraw"}</Button>
                        </div>
                      ) : (
                        <div className="rounded-2xl bg-secondary/45 p-3 text-sm text-muted-foreground">This application is locked. You can browse other live campaigns while tracking this status.</div>
                      )}
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                        <Button asChild className="w-full"><Link href={`/creator/applications?status=${currentApplication.status}`}>View application</Link></Button>
                        {currentApplication.status !== "APPLIED" ? <Button asChild variant="outline" className="w-full"><Link href="/campaigns">Browse campaigns</Link></Button> : null}
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <>
                    <CardHeader><CardTitle>Apply to campaign</CardTitle></CardHeader>
                    <CardContent>
                      <form className="space-y-4" onSubmit={apply}>
                        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm"><span className="font-medium">{formatCommission(campaign.commissionType, campaign.commissionValue)}</span><p className="mt-1 text-muted-foreground">Share a short note about why you are a good fit.</p></div>
                        <div className="space-y-2"><Label htmlFor="message">Message</Label><Textarea id="message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Mention your audience, content style, or relevant experience." /></div>
                        <Button className="w-full" disabled={saving}>{saving ? "Applying..." : "Apply now"}</Button>
                      </form>
                    </CardContent>
                  </>
                )}
              </Card>
            </div>
          )}
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
