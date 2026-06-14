import Link from "next/link";
import { ArrowRight, BadgeCheck, ChartNoAxesColumnIncreasing, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <main className="page-shell">
      <header className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold">CollabKart</Link>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost"><Link href="/login">Login</Link></Button>
          <Button asChild><Link href="/register">Get started</Link></Button>
        </div>
      </header>
      <section className="container grid min-h-[calc(100vh-4rem)] items-center gap-10 py-10 lg:grid-cols-[1fr_0.9fr]">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex rounded-md bg-secondary px-3 py-1 text-sm text-muted-foreground">Creator commerce, made direct</div>
          <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">CollabKart</h1>
          <p className="text-lg text-muted-foreground">A clean workspace for brands to launch commission campaigns and creators to discover products worth sharing.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg"><Link href="/register">Create account <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/login">Sign in</Link></Button>
          </div>
        </div>
        <div className="grid gap-4">
          <Card>
            <CardHeader><CardTitle>Live campaign board</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                ["Skincare launch", "PENDING REVIEW", "18% commission"],
                ["Coffee bundle", "LIVE", "Rs. 450 fixed"],
                ["Fitness gear", "DRAFT", "12% commission"]
              ].map(([title, status, commission]) => (
                <div key={title} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">{commission}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{status}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardContent className="p-4"><Handshake className="mb-3 h-5 w-5 text-primary" /><p className="text-sm font-medium">Apply fast</p></CardContent></Card>
            <Card><CardContent className="p-4"><BadgeCheck className="mb-3 h-5 w-5 text-primary" /><p className="text-sm font-medium">Review simply</p></CardContent></Card>
            <Card><CardContent className="p-4"><ChartNoAxesColumnIncreasing className="mb-3 h-5 w-5 text-primary" /><p className="text-sm font-medium">Track status</p></CardContent></Card>
          </div>
        </div>
      </section>
    </main>
  );
}
