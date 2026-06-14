/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { CalendarDays, ImageIcon, PencilLine, RotateCcw, Save, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, ErrorState, LoadingState } from "@/components/page-state";
import { ProtectedRoute } from "@/components/protected-route";
import { StatusBadge } from "@/components/status-badge";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { getClientError } from "@/lib/form";
import type { CampaignApplication } from "@/lib/types";

const MAX_MESSAGE_LENGTH = 500;

function lockedMessage(status: CampaignApplication["status"]) {
  if (status === "ACCEPTED") return "Accepted applications cannot be edited or withdrawn.";
  if (status === "REJECTED") return "Rejected applications cannot be edited or withdrawn.";
  if (status === "WITHDRAWN") return "Withdrawn applications cannot be edited or withdrawn.";
  return "";
}

export default function CreatorApplicationsPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [messageError, setMessageError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setApplications(await api.getCreatorApplications());
    } catch (err) {
      setError(getClientError(err, "Unable to load applications"));
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
    <ProtectedRoute role="CREATOR">
      <AppShell>
        <section className="section space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">Creator workspace</p>
              <h1 className="text-3xl font-semibold tracking-normal">Applications</h1>
              <p className="max-w-2xl text-muted-foreground">Review every campaign you applied to and manage applications that are still pending.</p>
            </div>
            <Button asChild variant="outline"><Link href="/campaigns">Browse campaigns</Link></Button>
          </div>

          {loading ? <LoadingState label="Loading applications..." /> : error ? <ErrorState message={error} onRetry={load} /> : applications.length === 0 ? (
            <EmptyState title="No applications yet" description="Apply to a live campaign and your submissions will appear here." action={<Button asChild><Link href="/campaigns">Find campaigns</Link></Button>} />
          ) : (
            <div className="grid gap-4">
              {applications.map((application) => {
                const canManage = application.status === "APPLIED";
                const isEditing = editingId === application.applicationId;
                const isBusy = busyId === application.applicationId;
                return (
                  <Card key={application.applicationId} className="overflow-hidden">
                    <div className="grid gap-0 md:grid-cols-[220px_1fr]">
                      <div className="relative min-h-48 bg-secondary/55 md:min-h-full">
                        {application.campaignProductImageUrl ? (
                          <img className="absolute inset-0 h-full w-full object-cover" src={application.campaignProductImageUrl} alt={application.campaignTitle} />
                        ) : (
                          <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
                            <ImageIcon className="h-7 w-7" />
                            <span className="text-xs font-semibold uppercase tracking-wide">Product image</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="space-y-4 p-5 md:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 space-y-1">
                            <p className="text-sm font-medium text-primary">{application.brandName || "Brand partner"}</p>
                            <h2 className="text-xl font-semibold leading-snug text-foreground">{application.campaignTitle}</h2>
                            <p className="text-sm text-muted-foreground">{application.campaignCategory || "Category not added"}</p>
                          </div>
                          <StatusBadge status={application.status} />
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4 text-primary" />Applied {formatDate(application.appliedAt)}</span>
                          <span>Updated {formatDate(application.updatedAt)}</span>
                        </div>

                        {isEditing ? (
                          <form className="space-y-3" onSubmit={(event) => saveMessage(event, application.applicationId)}>
                            <div className="space-y-2">
                              <Label htmlFor={`message-${application.applicationId}`}>Application message</Label>
                              <Textarea id={`message-${application.applicationId}`} value={draftMessage} onChange={(event) => { setDraftMessage(event.target.value); setMessageError(""); }} />
                              <div className="flex justify-between gap-3 text-xs text-muted-foreground"><span className="text-destructive">{messageError}</span><span>{draftMessage.length}/{MAX_MESSAGE_LENGTH}</span></div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" disabled={isBusy}><Save className="h-4 w-4" />{isBusy ? "Saving..." : "Save message"}</Button>
                              <Button size="sm" type="button" variant="outline" onClick={cancelEdit}><X className="h-4 w-4" />Cancel</Button>
                            </div>
                          </form>
                        ) : (
                          <div className="rounded-2xl border border-border/70 bg-white/70 p-3.5 text-sm shadow-sm">
                            <p className="font-medium text-foreground">Application message</p>
                            <p className="mt-1 whitespace-pre-line leading-6 text-muted-foreground">{application.message || "No message added."}</p>
                          </div>
                        )}

                        {!canManage ? <p className="rounded-2xl bg-secondary/45 p-3 text-sm text-muted-foreground">{lockedMessage(application.status)}</p> : null}

                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                          <Button asChild variant="outline" size="sm"><Link href={`/campaigns/${application.campaignId}`}>View campaign</Link></Button>
                          <Button size="sm" variant="outline" disabled={!canManage || isBusy || isEditing} onClick={() => startEdit(application)}><PencilLine className="h-4 w-4" />Edit message</Button>
                          <Button size="sm" variant="ghost" disabled={!canManage || isBusy} onClick={() => withdraw(application.applicationId)}><RotateCcw className="h-4 w-4" />{isBusy ? "Withdrawing..." : "Withdraw application"}</Button>
                        </div>
                      </CardContent>
                    </div>
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
