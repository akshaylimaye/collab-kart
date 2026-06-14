"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Campaign } from "@/lib/types";

export default function CampaignListPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    api.getCreatorCampaigns().then(setCampaigns).catch(() => setCampaigns([]));
  }, []);

  return (
    <ProtectedRoute role="CREATOR">
      <AppShell>
        <section className="section space-y-6">
          <div><h1 className="text-2xl font-semibold">Campaigns</h1><p className="text-muted-foreground">Live campaigns open for creator applications.</p></div>
          <div className="grid gap-4 md:grid-cols-2">
            {campaigns.length === 0 ? <Card><CardContent className="p-5 text-sm text-muted-foreground">No live campaigns right now.</CardContent></Card> : campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader><CardTitle>{campaign.title}</CardTitle><CardDescription>{campaign.productName} · {campaign.category}</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <p className="line-clamp-3 text-sm text-muted-foreground">{campaign.description}</p>
                  <div className="flex items-center justify-between"><span className="text-sm font-medium">{campaign.commissionType} · {campaign.commissionValue}</span><Button asChild variant="outline"><Link href={`/campaigns/${campaign.id}`}>View</Link></Button></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
