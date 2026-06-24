"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, BadgeIndianRupee, CheckCircle2, ClipboardList, Compass, FileText, Tag, UserRoundCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { DashboardCard } from "@/components/dashboard-card";
import { EmptyState, ErrorState, InlineEmptyState, LoadingState } from "@/components/page-state";
import { ProductImage } from "@/components/product-image";
import { ProtectedRoute } from "@/components/protected-route";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCommission, formatDate } from "@/lib/format";
import { getClientError } from "@/lib/form";
import { getCreatorProfileCompletion } from "@/lib/profile";
import { ApiClientError, api } from "@/lib/api";
import type { Campaign, CampaignApplication, CreatorProfile } from "@/lib/types";

export default function CreatorDashboardPage() {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileMissing, setProfileMissing] = useState(false);

  const accepted = applications.filter((application) => application.status === "ACCEPTED").length;
  const pending = applications.filter((application) => application.status === "APPLIED").length;
  const appliedCampaignIds = useMemo(() => new Set(applications.map((application) => application.campaignId)), [applications]);
  const suggestedCampaigns = campaigns.filter((campaign) => !appliedCampaignIds.has(campaign.id)).slice(0, 3);
  const recentApplications = applications.slice(0, 3);
  const completion = getCreatorProfileCompletion(profile || {});
  const profileComplete = completion.percentage === 100;
  const profileCtaLabel = profileComplete ? "View profile" : "Complete profile";
  const profileCtaIcon = profileComplete ? BadgeCheck : UserRoundCheck;
  const ProfileCtaIcon = profileCtaIcon;
  const profileChecklist = ["Instagram handle", "Follower count", "Category", "Bio", "City"];
  const nextAction = accepted > 0
    ? { title: `${accepted} accepted ${accepted === 1 ? "application" : "applications"}`, description: "A brand has approved your application. Review the campaign and plan your next step.", href: "/creator/applications?status=ACCEPTED", label: "View accepted" }
    : pending > 0
      ? { title: `${pending} application${pending === 1 ? "" : "s"} pending review`, description: "Your submissions are with brands. Keep browsing while you wait for a response.", href: "/creator/applications?status=APPLIED", label: "Track applications" }
      : campaigns.length > 0
        ? { title: "Live campaigns are ready", description: "You have open campaigns available. Pick one that fits your audience and apply.", href: "/campaigns", label: "Apply to campaigns" }
        : { title: "No live campaigns right now", description: "Check back soon. Published campaigns will appear here automatically.", href: "/campaigns", label: "Browse campaigns" };

  async function load() {
    setLoading(true);
    setError("");
    setProfileMissing(false);
    try {
      const [profileResult, campaignsResult, applicationsResult] = await Promise.allSettled([
        api.getCreatorProfile(),
        api.getCreatorCampaigns(),
        api.getCreatorApplications()
      ]);

      const missingProfile = profileResult.status === "rejected" && profileResult.reason instanceof ApiClientError && profileResult.reason.status === 404;

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value);
      } else if (missingProfile) {
        setProfile(null);
        setProfileMissing(true);
      } else {
        setError(getClientError(profileResult.reason, "Unable to load creator profile"));
      }

      setCampaigns(campaignsResult.status === "fulfilled" ? campaignsResult.value : []);
      setApplications(applicationsResult.status === "fulfilled" ? applicationsResult.value : []);

      if (campaignsResult.status === "rejected") {
        setError(getClientError(campaignsResult.reason, "Unable to load dashboard"));
      }
      if (applicationsResult.status === "rejected" && !missingProfile) {
        setError(getClientError(applicationsResult.reason, "Unable to load dashboard"));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <ProtectedRoute role="CREATOR" requireProfile>
      <AppShell>
        <section className="section space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">Creator workspace</p>
              <h1 className="text-3xl font-semibold tracking-normal">Creator dashboard</h1>
              <p className="max-w-2xl text-muted-foreground">Browse live campaigns, track applications, and keep your profile ready for brand review.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild><Link href="/campaigns"><Compass className="h-4 w-4" />Browse campaigns</Link></Button>
              <Button asChild variant="outline"><Link href="/creator/profile"><ProfileCtaIcon className="h-4 w-4" />{profileCtaLabel}</Link></Button>
            </div>
          </div>

          {loading ? <LoadingState label="Loading dashboard..." /> : error ? <ErrorState message={error} onRetry={load} /> : profileMissing ? (
            <Card className="border-primary/15 bg-primary/5">
              <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] lg:items-center">
                <div className="space-y-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <UserRoundCheck className="h-6 w-6" />
                  </span>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">Complete your creator profile</h2>
                    <p className="max-w-2xl leading-7 text-muted-foreground">Brands need your Instagram handle, follower count, category, city, and bio before they can review your applications.</p>
                    <p className="text-sm text-muted-foreground">You can browse campaigns now, but you’ll need a profile before applying.</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button asChild><Link href="/creator/profile">Create creator profile</Link></Button>
                    <Button asChild variant="outline"><Link href="/campaigns">Browse campaigns</Link></Button>
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
              {!profileComplete ? <EmptyState title="Profile not completed" description={`Your creator profile is ${completion.percentage}% complete. Complete the checklist to make applications stronger.`} action={<Button asChild variant="outline"><Link href="/creator/profile">Complete profile</Link></Button>} /> : null}

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardCard label="Available campaigns" value={campaigns.length} helper="Live campaigns open now" icon={Compass} href="/campaigns" />
                <DashboardCard label="Applications submitted" value={applications.length} helper="Across all campaigns" icon={ClipboardList} tone="muted" href="/creator/applications" />
                <DashboardCard label="Accepted applications" value={accepted} helper="Approved by brands" icon={BadgeCheck} tone="success" href="/creator/applications?status=ACCEPTED" />
                <DashboardCard label="Pending applications" value={pending} helper="Awaiting brand action" icon={FileText} tone="warning" href="/creator/applications?status=APPLIED" />
              </div>

              <Card className="border-primary/15 bg-primary/5">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-primary">Next best action</p>
                    <h2 className="text-xl font-semibold">{nextAction.title}</h2>
                    <p className="max-w-2xl text-sm text-muted-foreground">{nextAction.description}</p>
                  </div>
                  <Button asChild className="shrink-0"><Link href={nextAction.href}>{nextAction.label}<ArrowRight className="h-4 w-4" /></Link></Button>
                </CardContent>
              </Card>

              <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div><h2 className="text-xl font-semibold">Recommended campaigns</h2><p className="text-sm text-muted-foreground">Live opportunities you have not applied to yet.</p></div>
                    <Button asChild variant="outline" size="sm"><Link href="/campaigns">View all</Link></Button>
                  </div>
                  {suggestedCampaigns.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                      {suggestedCampaigns.map((campaign) => (
                        <Link key={campaign.id} href={`/campaigns/${campaign.id}`} className="group block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                          <Card className="h-full overflow-hidden transition-colors hover:border-primary/30">
                            <div className="relative aspect-[16/10] bg-secondary/55">
                              <ProductImage src={campaign.productImageUrl} alt={campaign.productName} category={campaign.category} variant="card" />
                              <div className="absolute left-3 top-3"><StatusBadge status={campaign.status} /></div>
                            </div>
                            <CardContent className="flex min-h-[230px] flex-col gap-3 p-4">
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-primary">{campaign.brandName || "Brand partner"}</p>
                                <h3 className="line-clamp-2 text-lg font-semibold leading-snug group-hover:text-primary">{campaign.title}</h3>
                                <p className="line-clamp-1 text-sm text-muted-foreground">{campaign.productName}</p>
                              </div>
                              <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{campaign.description}</p>
                              <div className="mt-auto flex flex-wrap gap-2 text-xs">
                                <Badge variant="secondary"><Tag className="mr-1 h-3.5 w-3.5" />{campaign.category}</Badge>
                                <Badge variant="outline"><BadgeIndianRupee className="mr-1 h-3.5 w-3.5" />{formatCommission(campaign.commissionType, campaign.commissionValue)}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : campaigns.length > 0 ? (
                    <EmptyState
                      title="You’ve applied to all currently available campaigns."
                      description="New live campaigns will show here when brands publish more opportunities."
                      action={<div className="flex flex-col gap-2 sm:flex-row"><Button asChild variant="outline"><Link href="/campaigns">Browse campaigns</Link></Button><Button asChild><Link href="/creator/applications">View my applications</Link></Button></div>}
                    />
                  ) : (
                    <EmptyState title="No live campaigns yet" description="Published brand campaigns will appear here as soon as they are available." action={<Button asChild variant="outline"><Link href="/campaigns">Browse campaigns</Link></Button>} />
                  )}
                </div>

                <div className="space-y-6">
                  {!profileComplete ? (
                    <Card>
                      <CardHeader><CardTitle>Profile readiness</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm"><span className="font-medium">Completion</span><span className="text-muted-foreground">{completion.percentage}%</span></div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-white/80 ring-1 ring-border/60"><div className="h-full rounded-full bg-primary" style={{ width: `${completion.percentage}%` }} /></div>
                        </div>
                        <div className="grid gap-2">
                          {profileChecklist.map((item) => {
                            const done = !completion.missingFields.includes(item);
                            return (
                              <div key={item} className="flex items-center gap-2 rounded-xl border border-border/70 bg-white/70 px-3 py-2 text-sm">
                                <CheckCircle2 className={done ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground/55"} />
                                <span className={done ? "font-medium text-foreground" : "text-muted-foreground"}>{item}</span>
                              </div>
                            );
                          })}
                        </div>
                        <Button asChild variant="outline" className="w-full"><Link href="/creator/profile">Complete profile</Link></Button>
                      </CardContent>
                    </Card>
                  ) : null}

                  <Card>
                    <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"><CardTitle>Recent applications</CardTitle><Button asChild variant="outline" size="sm"><Link href="/creator/applications">View all</Link></Button></CardHeader>
                    <CardContent className="space-y-3">
                      {recentApplications.length === 0 ? <InlineEmptyState title="No applications yet" description="Apply to a live campaign and your submissions will appear here." action={<Button asChild variant="outline" size="sm"><Link href="/campaigns">Find campaigns</Link></Button>} /> : recentApplications.map((item) => (
                        <Link key={item.applicationId} href={`/creator/applications?status=${item.status}`} className="block rounded-2xl border border-border/70 bg-white/70 p-3.5 shadow-sm transition-colors hover:border-primary/30 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                          <div className="flex items-start justify-between gap-3"><p className="font-medium leading-snug">{item.campaignTitle}</p><StatusBadge status={item.status} /></div>
                          <p className="mt-1 text-sm text-muted-foreground">{item.brandName || "Brand partner"} · Applied {formatDate(item.appliedAt)}</p>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
