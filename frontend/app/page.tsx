import Link from "next/link";
import { ArrowRight, BadgeCheck, Handshake, ShoppingBag, Sparkles, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <main className="page-shell overflow-hidden">
      <header className="container flex min-h-14 items-center justify-between gap-4 py-2">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_14px_30px_-18px_rgba(15,118,110,0.9)]">
            <ShoppingBag className="h-5 w-5" />
          </span>
          CollabKart
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button asChild variant="ghost"><Link href="/login">Login</Link></Button>
          <Button asChild><Link href="/register">Get started</Link></Button>
        </div>
      </header>
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
              <div className="flex h-full items-end justify-between rounded-2xl border border-white/70 bg-white/55 p-3 shadow-sm backdrop-blur">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Featured product</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">Skincare launch kit</p>
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
            <Card><CardContent className="p-3"><Handshake className="mb-2 h-5 w-5 text-primary" /><p className="text-sm font-semibold">No upfront fees</p><p className="mt-1.5 text-xs leading-5 text-muted-foreground">Brands can launch campaigns and reward creators based on results.</p></CardContent></Card>
            <Card><CardContent className="p-3"><BadgeCheck className="mb-2 h-5 w-5 text-primary" /><p className="text-sm font-semibold">Nano creators</p><p className="mt-1.5 text-xs leading-5 text-muted-foreground">Creators discover products they can promote and earn from.</p></CardContent></Card>
            <Card><CardContent className="p-3"><Store className="mb-2 h-5 w-5 text-primary" /><p className="text-sm font-semibold">Simple workflow</p><p className="mt-1.5 text-xs leading-5 text-muted-foreground">Post campaigns, review applicants, and manage collaborations in one place.</p></CardContent></Card>
          </div>
        </div>
      </section>
    </main>
  );
}
