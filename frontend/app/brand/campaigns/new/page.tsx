"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/page-state";
import { BrandCampaignForm, type BrandCampaignSubmitPayload } from "@/components/brand-campaign-form";
import { ProtectedRoute } from "@/components/protected-route";
import { useToast } from "@/components/toast-provider";
import { Send, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiClientError, api } from "@/lib/api";
import { getClientError } from "@/lib/form";
import { useEffect, useState } from "react";

export default function BrandCampaignNewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileMissing, setProfileMissing] = useState(false);
  const [loadError, setLoadError] = useState("");

  async function loadProfile() {
    setLoadingProfile(true);
    setProfileMissing(false);
    setLoadError("");
    try {
      await api.getBrandProfile();
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setProfileMissing(true);
      } else {
        setLoadError(getClientError(err, "Unable to load brand profile"));
      }
    } finally {
      setLoadingProfile(false);
    }
  }

  useEffect(() => { void loadProfile(); }, []);

  async function createCampaign(payload: BrandCampaignSubmitPayload, intent: string) {
    if (intent === "publish" && !payload.productImage) {
      toast({ title: "Product image required", description: "Please upload a product image before publishing.", variant: "error" });
      return;
    }

    setSaving(true);
    try {
      const campaign = await api.createBrandCampaign(payload);
      if (intent === "publish") {
        await api.publishBrandCampaign(campaign.id);
        toast({ title: "Campaign published", description: "Your campaign is now visible to creators.", variant: "success" });
      } else {
        toast({ title: "Campaign draft created", description: payload.productImage ? "Product image uploaded successfully." : "Add a product image before publishing.", variant: "success" });
      }
      router.push("/brand/campaigns");
    } catch (err) {
      toast({ title: intent === "publish" ? "Unable to publish campaign" : "Unable to create campaign", description: getClientError(err, "Try again later"), variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute role="BRAND">
      <AppShell>
        <section className="section space-y-6">
          {loadingProfile ? <LoadingState label="Checking brand profile..." /> : loadError ? <ErrorState message={loadError} onRetry={loadProfile} /> : profileMissing ? (
            <EmptyState title="Create your brand profile before launching campaigns." description="Creators need your brand details before they can evaluate your campaigns." action={<Button asChild><Link href="/brand/profile"><Store className="h-4 w-4" />Create brand profile</Link></Button>} />
          ) : (
          <Card>
            <CardHeader><CardTitle>Create campaign</CardTitle><CardDescription>Campaigns are saved as drafts. Upload a product image now or add one before publishing.</CardDescription></CardHeader>
            <CardContent>
              <BrandCampaignForm
                submitLabel="Save Draft"
                submitting={saving}
                onSubmit={createCampaign}
                actions={(<>
                  <Button data-intent="publish" variant="outline" disabled={saving}><Send className="h-4 w-4" />Publish</Button>
                  <Button asChild type="button" variant="outline"><Link href="/brand/campaigns">Cancel</Link></Button>
                </>)}
              />
            </CardContent>
          </Card>
          )}
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
