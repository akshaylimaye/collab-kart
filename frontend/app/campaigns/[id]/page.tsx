"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiClientError, api } from "@/lib/api";
import type { Campaign } from "@/lib/types";

export default function CampaignDetailsPage({ params }: { params: { id: string } }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    api.getCreatorCampaign(params.id).then(setCampaign).catch(() => setCampaign(null));
  }, [params.id]);

  async function apply(event: FormEvent) {
    event.preventDefault();
    setFeedback("");
    try {
      await api.applyToCampaign(params.id, message);
      setFeedback("Application submitted.");
    } catch (err) {
      setFeedback(err instanceof ApiClientError ? err.message : "Unable to apply");
    }
  }

  return (
    <ProtectedRoute role="CREATOR">
      <AppShell>
        <section className="section">
          {!campaign ? <Card><CardContent className="p-5 text-sm text-muted-foreground">Campaign not found.</CardContent></Card> : (
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <Card>
                <CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>{campaign.title}</CardTitle><StatusBadge status={campaign.status} /></div></CardHeader>
                <CardContent className="space-y-4">
                  {campaign.productImageUrl ? <img className="aspect-video w-full rounded-md object-cover" src={campaign.productImageUrl} alt={campaign.productName} /> : null}
                  <div><p className="text-sm text-muted-foreground">Product</p><p className="font-medium">{campaign.productName}</p></div>
                  <div><p className="text-sm text-muted-foreground">Category</p><p>{campaign.category}</p></div>
                  <div><p className="text-sm text-muted-foreground">Description</p><p className="whitespace-pre-line">{campaign.description}</p></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Apply</CardTitle></CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={apply}>
                    <div className="rounded-md bg-secondary p-3 text-sm">{campaign.commissionType} commission · {campaign.commissionValue}</div>
                    <div className="space-y-2"><Label>Message</Label><Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share why you are a fit." /></div>
                    {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}
                    <Button className="w-full">Apply now</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
