import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle2, Handshake, Megaphone, ShoppingBag, Sparkles, Store, Ticket, UsersRound } from "lucide-react";
import { CampaignLifecycleScrollSection } from "@/components/campaign-lifecycle-scroll-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <main className="page-shell overflow-hidden">
      <LandingNavbar />
      <HeroSection />
      <ProblemSection />
      <CampaignLifecycleScrollSection />
      <HowItWorksSection />
      <BrandCreatorSplitSection />
      <FinalCTA />
    </main>
  );
}

function LandingNavbar() {
  return (
    <header className="container flex min-h-14 min-w-0 items-center justify-between gap-3 py-2 sm:gap-4">
      <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold text-foreground">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_14px_30px_-18px_rgba(15,118,110,0.9)]">
          <ShoppingBag className="h-5 w-5" />
        </span>
        <span className="truncate">CollabKart</span>
      </Link>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <Button asChild variant="ghost"><Link href="/login">Login</Link></Button>
        <Button asChild className="px-3 sm:px-4"><Link href="/register">Get started</Link></Button>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="container grid min-h-[calc(100vh-3.5rem)] items-center gap-6 py-5 md:py-6 lg:grid-cols-[1fr_0.92fr]">
      <div className="max-w-2xl space-y-5">
        <div className="pastel-chip"><Sparkles className="mr-2 h-4 w-4 text-primary" />Performance-based creator campaigns</div>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl lg:text-5xl">Small brands get creators. Creators get paid for results.</h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">CollabKart connects brands with nano creators through commission-based campaigns, so brands can promote products and creators can earn from collaborations.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg"><Link href="/register?role=BRAND">Join as Brand <ArrowRight className="h-4 w-4" /></Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/register?role=CREATOR">Join as Creator <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </div>
      <div className="grid gap-3">
        <Card className="overflow-hidden">
          <div className="h-32 bg-[linear-gradient(135deg,hsl(166_78%_31%/.16),hsl(258_72%_94%),hsl(13_92%_88%/.6))] p-4">
            <div className="flex h-full min-w-0 items-end justify-between gap-3 rounded-2xl border border-white/70 bg-white/55 p-3 shadow-sm backdrop-blur">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Featured product</p>
                <p className="mt-1 line-clamp-2 text-lg font-semibold leading-snug text-foreground">Skincare launch kit</p>
              </div>
              <Badge>OPEN</Badge>
            </div>
          </div>
          <CardHeader className="p-4 pb-3 md:p-4 md:pb-3">
            <CardTitle className="text-base">Commission campaign board</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0 md:p-4 md:pt-0">
            {[
              ["Skincare launch", "OPEN", "18% creator commission"],
              ["Coffee bundle", "LIVE", "₹450 fixed reward"],
              ["Fitness gear", "OPEN", "12% creator commission"]
            ].map(([title, status, commission]) => (
              <div key={title} className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-white/70 p-2.5 shadow-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{commission}</p>
                </div>
                <span className="shrink-0 rounded-full bg-secondary/70 px-2.5 py-1 text-xs font-semibold text-secondary-foreground">{status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <ValueCard icon={<Handshake className="h-5 w-5" />} title="No upfront fees" text="Brands can launch campaigns and reward creators based on results." />
          <ValueCard icon={<BadgeCheck className="h-5 w-5" />} title="Nano creators" text="Creators discover products they can promote and earn from." />
          <ValueCard icon={<Store className="h-5 w-5" />} title="Simple workflow" text="Post campaigns, review applicants, and manage collaborations in one place." />
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="container py-12 md:py-16">
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div className="space-y-3">
          <div className="pastel-chip">Why CollabKart</div>
          <h2 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">Creator campaigns should be clear before money moves.</h2>
          <p className="text-base leading-7 text-muted-foreground">Small brands need a way to discover creators, approve the right applicants, and keep coupon-linked tracking organized without agency-level overhead.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <ProblemCard title="Upfront risk" text="Brands often pay before knowing whether a creator will drive useful outcomes." />
          <ProblemCard title="Messy approvals" text="Creator applications, coupon codes, and campaign status can quickly get scattered." />
          <ProblemCard title="Manual follow-up" text="Early teams need a simple place to record coupon-linked sales and payout visibility." />
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    ["Brand creates campaign", "Add product details, commission, category, image, and creator fit."],
    ["Creator applies", "Nano creators browse live campaigns and submit a short application."],
    ["Brand reviews", "Accept creators with coupon codes or reject with an optional reason."],
    ["Creator tracks status", "Creators see application status, coupon details, and campaign state."]
  ];

  return (
    <section className="container py-12 md:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <div className="pastel-chip mx-auto">How it works</div>
        <h2 className="mt-4 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">One loop, fewer loose ends.</h2>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map(([title, text], index) => (
          <Card key={title}>
            <CardContent className="p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function BrandCreatorSplitSection() {
  return (
    <section className="container py-12 md:py-16">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="overflow-hidden border-primary/10 bg-primary/5">
          <CardContent className="space-y-5 p-6 md:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Megaphone className="h-6 w-6" /></div>
            <div>
              <h2 className="text-2xl font-semibold">For small brands</h2>
              <p className="mt-2 leading-7 text-muted-foreground">Launch product campaigns, review creator fit, and issue unique coupon codes to approved creators.</p>
            </div>
            <FeatureList items={["Draft and publish campaigns", "Review applicant profiles", "Assign creator coupon codes"]} />
            <Button asChild><Link href="/register?role=BRAND">Join as Brand <ArrowRight className="h-4 w-4" /></Link></Button>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-secondary bg-secondary/45">
          <CardContent className="space-y-5 p-6 md:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm"><UsersRound className="h-6 w-6" /></div>
            <div>
              <h2 className="text-2xl font-semibold">For nano creators</h2>
              <p className="mt-2 leading-7 text-muted-foreground">Discover campaigns, apply with context, and track whether brands accepted, rejected, or assigned coupon codes.</p>
            </div>
            <FeatureList items={["Browse live campaigns", "Apply with a short message", "Track coupon and status details"]} />
            <Button asChild variant="outline"><Link href="/register?role=CREATOR">Join as Creator <ArrowRight className="h-4 w-4" /></Link></Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="container pb-14 pt-8 md:pb-20">
      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 text-center shadow-[0_26px_70px_-34px_rgba(15,118,110,0.45)] backdrop-blur md:p-10">
        <div className="pastel-chip mx-auto"><Ticket className="mr-2 h-4 w-4 text-primary" />Performance-based collaboration</div>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">Start with campaigns, creator applications, and coupon-linked tracking.</h2>
        <p className="mx-auto mt-3 max-w-2xl leading-7 text-muted-foreground">CollabKart keeps V1 focused: campaign setup, creator review, coupon assignment, and clear application outcomes.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg"><Link href="/register?role=BRAND">Launch a brand campaign</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/register?role=CREATOR">Find creator campaigns</Link></Button>
        </div>
      </div>
    </section>
  );
}

function ValueCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="mb-2 text-primary">{icon}</div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}

function ProblemCard({ title, text }: { title: string; text: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <div key={item} className="flex items-center gap-2 text-sm font-medium text-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}
