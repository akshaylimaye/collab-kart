"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Archive, BadgeIndianRupee, Check, ExternalLink, FilePlus2, PencilLine, Tag, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, InlineEmptyState, LoadingState } from "@/components/page-state";
import { ProductImage } from "@/components/product-image";
import { ProtectedRoute } from "@/components/protected-route";
import { StatusBadge } from "@/components/status-badge";
import { useToast } from "@/components/toast-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatCommission, formatDate } from "@/lib/format";
import { getClientError } from "@/lib/form";
import type { ApplicationStatus, BrandApplication, Campaign, CampaignStatus } from "@/lib/types";

const CAMPAIGN_TABS: Array<{ label: string; value: CampaignStatus | "ALL"; href: string }> = [
  { label: "All", value: "ALL", href: "/brand/campaigns" },
  { label: "Draft", value: "DRAFT", href: "/brand/campaigns?status=DRAFT" },
  { label: "Live", value: "LIVE", href: "/brand/campaigns?status=LIVE" },
  { label: "Archived", value: "ARCHIVED", href: "/brand/campaigns?status=ARCHIVED" }
];

const APPLICATION_TABS: Array<{ label: string; value: ApplicationStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Applied", value: "APPLIED" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Withdrawn", value: "WITHDRAWN" }
];

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
  const [busyId, setBusyId] = useState<string | null>(null);
  const [applicationBusyId, setApplicationBusyId] = useState<string | null>(null);

  const requestedStatus = searchParams.get("status") as CampaignStatus | null;
  const activeStatus: CampaignStatus | "ALL" = requestedStatus && ["DRAFT", "LIVE", "ARCHIVED"].includes(requestedStatus) ? requestedStatus : "ALL";
  const openApplications = searchParams.get("tab") === "applications";
  const filteredCampaigns = activeStatus === "ALL" ? campaigns : campaigns.filter((campaign) => campaign.status === activeStatus);
  const applicationsByCampaign = useMemo(() => applications.reduce<Record<string, number>>((acc, application) => {
    acc[application.campaignId] = (acc[application.campaignId] || 0) + 1;
    return acc;
  }, {}), [applications]);
  const selectedCampaign = campaigns.find((campaign) => campaign.id === selectedCampaignId) || campaigns[0];
  const selectedApplications = useMemo(() => selectedCampaign ? applications.filter((application) => application.campaignId === selectedCampaign.id) : [], [applications, selectedCampaign]);
  const applicationCounts = useMemo(() => selectedApplications.reduce<Record<string, number>>((acc, application) => {
    acc.ALL += 1;
    acc[application.status] += 1;
    return acc;
  }, { ALL: 0, APPLIED: 0, ACCEPTED: 0, REJECTED: 0, WITHDRAWN: 0 }), [selectedApplications]);
  const visibleApplications = applicationFilter === "ALL" ? selectedApplications : selectedApplications.filter((application) => application.status === applicationFilter);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const nextCampaigns = await api.getBrandCampaigns();
      setCampaigns(nextCampaigns);
      setSelectedCampaignId((current) => current && nextCampaigns.some((campaign) => campaign.id === current) ? current : nextCampaigns[0]?.id || null);
      const applicationResults = await Promise.allSettled(nextCampaigns.map((campaign) => api.getBrandApplications(campaign.id)));
      setApplications(applicationResults.flatMap((result) => result.status === "fulfilled" ? result.value : []));
    } catch (err) {
      setError(getClientError(err, "Unable to load campaigns"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (openApplications && selectedCampaignId) document.getElementById("applications")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [openApplications, selectedCampaignId]);

  function selectApplications(campaignId: string) {
    setSelectedCampaignId(campaignId);
    setApplicationFilter("ALL");
    document.getElementById("applications")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function archive(id: string) {
    if (!window.confirm("Are you sure you want to archive this campaign?")) return;
    setBusyId(id);
    try {
      await api.archiveBrandCampaign(id);
      toast({ title: "Campaign archived", variant: "success" });
      await load();
    } catch (err) {
      toast({ title: "Unable to archive", description: getClientError(err, "Try again later"), variant: "error" });
    } finally {
      setBusyId(null);
    }
  }

  async function processApplication(applicationId: string, action: "accept" | "reject") {
    setApplicationBusyId(applicationId);
    try {
      const updated = action === "accept" ? await api.acceptBrandApplication(applicationId) : await api.rejectBrandApplication(applicationId);
      setApplications((items) => items.map((item) => item.applicationId === updated.applicationId ? updated : item));
      toast({ title: action === "accept" ? "Application accepted" : "Application rejected", variant: "success" });
    } catch (err) {
      toast({ title: "Unable to update application", description: getClientError(err, "Try again later"), variant: "error" });
    } finally {
      setApplicationBusyId(null);
    }
  }

  return (
    <ProtectedRoute role="BRAND">
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

          {loading ? <LoadingState label="Loading campaigns..." /> : error ? <ErrorState message={error} onRetry={load} /> : (
            <>
              <div className="flex flex-wrap gap-2">
                {CAMPAIGN_TABS.map((tab) => (
                  <Button key={tab.value} asChild variant={activeStatus === tab.value ? "secondary" : "outline"} size="sm"><Link href={tab.href}>{tab.label}</Link></Button>
                ))}
              </div>

              {campaigns.length === 0 ? <EmptyState title="No campaigns yet" description="Create a product campaign draft and publish it when the details are ready." action={<Button asChild><Link href="/brand/campaigns/new">Create Campaign</Link></Button>} /> : filteredCampaigns.length === 0 ? <EmptyState title="No campaigns found" description="No campaigns match this status filter." action={<Button asChild variant="outline"><Link href="/brand/campaigns">View all campaigns</Link></Button>} /> : (
                <div className="grid gap-4">
                  {filteredCampaigns.map((campaign) => (
                    <Card key={campaign.id} className="overflow-hidden">
                      <CardContent className="grid gap-4 p-4 lg:grid-cols-[180px_1fr]">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary/55 lg:aspect-square"><ProductImage src={campaign.productImageUrl} alt={campaign.productName} /></div>
                        <div className="min-w-0 space-y-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0 space-y-1">
                              <p className="text-sm font-medium text-primary">{campaign.brandName || "Your brand"}</p>
                              <h2 className="line-clamp-2 text-xl font-semibold leading-snug">{campaign.title}</h2>
                              <p className="text-sm text-muted-foreground">{campaign.productName}</p>
                            </div>
                            <StatusBadge status={campaign.status} />
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/70 px-3 py-1 font-semibold text-secondary-foreground"><Tag className="h-3.5 w-3.5" />{campaign.category}</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary"><BadgeIndianRupee className="h-3.5 w-3.5" />{formatCommission(campaign.commissionType, campaign.commissionValue)}</span>
                            <Badge variant="outline">{applicationsByCampaign[campaign.id] || 0} applications</Badge>
                            <Badge variant="outline">Updated {formatDate(campaign.updatedAt)}</Badge>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            <Button asChild size="sm" variant="outline"><Link href={`/brand/campaigns/${campaign.id}`}><ExternalLink className="h-4 w-4" />View</Link></Button>
                            <Button asChild size="sm"><Link href={`/brand/campaigns/${campaign.id}/edit`}><PencilLine className="h-4 w-4" />Edit</Link></Button>
                            <Button size="sm" variant={selectedCampaign?.id === campaign.id ? "secondary" : "outline"} onClick={() => selectApplications(campaign.id)}>Applicants</Button>
                            {campaign.status !== "ARCHIVED" ? <Button size="sm" variant="ghost" disabled={busyId === campaign.id} onClick={() => archive(campaign.id)}><Archive className="h-4 w-4" />{busyId === campaign.id ? "Archiving..." : "Archive"}</Button> : null}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <Card id="applications" className="scroll-mt-24">
                <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                  <div><CardTitle>{selectedCampaign ? `Applicants: ${selectedCampaign.title}` : "Applicants"}</CardTitle><p className="mt-1 text-sm text-muted-foreground">Review creator applications for the selected campaign.</p></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {APPLICATION_TABS.map((tab) => <Button key={tab.value} size="sm" variant={applicationFilter === tab.value ? "secondary" : "outline"} onClick={() => setApplicationFilter(tab.value)}>{tab.label}<span className="ml-1 rounded-full bg-white/60 px-1.5 py-0.5 text-[11px]">{applicationCounts[tab.value]}</span></Button>)}
                  </div>
                  {!selectedCampaign ? <InlineEmptyState title="No campaign selected" description="Select a campaign to view applicants." /> : selectedApplications.length === 0 ? <InlineEmptyState title="No applicants yet" description="Applications will appear here once creators apply to this campaign." /> : visibleApplications.length === 0 ? <InlineEmptyState title="No applicants match this filter" description="Switch filters to view other application statuses." /> : (
                    <div className="grid gap-3">
                      {visibleApplications.map((application) => {
                        const canProcess = application.status === "APPLIED";
                        return (
                          <div key={application.applicationId} className="rounded-2xl border border-border/70 bg-white/70 p-4 shadow-sm">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div className="space-y-1"><p className="font-semibold leading-snug">{application.creatorName}</p><p className="text-sm text-muted-foreground">{application.creatorInstagramHandle || "Instagram not added"} · {(application.creatorFollowerCount || 0).toLocaleString("en-IN")} followers</p><p className="text-sm text-muted-foreground">{application.creatorCategory || "Category not added"}</p></div>
                              <StatusBadge status={application.status} />
                            </div>
                            {application.message ? <p className="mt-3 rounded-2xl bg-secondary/45 p-3 text-sm leading-6 text-muted-foreground">{application.message}</p> : null}
                            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-xs text-muted-foreground">Applied {formatDate(application.appliedAt)}</p>
                              {canProcess ? <div className="flex flex-wrap gap-2"><Button size="sm" disabled={applicationBusyId === application.applicationId} onClick={() => processApplication(application.applicationId, "accept")}><Check className="h-4 w-4" />Accept</Button><Button size="sm" variant="outline" disabled={applicationBusyId === application.applicationId} onClick={() => processApplication(application.applicationId, "reject")}><X className="h-4 w-4" />Reject</Button></div> : <p className="text-sm text-muted-foreground">{processedMessage(application.status)}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
