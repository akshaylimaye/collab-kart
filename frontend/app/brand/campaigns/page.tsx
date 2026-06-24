"use client";

import Link from "next/link";
import { KeyboardEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Archive, BadgeIndianRupee, Check, ExternalLink, FilePlus2, Instagram, PencilLine, Send, Store, Tag, UsersRound, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, InlineEmptyState, LoadingState } from "@/components/page-state";
import { ProductImage } from "@/components/product-image";
import { ProfileAvatar } from "@/components/profile-image";
import { ProtectedRoute } from "@/components/protected-route";
import { StatusBadge } from "@/components/status-badge";
import { useToast } from "@/components/toast-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiClientError, api } from "@/lib/api";
import { formatCommission, formatDate, formatRewardRule } from "@/lib/format";
import { getClientError } from "@/lib/form";
import type { ApplicationStatus, BrandApplication, Campaign, CampaignStatus } from "@/lib/types";

type CampaignFilter = "needs-review" | "live" | "drafts" | "archived" | "all";

const CAMPAIGN_TABS: Array<{ label: string; value: CampaignFilter; href: string }> = [
  { label: "Needs review", value: "needs-review", href: "/brand/campaigns?filter=needs-review" },
  { label: "Live", value: "live", href: "/brand/campaigns?filter=live" },
  { label: "Drafts", value: "drafts", href: "/brand/campaigns?filter=drafts" },
  { label: "Archived", value: "archived", href: "/brand/campaigns?filter=archived" },
  { label: "All", value: "all", href: "/brand/campaigns?filter=all" }
];

function normalizeCampaignFilter(filter: string | null, legacyStatus: string | null, legacyTab: string | null): CampaignFilter {
  if (filter === "needs-review" || filter === "live" || filter === "drafts" || filter === "archived" || filter === "all") return filter;
  if (legacyTab === "applications") return "needs-review";
  if (legacyStatus === "DRAFT") return "drafts";
  if (legacyStatus === "ARCHIVED") return "archived";
  if (legacyStatus === "ALL") return "all";
  return "live";
}

const APPLICATION_TABS: Array<{ label: string; value: ApplicationStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Applied", value: "APPLIED" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Withdrawn", value: "WITHDRAWN" }
];


function normalizeInstagramUrl(value?: string | null) {
  const raw = value?.trim();
  if (!raw) return null;
  const looksLikeUrl = raw.startsWith("http://") || raw.startsWith("https://") || raw.includes("instagram.com");
  if (!looksLikeUrl) return cleanInstagramHandle(raw);

  try {
    const withProtocol = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    const url = new URL(withProtocol);
    if (!url.hostname.replace(/^www\./, "").includes("instagram.com")) return null;
    const handle = url.pathname.split("/").filter(Boolean)[0];
    return cleanInstagramHandle(handle);
  } catch {
    return null;
  }
}

function cleanInstagramHandle(value?: string | null) {
  const handle = value?.trim().replace(/^@/, "").split(/[/?#]/)[0];
  if (!handle || !/^[A-Za-z0-9._]{1,30}$/.test(handle)) return null;
  return `https://instagram.com/${handle}`;
}

function codePrefix(value?: string | null, length = 2) {
  return (value || "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, length);
}

function suggestCouponCode(brandName?: string, creatorHandle?: string, creatorName?: string) {
  const brandPrefix = codePrefix(brandName, 2) || "CK";
  const creatorPrefix = codePrefix(creatorHandle, 4) || codePrefix(creatorName, 4) || "CR";
  const suffix = Math.floor(Math.random() * 90 + 10);
  return `${brandPrefix}${creatorPrefix}${suffix}`.slice(0, 12);
}


function canMakeLive(status: CampaignStatus) {
  return status === "DRAFT" || status === "ARCHIVED";
}

function canArchive(status: CampaignStatus) {
  return status === "DRAFT" || status === "LIVE";
}

function processedMessage(status: ApplicationStatus) {
  if (status === "ACCEPTED") return "Accepted. This application is locked for now.";
  if (status === "REJECTED") return "Rejected. This application is locked for now.";
  if (status === "WITHDRAWN") return "Withdrawn by creator. No brand action is available.";
  return "";
}

export default function BrandCampaignsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<BrandApplication[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [applicationFilter, setApplicationFilter] = useState<ApplicationStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileMissing, setProfileMissing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [applicationBusyId, setApplicationBusyId] = useState<string | null>(null);
  const [autoOpenedNeedsReview, setAutoOpenedNeedsReview] = useState(false);
  const [acceptingApplication, setAcceptingApplication] = useState<BrandApplication | null>(null);
  const [rejectingApplication, setRejectingApplication] = useState<BrandApplication | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [brandInstructions, setBrandInstructions] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const activeFilter = normalizeCampaignFilter(searchParams.get("filter"), searchParams.get("status"), searchParams.get("tab"));
  const totalApplicationsByCampaign = useMemo(() => applications.reduce<Record<string, number>>((acc, application) => {
    acc[application.campaignId] = (acc[application.campaignId] || 0) + 1;
    return acc;
  }, {}), [applications]);
  const pendingApplicationsByCampaign = useMemo(() => applications.reduce<Record<string, number>>((acc, application) => {
    if (application.status === "APPLIED") acc[application.campaignId] = (acc[application.campaignId] || 0) + 1;
    return acc;
  }, {}), [applications]);
  const filteredCampaigns = useMemo(() => campaigns.filter((campaign) => {
    if (activeFilter === "needs-review") return (pendingApplicationsByCampaign[campaign.id] || 0) > 0;
    if (activeFilter === "live") return campaign.status === "LIVE";
    if (activeFilter === "drafts") return campaign.status === "DRAFT";
    if (activeFilter === "archived") return campaign.status === "ARCHIVED";
    return true;
  }), [activeFilter, campaigns, pendingApplicationsByCampaign]);
  const campaignCounts = useMemo<Record<CampaignFilter, number>>(() => ({
    "needs-review": campaigns.filter((campaign) => (pendingApplicationsByCampaign[campaign.id] || 0) > 0).length,
    live: campaigns.filter((campaign) => campaign.status === "LIVE").length,
    drafts: campaigns.filter((campaign) => campaign.status === "DRAFT").length,
    archived: campaigns.filter((campaign) => campaign.status === "ARCHIVED").length,
    all: campaigns.length
  }), [campaigns, pendingApplicationsByCampaign]);
  const selectedCampaign = campaigns.find((campaign) => campaign.id === selectedCampaignId) || null;
  const selectedApplications = useMemo(() => selectedCampaign ? applications.filter((application) => application.campaignId === selectedCampaign.id) : [], [applications, selectedCampaign]);
  const applicationCounts = useMemo(() => selectedApplications.reduce<Record<ApplicationStatus | "ALL", number>>((acc, application) => {
    acc.ALL += 1;
    acc[application.status] += 1;
    return acc;
  }, { ALL: 0, APPLIED: 0, ACCEPTED: 0, REJECTED: 0, WITHDRAWN: 0 }), [selectedApplications]);
  const visibleApplications = applicationFilter === "ALL" ? selectedApplications : selectedApplications.filter((application) => application.status === applicationFilter);

  async function load() {
    setLoading(true);
    setError("");
    setProfileMissing(false);
    try {
      const nextCampaigns = await api.getBrandCampaigns();
      setCampaigns(nextCampaigns);
      setSelectedCampaignId((current) => current && nextCampaigns.some((campaign) => campaign.id === current) ? current : null);
      const applicationResults = await Promise.allSettled(nextCampaigns.map((campaign) => api.getBrandApplications(campaign.id)));
      setApplications(applicationResults.flatMap((result) => result.status === "fulfilled" ? result.value : []));
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setCampaigns([]);
        setApplications([]);
        setSelectedCampaignId(null);
        setProfileMissing(true);
      } else {
        setError(getClientError(err, "Unable to load campaigns"));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    setAutoOpenedNeedsReview(false);
  }, [activeFilter]);

  useEffect(() => {
    if (activeFilter === "needs-review" && !autoOpenedNeedsReview && filteredCampaigns.length === 1) {
      setSelectedCampaignId(filteredCampaigns[0].id);
      setApplicationFilter("APPLIED");
      setAutoOpenedNeedsReview(true);
    }
  }, [activeFilter, autoOpenedNeedsReview, filteredCampaigns]);

  useEffect(() => {
    if (!selectedCampaign) return;
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedCampaign]);

  function openDrawer(campaignId: string, filter: ApplicationStatus | "ALL" = "ALL") {
    setSelectedCampaignId(campaignId);
    setApplicationFilter(filter);
  }

  function closeDrawer() {
    setSelectedCampaignId(null);
    setApplicationFilter("ALL");
  }

  function onCampaignKeyDown(event: KeyboardEvent<HTMLElement>, campaignId: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDrawer(campaignId);
    }
  }

  function stopPropagation(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
  }

  function updateCampaignState(updated: Campaign) {
    setCampaigns((items) => items.map((item) => item.id === updated.id ? updated : item));
  }

  function updateCouponStatusForCampaign(campaignId: string, couponStatus: "ACTIVE" | "INACTIVE") {
    setApplications((items) => items.map((item) => item.campaignId === campaignId && item.status === "ACCEPTED" && item.couponCode ? {
      ...item,
      couponStatus,
      couponDisabledAt: couponStatus === "INACTIVE" ? new Date().toISOString() : undefined
    } : item));
  }

  async function archive(id: string) {
    if (!window.confirm("Are you sure you want to archive this campaign?")) return;
    setBusyId(id);
    try {
      const updated = await api.archiveBrandCampaign(id);
      updateCampaignState(updated);
      updateCouponStatusForCampaign(id, "INACTIVE");
      toast({ title: "Campaign archived", description: "Accepted creator coupon codes are now inactive.", variant: "success" });
    } catch (err) {
      toast({ title: "Unable to archive", description: getClientError(err, "Try again later"), variant: "error" });
    } finally {
      setBusyId(null);
    }
  }

  async function publish(id: string) {
    const campaign = campaigns.find((item) => item.id === id);
    setBusyId(id);
    try {
      const updated = await api.publishBrandCampaign(id);
      updateCampaignState(updated);
      if (campaign?.status === "ARCHIVED") updateCouponStatusForCampaign(id, "ACTIVE");
      toast({ title: campaign?.status === "ARCHIVED" ? "Campaign is live again" : "Campaign published", variant: "success" });
    } catch (err) {
      toast({ title: campaign?.status === "ARCHIVED" ? "Unable to make campaign live" : "Unable to publish", description: getClientError(err, "Try again later"), variant: "error" });
    } finally {
      setBusyId(null);
    }
  }

  function openAcceptDialog(application: BrandApplication) {
    setAcceptingApplication(application);
    setCouponCode(suggestCouponCode(selectedCampaign?.brandName, application.creatorInstagramHandle, application.creatorName));
    setBrandInstructions("");
  }

  function openRejectDialog(application: BrandApplication) {
    setRejectingApplication(application);
    setRejectionReason("");
  }

  async function acceptApplication() {
    if (!acceptingApplication) return;
    setApplicationBusyId(acceptingApplication.applicationId);
    try {
      const updated = await api.acceptBrandApplication(acceptingApplication.applicationId, {
        couponCode,
        brandInstructions: brandInstructions.trim() || undefined
      });
      setApplications((items) => items.map((item) => item.applicationId === updated.applicationId ? updated : item));
      toast({ title: "Application accepted", description: "Coupon code assigned to the creator.", variant: "success" });
      setAcceptingApplication(null);
    } catch (err) {
      toast({ title: "Unable to accept application", description: getClientError(err, "Try again later"), variant: "error" });
    } finally {
      setApplicationBusyId(null);
    }
  }

  async function rejectApplication() {
    if (!rejectingApplication) return;
    setApplicationBusyId(rejectingApplication.applicationId);
    try {
      const updated = await api.rejectBrandApplication(rejectingApplication.applicationId, {
        rejectionReason: rejectionReason.trim() || undefined
      });
      setApplications((items) => items.map((item) => item.applicationId === updated.applicationId ? updated : item));
      toast({ title: "Application rejected", variant: "success" });
      setRejectingApplication(null);
    } catch (err) {
      toast({ title: "Unable to reject application", description: getClientError(err, "Try again later"), variant: "error" });
    } finally {
      setApplicationBusyId(null);
    }
  }

  return (
    <ProtectedRoute role="BRAND" requireProfile>
      <AppShell>
        <section className="section space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">Campaign management</p>
              <h1 className="text-3xl font-semibold tracking-normal">Campaigns</h1>
              <p className="max-w-2xl text-muted-foreground">Manage drafts, live campaigns, archived campaigns, and creator applications from one place.</p>
            </div>
            <Button asChild><Link href="/brand/campaigns/new"><FilePlus2 className="h-4 w-4" />Create Campaign</Link></Button>
          </div>

          {loading ? <LoadingState label="Loading campaigns..." /> : error ? <ErrorState message={error} onRetry={load} /> : profileMissing ? (
            <EmptyState title="Create your brand profile first" description="Add your brand details before managing campaigns." action={<Button asChild><Link href="/brand/profile"><Store className="h-4 w-4" />Create brand profile</Link></Button>} />
          ) : (
            <>
              <div className="flex flex-wrap gap-2 overflow-x-visible">
                {CAMPAIGN_TABS.map((tab) => (
                  <Button key={tab.value} asChild variant={activeFilter === tab.value ? "secondary" : "outline"} size="sm">
                    <Link href={tab.href}>{tab.label}<span className="ml-1 rounded-full bg-white/60 px-1.5 py-0.5 text-[11px]">{campaignCounts[tab.value]}</span></Link>
                  </Button>
                ))}
              </div>

              {campaigns.length === 0 ? <EmptyState title="No campaigns yet" description="Create a product campaign draft and publish it when the details are ready." action={<Button asChild><Link href="/brand/campaigns/new">Create Campaign</Link></Button>} /> : filteredCampaigns.length === 0 ? <EmptyState title={activeFilter === "needs-review" ? "No applicants need review" : "No campaigns found"} description={activeFilter === "needs-review" ? "Campaigns with pending APPLIED applicants will appear here." : "No campaigns match this filter."} action={<Button asChild variant="outline"><Link href="/brand/campaigns?filter=all">View all campaigns</Link></Button>} /> : (
                <div className="grid gap-4">
                  {filteredCampaigns.map((campaign) => {
                    const totalApplications = totalApplicationsByCampaign[campaign.id] || 0;
                    const pendingApplications = pendingApplicationsByCampaign[campaign.id] || 0;
                    return (
                    <Card key={campaign.id} role="button" tabIndex={0} onClick={() => openDrawer(campaign.id)} onKeyDown={(event) => onCampaignKeyDown(event, campaign.id)} className="group cursor-pointer overflow-hidden transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <CardContent className="grid gap-4 p-4 lg:grid-cols-[180px_1fr]">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary/55 lg:aspect-square"><ProductImage src={campaign.productImageUrl} alt={campaign.productName} category={campaign.category} variant="thumbnail" /></div>
                        <div className="min-w-0 space-y-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0 space-y-1">
                              <p className="text-sm font-medium text-primary">{campaign.brandName || "Your brand"}</p>
                              <h2 className="line-clamp-2 text-xl font-semibold leading-snug group-hover:text-primary">{campaign.title}</h2>
                              <p className="text-sm text-muted-foreground">{campaign.productName}</p>
                            </div>
                            <StatusBadge status={campaign.status} />
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/70 px-3 py-1 font-semibold text-secondary-foreground"><Tag className="h-3.5 w-3.5" />{campaign.category}</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary"><BadgeIndianRupee className="h-3.5 w-3.5" />{formatCommission(campaign.commissionType, campaign.commissionValue)}</span>
                            <Badge variant="outline">{totalApplications} application{totalApplications === 1 ? "" : "s"}</Badge>
                            {pendingApplications > 0 ? <Badge variant="warning"><UsersRound className="mr-1 h-3.5 w-3.5" />{pendingApplications} need{pendingApplications === 1 ? "s" : ""} review</Badge> : null}
                            <Badge variant="outline">Updated {formatDate(campaign.updatedAt)}</Badge>
                          </div>
                          <div className="grid gap-2 sm:flex sm:flex-wrap" onClick={stopPropagation}>
                            <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => openDrawer(campaign.id)}><ExternalLink className="h-4 w-4" />View details</Button>
                            <Button asChild size="sm" className="w-full sm:w-auto"><Link href={"/brand/campaigns/" + campaign.id + "/edit"}><PencilLine className="h-4 w-4" />Edit</Link></Button>
                            <Button size="sm" className="w-full sm:w-auto" variant={pendingApplications > 0 ? "default" : "outline"} onClick={() => openDrawer(campaign.id, pendingApplications > 0 ? "APPLIED" : "ALL")}>{pendingApplications > 0 ? "Review applicants" : "Applicants"}</Button>
                            {canMakeLive(campaign.status) ? <Button size="sm" variant="outline" className="w-full sm:w-auto" disabled={busyId === campaign.id} onClick={() => publish(campaign.id)}><Send className="h-4 w-4" />{busyId === campaign.id ? "Working..." : campaign.status === "ARCHIVED" ? "Make live again" : "Publish"}</Button> : null}
                            {canArchive(campaign.status) ? <Button size="sm" variant="ghost" className="w-full sm:w-auto" disabled={busyId === campaign.id} onClick={() => archive(campaign.id)}><Archive className="h-4 w-4" />{busyId === campaign.id ? "Working..." : "Archive"}</Button> : null}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>

        {selectedCampaign ? (
          <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden bg-slate-950/35 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="campaign-drawer-title" onClick={closeDrawer}>
            <div className="flex h-full w-full max-w-3xl min-w-0 flex-col overflow-hidden bg-background shadow-2xl sm:w-[min(92vw,48rem)] md:rounded-l-3xl" onClick={(event) => event.stopPropagation()}>
              <div className="flex min-w-0 items-start justify-between gap-3 border-b border-border/70 bg-white/85 p-4 md:gap-4 md:p-6">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium text-primary">Selected campaign</p>
                  <h2 id="campaign-drawer-title" className="line-clamp-2 text-xl font-semibold tracking-normal sm:text-2xl">{selectedCampaign.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedCampaign.productName}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" className="h-10 w-10 p-0" aria-label="Close campaign details" onClick={closeDrawer}><X className="h-5 w-5" /></Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="space-y-6">
                  <Card className="overflow-hidden">
                    <div className="relative aspect-video bg-secondary/55"><ProductImage src={selectedCampaign.productImageUrl} alt={selectedCampaign.productName} category={selectedCampaign.category} variant="detail" /></div>
                    <CardContent className="space-y-4 p-4 sm:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <h3 className="text-xl font-semibold">{selectedCampaign.title}</h3>
                          <p className="text-sm text-muted-foreground">{selectedCampaign.description}</p>
                        </div>
                        <StatusBadge status={selectedCampaign.status} />
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <Badge variant="secondary"><Tag className="mr-1 h-3.5 w-3.5" />{selectedCampaign.category}</Badge>
                        <Badge variant="outline"><BadgeIndianRupee className="mr-1 h-3.5 w-3.5" />{formatCommission(selectedCampaign.commissionType, selectedCampaign.commissionValue)}</Badge>
                        <Badge variant="outline">Created {formatDate(selectedCampaign.createdAt)}</Badge>
                        <Badge variant="outline">Updated {formatDate(selectedCampaign.updatedAt)}</Badge>
                      </div>
                      <div className="grid gap-2 sm:flex sm:flex-wrap">
                        <Button asChild size="sm" className="w-full sm:w-auto"><Link href={"/brand/campaigns/" + selectedCampaign.id + "/edit"}><PencilLine className="h-4 w-4" />Edit</Link></Button>
                        {canMakeLive(selectedCampaign.status) ? <Button size="sm" variant="outline" className="w-full sm:w-auto" disabled={busyId === selectedCampaign.id} onClick={() => publish(selectedCampaign.id)}><Send className="h-4 w-4" />{busyId === selectedCampaign.id ? "Working..." : selectedCampaign.status === "ARCHIVED" ? "Make live again" : "Publish"}</Button> : null}
                        {canArchive(selectedCampaign.status) ? <Button size="sm" variant="outline" className="w-full sm:w-auto" disabled={busyId === selectedCampaign.id} onClick={() => archive(selectedCampaign.id)}><Archive className="h-4 w-4" />{busyId === selectedCampaign.id ? "Working..." : "Archive"}</Button> : null}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                      <div><CardTitle>Applicants</CardTitle><p className="mt-1 text-sm text-muted-foreground">Creator applications for this campaign appear here.</p></div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {APPLICATION_TABS.map((tab) => <Button key={tab.value} size="sm" variant={applicationFilter === tab.value ? "secondary" : "outline"} onClick={() => setApplicationFilter(tab.value)}>{tab.label}<span className="ml-1 rounded-full bg-white/60 px-1.5 py-0.5 text-[11px]">{applicationCounts[tab.value]}</span></Button>)}
                      </div>
                      {selectedApplications.length === 0 ? <InlineEmptyState title="No applicants yet" description="Creator applications for this campaign will appear here." /> : visibleApplications.length === 0 ? <InlineEmptyState title="No applicants match this filter" description="Switch filters to view other application statuses." /> : (
                        <div className="grid gap-3">
                          {visibleApplications.map((application) => {
                            const canProcess = application.status === "APPLIED" && selectedCampaign.status !== "ARCHIVED";
                            const instagramUrl = normalizeInstagramUrl(application.creatorInstagramHandle);
                            return (
                              <div key={application.applicationId} className="rounded-2xl border border-border/70 bg-white/70 p-4 shadow-sm">
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                  <div className="flex min-w-0 gap-3 overflow-hidden">
                                    <ProfileAvatar src={application.creatorProfileImageUrl} initials={application.creatorName} alt={application.creatorName} size="md" />
                                    <div className="min-w-0 space-y-1">
                                      <p className="font-semibold leading-snug">{application.creatorName}</p>
                                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                        {instagramUrl ? <a className="inline-flex items-center gap-1 font-medium text-primary hover:underline" href={instagramUrl} target="_blank" rel="noopener noreferrer"><Instagram className="h-3.5 w-3.5" />{application.creatorInstagramHandle}</a> : <span>Instagram not added</span>}
                                        <span>{(application.creatorFollowerCount || 0).toLocaleString("en-IN")} followers</span>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{application.creatorCategory || "Category not added"}{application.creatorCity ? ` · ${application.creatorCity}` : ""}</p>
                                    </div>
                                  </div>
                                  <StatusBadge status={application.status} />
                                </div>
                                {application.creatorBio ? <p className="mt-3 rounded-2xl bg-white/80 p-3 text-sm leading-6 text-muted-foreground">{application.creatorBio}</p> : null}
                                {application.message ? <p className="mt-3 rounded-2xl bg-secondary/45 p-3 text-sm leading-6 text-muted-foreground"><span className="font-medium text-foreground">Application message: </span>{application.message}</p> : null}
                                {application.status === "ACCEPTED" && application.couponCode ? <div className="mt-3 rounded-2xl border border-primary/15 bg-primary/5 p-3 text-sm"><p className="font-semibold text-primary">Coupon {application.couponCode}</p><p className="mt-1 text-muted-foreground">Status: {application.couponStatus || "ACTIVE"}</p>{application.brandInstructions ? <p className="mt-2 whitespace-pre-line text-muted-foreground">{application.brandInstructions}</p> : null}</div> : null}
                                {application.status === "REJECTED" ? <div className="mt-3 rounded-2xl bg-secondary/45 p-3 text-sm text-muted-foreground"><span className="font-medium text-foreground">Brand message: </span>{application.rejectionReason || "No reason added."}</div> : null}
                                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <p className="text-xs text-muted-foreground">Applied {formatDate(application.appliedAt)}</p>
                                  {canProcess ? <div className="grid gap-2 sm:flex sm:flex-wrap"><Button size="sm" className="w-full sm:w-auto" disabled={applicationBusyId === application.applicationId} onClick={() => openAcceptDialog(application)}><Check className="h-4 w-4" />Accept</Button><Button size="sm" variant="outline" className="w-full sm:w-auto" disabled={applicationBusyId === application.applicationId} onClick={() => openRejectDialog(application)}><X className="h-4 w-4" />Reject</Button></div> : <p className="text-sm text-muted-foreground">{selectedCampaign.status === "ARCHIVED" && application.status === "APPLIED" ? "This campaign is archived, so new decisions are closed." : processedMessage(application.status)}</p>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {acceptingApplication ? (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="accept-application-title" onClick={() => setAcceptingApplication(null)}>
            <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl bg-background p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">Accept creator</p>
                  <h3 id="accept-application-title" className="text-xl font-semibold">Assign coupon code</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{acceptingApplication.creatorName} will see this code and your instructions.</p>
                </div>
                <Button type="button" variant="ghost" size="sm" className="h-9 w-9 p-0" aria-label="Close accept dialog" onClick={() => setAcceptingApplication(null)}><X className="h-4 w-4" /></Button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm">
                  <p className="font-semibold text-primary">Reward rule</p>
                  <p className="mt-1 text-muted-foreground">{formatRewardRule(selectedCampaign?.commissionType || acceptingApplication.campaignCommissionType, selectedCampaign?.commissionValue || acceptingApplication.campaignCommissionValue)}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coupon-code">Coupon code</Label>
                  <Input id="coupon-code" value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12))} placeholder="BBAK47" />
                  <p className="text-xs text-muted-foreground">Required. Use 4-12 letters and numbers only. The code must be unique for your brand.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand-instructions">Brand instructions</Label>
                  <Textarea id="brand-instructions" value={brandInstructions} onChange={(event) => setBrandInstructions(event.target.value)} placeholder="Use this code in your reel caption and story. Ask buyers to apply it at checkout." />
                </div>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setAcceptingApplication(null)}>Cancel</Button>
                  <Button type="button" disabled={applicationBusyId === acceptingApplication.applicationId || couponCode.length < 4} onClick={acceptApplication}>{applicationBusyId === acceptingApplication.applicationId ? "Accepting..." : "Accept application"}</Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {rejectingApplication ? (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="reject-application-title" onClick={() => setRejectingApplication(null)}>
            <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl bg-background p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-primary">Reject application</p>
                  <h3 id="reject-application-title" className="text-xl font-semibold">Message to creator</h3>
                  <p className="mt-1 text-sm text-muted-foreground">This note is optional. The creator will see it with their rejected application.</p>
                </div>
                <Button type="button" variant="ghost" size="sm" className="h-9 w-9 p-0" aria-label="Close reject dialog" onClick={() => setRejectingApplication(null)}><X className="h-4 w-4" /></Button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-secondary/45 p-3 text-sm text-muted-foreground">Rejecting <span className="font-medium text-foreground">{rejectingApplication.creatorName}</span> for {selectedCampaign?.title || rejectingApplication.campaignTitle}.</div>
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Message to creator</Label>
                  <Textarea id="rejection-reason" value={rejectionReason} maxLength={500} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Optional: explain why this creator was not selected." />
                  <p className="text-right text-xs text-muted-foreground">{rejectionReason.length}/500</p>
                </div>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setRejectingApplication(null)}>Cancel</Button>
                  <Button type="button" variant="destructive" disabled={applicationBusyId === rejectingApplication.applicationId} onClick={rejectApplication}>{applicationBusyId === rejectingApplication.applicationId ? "Rejecting..." : "Reject application"}</Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </AppShell>
    </ProtectedRoute>
  );
}
