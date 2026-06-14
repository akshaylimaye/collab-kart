"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { BrandProfile, Campaign } from "@/lib/types";

export default function BrandDashboardPage() {
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const live = campaigns.filter((campaign) => campaign.status === "LIVE").length;
  const pending = campaigns.filter((campaign) => campaign.status === "PENDING_REVIEW").length;

  async function load() {
    api.getBrandProfile().then(setProfile).catch(() => setProfile(null));
    api.getBrandCampaigns().then(setCampaigns).catch(() => setCampaigns([]));
  }

  useEffect(() => { load(); }, []);

  async function publish(id: string) {
    await api.publishBrandCampaign(id);
    await load();
  }

  async function archive(id: string) {
    await api.archiveBrandCampaign(id);
    await load();
  }

  return (
    <ProtectedRoute role="BRAND">
      <AppShell>
        <section className="section space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h1 className="text-2xl font-semibold">Brand dashboard</h1><p className="text-muted-foreground">Manage campaigns for {profile?.brandName || "your brand"}.</p></div>
            <Button asChild><Link href="/brand/campaigns/new">Create campaign</Link></Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader><CardTitle>{campaigns.length}</CardTitle><CardDescription>Total campaigns</CardDescription></CardHeader></Card>
            <Card><CardHeader><CardTitle>{pending}</CardTitle><CardDescription>Pending review</CardDescription></CardHeader></Card>
            <Card><CardHeader><CardTitle>{live}</CardTitle><CardDescription>Live campaigns</CardDescription></CardHeader></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Campaigns</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {campaigns.length === 0 ? <p className="text-sm text-muted-foreground">No campaigns yet.</p> : campaigns.map((campaign) => (
                <div key={campaign.id} className="flex flex-col gap-3 rounded-md border p-3 md:flex-row md:items-center md:justify-between">
                  <div><p className="font-medium">{campaign.title}</p><p className="text-sm text-muted-foreground">{campaign.productName}</p></div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={campaign.status} />
                    {campaign.status === "DRAFT" || campaign.status === "REJECTED" ? <Button size="sm" variant="outline" onClick={() => publish(campaign.id)}>Submit</Button> : null}
                    {campaign.status !== "ARCHIVED" ? <Button size="sm" variant="ghost" onClick={() => archive(campaign.id)}>Archive</Button> : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
