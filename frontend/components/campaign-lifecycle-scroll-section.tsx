"use client";

import { useEffect, useRef, useState } from "react";
import { Archive, BarChart3, CheckCircle2, ClipboardList, FileText, Megaphone, Package, Send, Sparkles, Ticket, UserCheck, UsersRound, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LifecycleStage = {
  key: "before" | "during" | "after";
  index: string;
  shortLabel: string;
  mainHeading: string;
  label: string;
  title: string;
  description: string;
  bullets: string[];
};

const stages: LifecycleStage[] = [
  {
    key: "before",
    index: "01",
    shortLabel: "Before",
    mainHeading: "Before the Campaign",
    label: "Before Campaign",
    title: "Plan your campaign before you spend.",
    description:
      "Create your campaign with product details, category, campaign goal, discount, commission, and creator requirements. Let creators discover your campaign and apply directly.",
    bullets: [
      "Create draft campaigns",
      "Add product and campaign details",
      "Choose creator category",
      "Receive creator applications",
      "Review creator profiles before accepting"
    ]
  },
  {
    key: "during",
    index: "02",
    shortLabel: "During",
    mainHeading: "During the Campaign",
    label: "During Campaign",
    title: "Manage creators, approvals, and coupons clearly.",
    description:
      "Review creator applications, accept the right creators, reject unsuitable ones, and assign unique coupon codes to approved creators from one dashboard.",
    bullets: [
      "Review creator applications",
      "Accept or reject creators",
      "Assign unique coupon codes",
      "Track campaign status",
      "Archive or re-live campaigns"
    ]
  },
  {
    key: "after",
    index: "03",
    shortLabel: "After",
    mainHeading: "After the Campaign",
    label: "After Campaign",
    title: "Understand performance and settle payouts.",
    description:
      "Track coupon-linked sales, understand which creators generated orders, calculate commissions, and maintain payout visibility after the campaign.",
    bullets: [
      "Track coupon-wise performance",
      "View creator-wise sales contribution",
      "Calculate commission",
      "Maintain payout records",
      "Archive completed campaigns"
    ]
  }
];

export function CampaignLifecycleScrollSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStage = stages[activeIndex];

  useEffect(() => {
    let frame = 0;

    function updateActiveStage() {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollableDistance = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
      const nextIndex = progress < 1 / 3 ? 0 : progress < 2 / 3 ? 1 : 2;
      setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
    }

    function onScroll() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActiveStage);
    }

    updateActiveStage();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-slate-950 text-white lg:h-[250vh]" aria-labelledby="campaign-lifecycle-heading">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute right-[-10rem] top-[35%] h-[30rem] w-[30rem] rounded-full bg-purple-400/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(166_78%_31%/.18),transparent_34%),linear-gradient(180deg,rgba(15,23,42,.92),rgba(2,6,23,1))]" />
      </div>

      <div className="relative lg:hidden">
        <div className="container py-12">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-emerald-100">
              <Sparkles className="mr-2 h-4 w-4 text-emerald-300" />Campaign lifecycle
            </div>
            <h2 id="campaign-lifecycle-heading" className="text-3xl font-semibold tracking-normal text-white">Before, during, and after every creator campaign.</h2>
            <p className="leading-7 text-slate-300">The mobile view keeps the story simple: each stage appears as a readable card without sticky scroll animation.</p>
          </div>
          <div className="mt-8 grid gap-5">
            {stages.map((stage) => (
              <LifecycleMobileCard key={stage.key} stage={stage} />
            ))}
          </div>
        </div>
      </div>

      <div className="relative hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:overflow-hidden lg:py-12 xl:py-16">
        <div className="container w-full">
          <div className="mb-6 flex items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-emerald-100 shadow-sm backdrop-blur">
                <Sparkles className="mr-2 h-4 w-4 text-emerald-300" />Campaign lifecycle
              </div>
              <h2 id="campaign-lifecycle-heading" className="mt-4 text-4xl font-semibold xl:text-5xl tracking-normal text-white transition-all duration-500 motion-reduce:transition-none">
                {activeStage.mainHeading}
              </h2>
            </div>
            <DesktopProgress activeIndex={activeIndex} />
          </div>

          <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] xl:items-center">
            <div key={activeStage.key + "-copy"} className="space-y-6 transition-all duration-500 ease-out motion-reduce:transition-none motion-reduce:transform-none animate-in fade-in slide-in-from-bottom-4">
              <StageMarker stage={activeStage} />
              <div className="space-y-4">
                <h3 className="max-w-xl text-4xl font-semibold leading-tight tracking-normal text-white">{activeStage.title}</h3>
                <p className="max-w-xl text-lg leading-8 text-slate-300">{activeStage.description}</p>
              </div>
              <div className="grid max-w-xl gap-3">
                {activeStage.bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm font-medium text-slate-100 shadow-sm backdrop-blur">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            <div key={activeStage.key + "-mockup"} className="transition-all duration-500 ease-out motion-reduce:transition-none animate-in fade-in slide-in-from-bottom-5">
              <LifecycleMockup stage={activeStage} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LifecycleMobileCard({ stage }: { stage: LifecycleStage }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur">
      <div className="space-y-5">
        <StageMarker stage={stage} />
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold leading-tight text-white">{stage.mainHeading}</h3>
          <p className="text-lg font-semibold text-emerald-100">{stage.title}</p>
          <p className="leading-7 text-slate-300">{stage.description}</p>
        </div>
        <div className="grid gap-2">
          {stage.bullets.map((bullet) => (
            <div key={bullet} className="flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-slate-100">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <span>{bullet}</span>
            </div>
          ))}
        </div>
        <LifecycleMockup stage={stage} />
      </div>
    </div>
  );
}

function DesktopProgress({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.07] p-2 shadow-2xl backdrop-blur">
      {stages.map((stage, index) => (
        <div key={stage.key} className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-12 min-w-36 items-center justify-center rounded-full px-5 text-sm font-semibold transition-all duration-300 motion-reduce:transition-none",
              activeIndex === index ? "bg-emerald-300 text-slate-950 shadow-[0_16px_40px_-24px_rgba(110,231,183,.9)]" : "bg-white/[0.06] text-slate-300"
            )}
          >
            <span className="mr-2 text-xs opacity-75">{stage.index}</span>{stage.shortLabel}
          </div>
          {index < stages.length - 1 ? <div className="h-px w-7 bg-white/15" /> : null}
        </div>
      ))}
    </div>
  );
}

function StageMarker({ stage }: { stage: LifecycleStage }) {
  const Icon = stage.key === "before" ? ClipboardList : stage.key === "during" ? UserCheck : BarChart3;
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300 text-slate-950 shadow-[0_16px_40px_-24px_rgba(110,231,183,.9)]">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">{stage.index} {stage.label}</p>
        <p className="mt-1 text-sm text-slate-400">CollabKart campaign flow</p>
      </div>
    </div>
  );
}

function LifecycleMockup({ stage }: { stage: LifecycleStage }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90 shadow-[0_30px_100px_-45px_rgba(16,185,129,.55)] ring-1 ring-white/10 backdrop-blur">
      <div className="border-b border-white/10 bg-white/[0.05] p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-300" />
            <span className="h-3 w-3 rounded-full bg-amber-300" />
            <span className="h-3 w-3 rounded-full bg-emerald-300" />
          </div>
          <Badge className="bg-emerald-300 text-slate-950 hover:bg-emerald-300">{stage.shortLabel}</Badge>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">{stage.label}</p>
            <p className="mt-1 truncate text-lg font-semibold text-white">Dashboard preview</p>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">Coupon-linked tracking</span>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        {stage.key === "before" ? <BeforeCampaignMockup /> : null}
        {stage.key === "during" ? <DuringCampaignMockup /> : null}
        {stage.key === "after" ? <AfterCampaignMockup /> : null}
      </div>
    </div>
  );
}

function BeforeCampaignMockup() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[155px_1fr]">
        <div className="flex aspect-[4/3] items-center justify-center rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(110,231,183,.18),rgba(196,181,253,.16))] text-emerald-200">
          <Package className="h-11 w-11" />
        </div>
        <div className="min-w-0 space-y-3">
          <div>
            <p className="text-sm font-semibold text-emerald-200">Campaign setup</p>
            <h4 className="mt-1 text-xl font-semibold leading-tight text-white">Glow Serum Creator Launch</h4>
            <p className="mt-1 text-sm text-slate-400">Goal: creator reels for first product trial</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <DarkPill>Beauty & Skincare</DarkPill>
            <DarkPill>15% discount</DarkPill>
            <DarkPill>18% commission</DarkPill>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard icon={<FileText className="h-4 w-4" />} label="Status" value="Draft" />
        <MetricCard icon={<UsersRound className="h-4 w-4" />} label="Creator fit" value="Beauty" />
        <MetricCard icon={<Megaphone className="h-4 w-4" />} label="Goal" value="Launch" />
      </div>
      <Button className="w-full bg-emerald-300 text-slate-950 hover:bg-emerald-200"><Send className="h-4 w-4" />Publish Campaign</Button>
    </div>
  );
}

function DuringCampaignMockup() {
  const applicants = [
    { name: "Nisha", followers: "8.7k", category: "Beauty", status: "APPLIED", code: "" },
    { name: "Aarav", followers: "5.4k", category: "Food", status: "ACCEPTED", code: "GLOW42" }
  ];

  return (
    <div className="space-y-3">
      {applicants.map((applicant) => (
        <div key={applicant.name} className="rounded-3xl border border-white/10 bg-white/[0.06] p-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-300/15 text-sm font-bold text-emerald-200 ring-1 ring-emerald-200/20">
              {applicant.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-white">{applicant.name} Creator</p>
                <DarkPill>{applicant.status}</DarkPill>
              </div>
              <p className="mt-1 text-sm text-slate-400">{applicant.followers} followers · {applicant.category}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-2 text-sm text-slate-300">
                  {applicant.code || "Coupon code field"}
                </div>
                <Button size="sm" className="bg-emerald-300 text-slate-950 hover:bg-emerald-200"><UserCheck className="h-4 w-4" />Accept</Button>
                <Button size="sm" variant="outline" className="border-white/15 bg-white/[0.04] text-slate-100 hover:bg-white/10"><X className="h-4 w-4" />Reject</Button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
        <Ticket className="mb-2 h-4 w-4" /> Unique coupon codes stay tied to accepted creators and campaign status.
      </div>
    </div>
  );
}

function AfterCampaignMockup() {
  const rows = [
    ["Nisha", "GLOW42", "18", "₹42,300", "₹6,345", "Pending"],
    ["Aarav", "BREW18", "9", "₹18,900", "₹2,835", "Recorded"],
    ["Meera", "FIT77", "6", "₹11,400", "₹1,710", "Pending"]
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard icon={<BarChart3 className="h-4 w-4" />} label="Orders" value="33" />
        <MetricCard icon={<Ticket className="h-4 w-4" />} label="Coupons" value="3" />
        <MetricCard icon={<Archive className="h-4 w-4" />} label="Payouts" value="Manual" />
      </div>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40 shadow-sm">
        <div className="grid grid-cols-[1fr_0.8fr_0.7fr] gap-2 border-b border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-slate-400 sm:grid-cols-[1fr_0.8fr_0.6fr_0.9fr_0.9fr_0.9fr]">
          <span>Creator</span><span>Coupon</span><span>Orders</span><span className="hidden sm:block">Sales</span><span className="hidden sm:block">Commission</span><span className="hidden sm:block">Payout</span>
        </div>
        {rows.map((row) => (
          <div key={row[1]} className="grid grid-cols-[1fr_0.8fr_0.7fr] gap-2 border-b border-white/10 px-3 py-3 text-sm text-slate-300 last:border-b-0 sm:grid-cols-[1fr_0.8fr_0.6fr_0.9fr_0.9fr_0.9fr]">
            <span className="font-medium text-white">{row[0]}</span><span className="font-semibold text-emerald-200">{row[1]}</span><span>{row[2]}</span><span className="hidden sm:block">{row[3]}</span><span className="hidden sm:block">{row[4]}</span><span className="hidden sm:block text-slate-400">{row[5]}</span>
          </div>
        ))}
      </div>
      <p className="text-xs leading-5 text-slate-400">Coupon-linked tracking can start with manual sales updates. Store automation can come later when the product is ready.</p>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{icon}{label}</div>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function DarkPill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-semibold text-slate-200">{children}</span>;
}
