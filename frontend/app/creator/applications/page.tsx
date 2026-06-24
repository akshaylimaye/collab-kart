"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BadgeIndianRupee, CalendarDays, PencilLine, RotateCcw, Save, Ticket, UserRoundCheck, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/page-state";
import { ProductImage } from "@/components/product-image";
import { ProtectedRoute } from "@/components/protected-route";
import { StatusBadge } from "@/components/status-badge";
import { useToast } from "@/components/toast-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiClientError, api } from "@/lib/api";
import { formatDate, formatRewardRule } from "@/lib/format";
import { getClientError } from "@/lib/form";
import type { ApplicationStatus, CampaignApplication } from "@/lib/types";

const MAX_MESSAGE_LENGTH = 500;
const STATUS_FILTERS: Array<{ label: string; href: string; value: ApplicationStatus | "ALL" }> = [
  { label: "All", href: "/creator/applications", value: "ALL" },
  { label: "Applied", href: "/creator/applications?status=APPLIED", value: "APPLIED" },
  { label: "Accepted", href: "/creator/applications?status=ACCEPTED", value: "ACCEPTED" },
  { label: "Rejected", href: "/creator/applications?status=REJECTED", value: "REJECTED" },
  { label: "Withdrawn", href: "/creator/applications?status=WITHDRAWN", value: "WITHDRAWN" }
];

function lockedMessage(status: CampaignApplication["status"]) {
  if (status === "ACCEPTED") return "Accepted applications are locked. You can view the campaign, but the message can no longer be changed.";
  if (status === "REJECTED") return "Rejected applications are locked and cannot be edited or withdrawn.";
  if (status === "WITHDRAWN") return "You withdrew this application, so editing and withdrawal actions are closed.";
  return "";
}

function acceptedCampaignMessage(application: CampaignApplication) {
  if (application.campaignStatus === "ARCHIVED") {
    return "This campaign is no longer live. Please do not promote this coupon unless the brand makes the campaign live again.";
  }

  return "You can promote this campaign using your coupon code.";
}

function acceptedCampaignContext(application: CampaignApplication) {
  if (application.campaignStatus === "ARCHIVED") {
    return "Your application was accepted earlier, but this campaign is currently archived, so the coupon is inactive.";
  }

  return "Create content and share this coupon code with your audience.";
}

export default function CreatorApplicationsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileMissing, setProfileMissing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [messageError, setMessageError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const requestedStatus = searchParams.get("status") as ApplicationStatus | null;
  const activeStatus: ApplicationStatus | "ALL" = requestedStatus && STATUS_FILTERS.some((filter) => filter.value === requestedStatus) ? requestedStatus : "ALL";
  const counts = useMemo(() => applications.reduce<Record<string, number>>((acc, application) => {
    acc.ALL += 1;
    acc[application.status] += 1;
    return acc;
  }, { ALL: 0, APPLIED: 0, ACCEPTED: 0, REJECTED: 0, WITHDRAWN: 0 }), [applications]);
  const visibleApplications = useMemo(() => activeStatus === "ALL" ? applications : applications.filter((application) => application.status === activeStatus), [activeStatus, applications]);

  async function load() {
    setLoading(true);
    setError("");
    setProfileMissing(false);
    try {
      setApplications(await api.getCreatorApplications());
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setApplications([]);
        setProfileMissing(true);
      } else {
        setError(getClientError(err, "Unable to load applications"));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(application: CampaignApplication) {
    setEditingId(application.applicationId);
    setDraftMessage(application.message || "");
    setMessageError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setDraftMessage("");
    setMessageError("");
  }

  async function saveMessage(event: FormEvent, applicationId: string) {
    event.preventDefault();
    if (draftMessage.length > MAX_MESSAGE_LENGTH) {
      setMessageError("Message must be 500 characters or fewer.");
      return;
    }

    setBusyId(applicationId);
    try {
      const updated = await api.updateCreatorApplicationMessage(applicationId, draftMessage.trim());
      setApplications((items) => items.map((item) => item.applicationId === updated.applicationId ? updated : item));
      toast({ title: "Application updated", variant: "success" });
      cancelEdit();
    } catch (err) {
      toast({ title: "Unable to update application", description: getClientError(err, "Try again later"), variant: "error" });
    } finally {
      setBusyId(null);
    }
  }

  async function withdraw(applicationId: string) {
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;

    setBusyId(applicationId);
    try {
      const updated = await api.withdrawCreatorApplication(applicationId);
      setApplications((items) => items.map((item) => item.applicationId === updated.applicationId ? updated : item));
      toast({ title: "Application withdrawn", variant: "success" });
      if (editingId === applicationId) cancelEdit();
    } catch (err) {
      toast({ title: "Unable to withdraw application", description: getClientError(err, "Try again later"), variant: "error" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ProtectedRoute role="CREATOR" requireProfile>
      <AppShell>
        <section className="section space-y-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">Creator workspace</p>
              <h1 className="text-3xl font-semibold tracking-normal">Applications</h1>
              <p className="max-w-2xl text-muted-foreground">Review submitted campaigns and manage applications that are still pending.</p>
            </div>
            <Button asChild variant="outline"><Link href="/campaigns">Browse campaigns</Link></Button>
          </div>

          {!loading && !error && applications.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((filter) => (
                <Button key={filter.value} asChild variant={activeStatus === filter.value ? "secondary" : "outline"} size="sm">
                  <Link href={filter.href}>{filter.label} <span className="ml-1 rounded-full bg-white/60 px-1.5 py-0.5 text-[11px]">{counts[filter.value]}</span></Link>
                </Button>
              ))}
            </div>
          ) : null}

          {loading ? <LoadingState label="Loading applications..." /> : error ? <ErrorState message={error} onRetry={load} /> : profileMissing ? (
            <EmptyState title="Create your creator profile first" description="You need a creator profile before applying to campaigns and managing applications." action={<Button asChild><Link href="/creator/profile"><UserRoundCheck className="h-4 w-4" />Create creator profile</Link></Button>} />
          ) : applications.length === 0 ? (
            <EmptyState title="No applications yet" description="Apply to a live campaign and your submissions will appear here." action={<Button asChild><Link href="/campaigns">Find campaigns</Link></Button>} />
          ) : visibleApplications.length === 0 ? (
            <EmptyState title="No applications found" description="No applications match this status filter." action={<Button asChild variant="outline"><Link href="/creator/applications">View all applications</Link></Button>} />
          ) : (
            <div className="grid gap-4">
              {visibleApplications.map((application) => {
                const canManage = application.status === "APPLIED";
                const isEditing = editingId === application.applicationId;
                const isBusy = busyId === application.applicationId;
                return (
                  <Card key={application.applicationId} className="overflow-hidden">
                    <CardContent className="grid gap-3 p-3.5 md:grid-cols-[136px_1fr] md:items-start">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-secondary/55 md:aspect-square">
                        <ProductImage src={application.campaignProductImageUrl} alt={application.campaignTitle} category={application.campaignCategory} variant="thumbnail" />
                      </div>
                      <div className="min-w-0 space-y-2.5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 space-y-1">
                            <p className="text-sm font-medium text-primary">{application.brandName || "Brand partner"}</p>
                            <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-foreground">{application.campaignTitle}</h2>
                            <p className="text-sm text-muted-foreground">{application.campaignCategory || "Category not added"}</p>
                          </div>
                          <StatusBadge status={application.status} />
                        </div>

                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5 text-primary" />Applied {formatDate(application.appliedAt)}</span>
                          <span>Updated {formatDate(application.updatedAt)}</span>
                        </div>

                        {isEditing ? (
                          <form className="space-y-3" onSubmit={(event) => saveMessage(event, application.applicationId)}>
                            <div className="space-y-2">
                              <Label htmlFor={`message-${application.applicationId}`}>Application message</Label>
                              <Textarea id={`message-${application.applicationId}`} value={draftMessage} onChange={(event) => { setDraftMessage(event.target.value); setMessageError(""); }} />
                              <div className="flex justify-between gap-3 text-xs text-muted-foreground"><span className="text-destructive">{messageError}</span><span>{draftMessage.length}/{MAX_MESSAGE_LENGTH}</span></div>
                            </div>
                            <div className="grid gap-2 sm:flex sm:flex-wrap">
                              <Button size="sm" className="w-full sm:w-auto" disabled={isBusy}><Save className="h-4 w-4" />{isBusy ? "Saving..." : "Save message"}</Button>
                              <Button size="sm" type="button" variant="outline" className="w-full sm:w-auto" onClick={cancelEdit}><X className="h-4 w-4" />Cancel</Button>
                            </div>
                          </form>
                        ) : (
                          <div className="rounded-2xl border border-border/70 bg-white/70 p-3 text-sm shadow-sm">
                            <p className="font-medium text-foreground">Message</p>
                            <p className="mt-1 line-clamp-3 whitespace-pre-line leading-6 text-muted-foreground">{application.message || "No message added."}</p>
                          </div>
                        )}

                        {application.status === "ACCEPTED" && application.couponCode ? (
                          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-3 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                              <Ticket className="h-4 w-4 text-primary" />
                              <span className="font-semibold text-primary">Coupon code: {application.couponCode}</span>
                              <Badge variant="default">ACCEPTED</Badge>
                              {application.campaignStatus === "ARCHIVED" ? <Badge variant="outline">CAMPAIGN ARCHIVED</Badge> : null}
                              <Badge variant={application.couponStatus === "INACTIVE" ? "outline" : "default"}>COUPON {application.couponStatus || "ACTIVE"}</Badge>
                            </div>
                            <p className="mt-2 inline-flex items-center gap-1 text-muted-foreground"><BadgeIndianRupee className="h-3.5 w-3.5" />{formatRewardRule(application.campaignCommissionType, application.campaignCommissionValue)}</p>
                            {application.brandInstructions ? <p className="mt-2 whitespace-pre-line text-muted-foreground">{application.brandInstructions}</p> : null}
                            <p className="mt-2 text-muted-foreground">{acceptedCampaignMessage(application)}</p>
                            <p className="mt-1 text-muted-foreground">{acceptedCampaignContext(application)}</p>
                          </div>
                        ) : null}

                        {application.status === "REJECTED" ? (
                          <div className="rounded-2xl bg-secondary/45 p-3 text-sm text-muted-foreground"><span className="font-medium text-foreground">Brand message: </span>{application.rejectionReason || "The brand did not add a reason."}</div>
                        ) : null}

                        {!canManage ? <p className="rounded-2xl bg-secondary/45 p-3 text-sm text-muted-foreground">{lockedMessage(application.status)}</p> : null}

                        <div className="grid gap-2 sm:flex sm:flex-wrap">
                          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto"><Link href={`/campaigns/${application.campaignId}`}>View campaign</Link></Button>
                          <Button size="sm" variant="outline" className="w-full sm:w-auto" disabled={!canManage || isBusy || isEditing} onClick={() => startEdit(application)}><PencilLine className="h-4 w-4" />Edit message</Button>
                          <Button size="sm" variant="ghost" className="w-full sm:w-auto" disabled={!canManage || isBusy} onClick={() => withdraw(application.applicationId)}><RotateCcw className="h-4 w-4" />{isBusy ? "Withdrawing..." : "Withdraw"}</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
