"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Campaign, CampaignApplication, CreatorProfile } from "@/lib/types";

export default function CreatorDashboardPage() {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<CampaignApplication[]>([]);

  useEffect(() => {
    api.getCreatorProfile().then(setProfile).catch(() => setProfile(null));
    api.getCreatorCampaigns().then(setCampaigns).catch(() => setCampaigns([]));
    api.getCreatorApplications().then(setApplications).catch(() => setApplications([]));
  }, []);

  return (
    <ProtectedRoute role="CREATOR">
      <AppShell>
        <section className="section space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h1 className="text-2xl font-semibold">Creator dashboard</h1><p className="text-muted-foreground">Track open campaigns and your applications.</p></div>
            <Button asChild><Link href="/campaigns">Browse campaigns</Link></Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader><CardTitle>{campaigns.length}</CardTitle><CardDescription>Live campaigns</CardDescription></CardHeader></Card>
            <Card><CardHeader><CardTitle>{applications.length}</CardTitle><CardDescription>Applications</CardDescription></CardHeader></Card>
            <Card><CardHeader><CardTitle>{profile?.followerCount ?? 0}</CardTitle><CardDescription>Followers</CardDescription></CardHeader></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Recent applications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {applications.length === 0 ? <p className="text-sm text-muted-foreground">No applications yet.</p> : applications.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                  <div><p className="font-medium">{item.campaign.title}</p><p className="text-sm text-muted-foreground">{item.campaign.productName}</p></div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
