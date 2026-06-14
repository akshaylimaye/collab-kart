"use client";

import { KeyboardEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, BadgeIndianRupee, CalendarDays, Search, Tag } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/page-state";
import { ProductImage } from "@/components/product-image";
import { ProtectedRoute } from "@/components/protected-route";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import { formatCommission, formatDate } from "@/lib/format";
import { getClientError } from "@/lib/form";
import type { Campaign, CampaignApplication } from "@/lib/types";

type CreatorCampaignFilter = "ALL" | "OPEN" | "APPLIED" | "ACCEPTED";

const STATUS_FILTERS: { label: string; value: CreatorCampaignFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "Applied", value: "APPLIED" },
  { label: "Accepted", value: "ACCEPTED" }
];

export default function CampaignListPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<CreatorCampaignFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const applicationsByCampaign = useMemo(() => new Map(applications.map((application) => [application.campaignId, application])), [applications]);
  const categories = useMemo(() => Array.from(new Set(campaigns.map((campaign) => campaign.category).filter(Boolean))).sort(), [campaigns]);
  const categoryOptions = useMemo(() => [{ label: "All categories", value: "ALL" }, ...categories.map((item) => ({ label: item, value: item }))], [categories]);
  const filteredCampaigns = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      const application = applicationsByCampaign.get(campaign.id);
      const matchesCategory = category === "ALL" || campaign.category === category;
      const matchesStatus = statusFilter === "ALL"
        || (statusFilter === "OPEN" && !application)
        || (statusFilter === "APPLIED" && Boolean(application))
        || (statusFilter === "ACCEPTED" && application?.status === "ACCEPTED");
      const haystack = [campaign.title, campaign.productName, campaign.brandName, campaign.category, campaign.description].join(" ").toLowerCase();
      return matchesCategory && matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [applicationsByCampaign, campaigns, category, query, statusFilter]);

  const statusCounts = useMemo(() => ({
    ALL: campaigns.length,
    OPEN: campaigns.filter((campaign) => !applicationsByCampaign.has(campaign.id)).length,
    APPLIED: campaigns.filter((campaign) => applicationsByCampaign.has(campaign.id)).length,
    ACCEPTED: campaigns.filter((campaign) => applicationsByCampaign.get(campaign.id)?.status === "ACCEPTED").length
  }), [applicationsByCampaign, campaigns]);

  function openCampaign(id: string) {
    router.push(`/campaigns/${id}`);
  }

  function onCardKeyDown(event: KeyboardEvent<HTMLElement>, id: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCampaign(id);
    }
  }

  function stopAndOpen(event: MouseEvent<HTMLButtonElement>, href: string) {
    event.stopPropagation();
    router.push(href);
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [campaignsResult, applicationsResult] = await Promise.allSettled([api.getCreatorCampaigns(), api.getCreatorApplications()]);
      setCampaigns(campaignsResult.status === "fulfilled" ? campaignsResult.value : []);
      setApplications(applicationsResult.status === "fulfilled" ? applicationsResult.value : []);
      if (campaignsResult.status === "rejected") setError(getClientError(campaignsResult.reason, "Unable to load campaigns"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <ProtectedRoute role="CREATOR">
      <AppShell>
        <section className="section space-y-7">
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary">Campaign marketplace</p>
            <h1 className="text-3xl font-semibold tracking-normal">Live campaigns</h1>
            <p className="max-w-2xl text-muted-foreground">Explore brand campaigns that are currently open for creator applications.</p>
          </div>

          <div className="relative z-30 mb-3 overflow-visible rounded-3xl bg-white px-6 py-5 shadow-sm ring-1 ring-slate-200/70">
            <div className="flex w-full flex-col gap-4 md:flex-row md:items-center">
              <div className="relative w-full flex-1">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-4 text-base shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by campaign, brand, product, or category" />
              </div>
              <Select value={category} options={categoryOptions} onValueChange={setCategory} aria-label="Filter by category" className="md:w-80" placeholder="All categories" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <Button key={filter.value} type="button" size="sm" variant={statusFilter === filter.value ? "secondary" : "outline"} onClick={() => setStatusFilter(filter.value)}>
                {filter.label}
                <span className="ml-1 rounded-full bg-white/70 px-1.5 py-0.5 text-[11px] text-muted-foreground">{statusCounts[filter.value]}</span>
              </Button>
            ))}
          </div>

          <div className="relative z-0 pt-2 md:pt-3">
          {loading ? <LoadingState label="Loading campaigns..." /> : error ? <ErrorState message={error} onRetry={load} /> : campaigns.length === 0 ? <EmptyState title="No campaigns yet" description="There are no live campaigns right now. Published brand campaigns will appear here as soon as they are available." /> : filteredCampaigns.length === 0 ? <EmptyState title="No campaigns found" description="Try clearing filters or searching another keyword." action={<Button variant="outline" onClick={() => { setQuery(""); setCategory("ALL"); setStatusFilter("ALL"); }}>Clear filters</Button>} /> : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredCampaigns.map((campaign) => {
                const application = applicationsByCampaign.get(campaign.id);
                return (
                  <Card key={campaign.id} role="link" tabIndex={0} onClick={() => openCampaign(campaign.id)} onKeyDown={(event) => onCardKeyDown(event, campaign.id)} className="group cursor-pointer overflow-hidden transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <div className="relative aspect-[4/3] bg-secondary/55 sm:aspect-[16/10]">
                      <ProductImage src={campaign.productImageUrl} alt={campaign.productName} category={campaign.category} variant="card" />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        {application ? <Badge className="bg-white/90 text-primary"><BadgeCheck className="mr-1 h-3.5 w-3.5" />Applied</Badge> : <StatusBadge status={campaign.status} />}
                      </div>
                    </div>
                    <CardContent className="flex flex-col gap-2.5 p-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-primary">{campaign.brandName || "Brand partner"}</p>
                        <h2 className="line-clamp-2 text-lg font-semibold leading-snug group-hover:text-primary">{campaign.title}</h2>
                        <p className="text-sm text-muted-foreground">{campaign.productName}</p>
                      </div>
                      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{campaign.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary/70 px-2.5 py-1 font-semibold text-secondary-foreground"><Tag className="h-3.5 w-3.5" />{campaign.category}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary"><BadgeIndianRupee className="h-3.5 w-3.5" />{formatCommission(campaign.commissionType, campaign.commissionValue)}</span>
                      </div>
                      <p className="mt-auto inline-flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />Published {formatDate(campaign.createdAt)}</p>
                      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                        <Button type="button" size="sm" className="flex-1" onClick={(event) => stopAndOpen(event, `/campaigns/${campaign.id}`)}>View details</Button>
                        {application ? <Button type="button" size="sm" variant="outline" className="flex-1" onClick={(event) => stopAndOpen(event, `/creator/applications?status=${application.status}`)}>View application</Button> : null}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          </div>
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
