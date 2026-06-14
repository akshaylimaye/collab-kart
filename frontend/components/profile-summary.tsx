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
          <p className="mt-1 text-sm text-muted-foreground">{complete ? "Your profile has the key details brands need." : "Add the missing details to make your profile easier to review."}</p>
        </div>
        <Button asChild variant="outline" size="sm"><Link href={editHref}>Edit profile</Link></Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm"><span className="font-medium">Completion</span><span className="text-muted-foreground">{percentage}%</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} /></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {summary.map((item) => (
            <div key={item.label} className="rounded-md border bg-background p-3">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 truncate text-sm font-medium">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-md bg-secondary/70 p-3">
          <div className="flex items-start gap-2 text-sm">
            {complete ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> : <AlertCircle className="mt-0.5 h-4 w-4 text-accent-foreground" />}
            <div>
              <p className="font-medium">{complete ? "Profile completed" : "Missing fields"}</p>
              <p className="mt-1 text-muted-foreground">{complete ? "No missing profile fields." : missingFields.join(", ")}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
