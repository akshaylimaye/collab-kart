import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileSummary({
  title,
  percentage,
  missingFields,
  summary,
  editHref = "#profile-form"
}: {
  title: string;
  percentage: number;
  missingFields: string[];
  summary: Array<{ label: string; value: string | number }>;
  editHref?: string;
}) {
  const complete = missingFields.length === 0;

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{complete ? "Your profile has the key details brands need." : "Add the missing details to make your profile easier to review."}</p>
        </div>
        <Button asChild variant="outline" size="sm"><Link href={editHref}>Edit profile</Link></Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
          <div className="flex items-center justify-between text-sm"><span className="font-semibold text-foreground">Completion</span><span className="font-medium text-primary">{percentage}%</span></div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/85"><div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} /></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {summary.map((item) => (
            <div key={item.label} className="rounded-2xl border border-border/70 bg-white/70 p-3.5 shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
              <p className="mt-1 truncate text-sm font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-white/70 bg-secondary/45 p-4">
          <div className="flex items-start gap-3 text-sm">
            {complete ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />}
            <div>
              <p className="font-semibold text-foreground">{complete ? "Profile completed" : "Missing fields"}</p>
              <p className="mt-1 leading-6 text-muted-foreground">{complete ? "No missing profile fields." : missingFields.join(", ")}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
