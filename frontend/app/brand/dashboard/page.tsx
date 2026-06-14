"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, FilePlus2, Inbox, Layers3, Megaphone, Radio, Store } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DashboardCard } from "@/components/dashboard-card";
import { EmptyState, ErrorState, InlineEmptyState, LoadingState } from "@/components/page-state";
import { ProtectedRoute } from "@/components/protected-route";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiClientError, api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { getClientError } from "@/lib/form";
import type { BrandApplication, BrandProfile, Campaign } from "@/lib/types";

export default function BrandDashboardPage() {
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<BrandApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileMissing, setProfileMissing] = useState(false);

  const totalCampaigns = campaigns.length;
  const live = campaigns.filter((campaign) => campaign.status === "LIVE").length;
  const draft = campaigns.filter((campaign) => campaign.status === "DRAFT").length;
  const waitingApplications = applications.filter((application) => application.status === "APPLIED").length;
  const recentCampaigns = useMemo(() => [...campaigns].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4), [campaigns]);
  const recentApplications = useMemo(() => [...applications].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()).slice(0, 4), [applications]);
  const profileChecklist = ["Brand name", "Website", "Instagram handle", "Category", "Description"];

  async function load() {
    setLoading(true);
    setError("");
    setProfileMissing(false);
    try {
      const [profileResult, campaignsResult] = await Promise.allSettled([api.getBrandProfile(), api.getBrandCampaigns()]);
      const missingProfile = profileResult.status === "rejected" && profileResult.reason instanceof ApiClientError && profileResult.reason.status === 404;
      const nextCampaigns = campaignsResult.status === "fulfilled" ? campaignsResult.value : [];

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value);
      } else if (missingProfile) {
        setProfile(null);
        setProfileMissing(true);
      } else {
        setError(getClientError(profileResult.reason, "Unable to load brand profile"));
      }

      setCampaigns(nextCampaigns);
      if (campaignsResult.status === "fulfilled" && nextCampaigns.length > 0) {
        const applicationResults = await Promise.allSettled(nextCampaigns.map((campaign) => api.getBrandApplications(campaign.id)));
        setApplications(applicationResults.flatMap((result) => result.status === "fulfilled" ? result.value : []));
      } else {
        setApplications([]);
      }
      if (campaignsResult.status === "rejected" && !missingProfile) setError(getClientError(campaignsResult.reason, "Unable to load dashboard"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <ProtectedRoute role="BRAND">
      <AppShell>
        <section className="section space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">Brand workspace</p>
              <h1 className="text-3xl font-semibold tracking-normal">{profile?.brandName || "Brand dashboard"}</h1>
              <p className="max-w-2xl text-muted-foreground">A quick overview of your campaigns and creator application activity.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline"><Link href="/brand/campaigns">Manage campaigns</Link></Button>
              <Button asChild><Link href="/brand/campaigns/new"><FilePlus2 className="h-4 w-4" />Create campaign</Link></Button>
            </div>
          </div>

          {loading ? <LoadingState label="Loading dashboard..." /> : error ? <ErrorState message={error} onRetry={load} /> : profileMissing ? (
            <Card className="border-primary/15 bg-primary/5">
              <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] lg:items-center">
                <div className="space-y-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Store className="h-6 w-6" />
                  </span>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">Create your brand profile</h2>
                    <p className="max-w-2xl leading-7 text-muted-foreground">Creators need to understand your brand before applying to your campaigns. Add your brand name, category, website, Instagram, and description.</p>
                    <p className="text-sm text-muted-foreground">Complete your brand profile first to make your campaigns more trustworthy.</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button asChild><Link href="/brand/profile">Create brand profile</Link></Button>
                    <Button asChild variant="outline"><Link href="/brand/campaigns/new">Create campaign</Link></Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  {profileChecklist.map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-xl border border-border/70 bg-white/70 px-3 py-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground/55" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {!profile ? <EmptyState title="Profile not completed" description="Create your brand profile before publishing campaigns or reviewing applications." action={<Button asChild variant="outline"><Link href="/brand/profile">Complete profile</Link></Button>} /> : null}

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardCard label="Total campaigns" value={totalCampaigns} helper="Draft, live, and archived" icon={Layers3} href="/brand/campaigns?filter=all" />
                <DashboardCard label="Live campaigns" value={live} helper="Visible to creators" icon={Radio} tone="success" href="/brand/campaigns?filter=live" />
                <DashboardCard label="Draft campaigns" value={draft} helper="Ready to refine and publish" icon={Megaphone} tone="warning" href="/brand/campaigns?filter=drafts" />
                <DashboardCard label="Applications received" value={applications.length} helper="Across all campaigns" icon={Inbox} tone="muted" href="/brand/campaigns?filter=needs-review" />
              </div>

              {totalCampaigns === 0 ? (
                <EmptyState
                  title="Create your first campaign"
                  description="Start with a product, commission, image, and short campaign brief."
                  action={<Button asChild><Link href="/brand/campaigns/new">Create campaign</Link></Button>}
                />
              ) : waitingApplications > 0 ? (
                <Card className="border-primary/15 bg-primary/5">
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <AlertCircle className="h-5 w-5" />
                      </span>
                      <div className="space-y-1">
                        <h2 className="text-base font-semibold">You have {waitingApplications} application{waitingApplications === 1 ? "" : "s"} waiting for review</h2>
                        <p className="text-sm text-muted-foreground">Accept or reject pending creators so they know where they stand.</p>
                      </div>
                    </div>
                    <Button asChild size="sm" className="shrink-0">
                      <Link href="/brand/campaigns?filter=needs-review">Review applicants</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : null}

              <div className="grid gap-6 xl:grid-cols-2">
                <Card>
                  <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"><CardTitle>Recent campaigns</CardTitle><Button asChild variant="outline" size="sm"><Link href="/brand/campaigns">View all</Link></Button></CardHeader>
                  <CardContent className="space-y-3">
                    {recentCampaigns.length === 0 ? <InlineEmptyState title="No campaign activity" description="Create your first draft to see updates here." action={<Button asChild size="sm" variant="outline"><Link href="/brand/campaigns/new">Create campaign</Link></Button>} /> : recentCampaigns.map((campaign) => (
                      <Link key={campaign.id} href={`/brand/campaigns/${campaign.id}/edit`} className="block rounded-2xl border border-border/70 bg-white/70 p-3.5 shadow-sm transition-colors hover:border-primary/30 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <div className="flex items-start justify-between gap-3"><p className="font-medium leading-snug">{campaign.title}</p><StatusBadge status={campaign.status} /></div>
                        <p className="mt-1 text-sm text-muted-foreground">{campaign.productName} · Updated {formatDate(campaign.updatedAt)}</p>
                      </Link>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"><CardTitle>Recent applicants</CardTitle><Button asChild variant="outline" size="sm"><Link href="/brand/campaigns?filter=needs-review">Manage</Link></Button></CardHeader>
                  <CardContent className="space-y-3">
                    {recentApplications.length === 0 ? <InlineEmptyState title="No applicants yet" description="Applications will appear here once creators apply to your live campaigns." /> : recentApplications.map((application) => (
                      <Link key={application.applicationId} href={application.status === "APPLIED" ? "/brand/campaigns?filter=needs-review" : "/brand/campaigns?filter=all"} className="block rounded-2xl border border-border/70 bg-white/70 p-3.5 shadow-sm transition-colors hover:border-primary/30 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <div className="flex items-start justify-between gap-3"><p className="font-medium leading-snug">{application.creatorName}</p><StatusBadge status={application.status} /></div>
                        <p className="mt-1 text-sm text-muted-foreground">{application.campaignTitle} · {formatDate(application.appliedAt)}</p>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
