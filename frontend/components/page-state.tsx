import { AlertCircle, FileText, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <Card>
      <CardContent className="flex min-h-44 items-center justify-center gap-3 p-6 text-sm font-medium text-muted-foreground">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
        </span>
        {label}
      </CardContent>
    </Card>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex min-h-48 flex-col items-center justify-center p-7 text-center">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/70 text-secondary-foreground ring-1 ring-secondary">
          <Search className="h-6 w-6" />
        </span>
        <p className="font-semibold text-foreground">{title}</p>
        {description ? <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p> : null}
        {action ? <div className="mt-5">{action}</div> : null}
      </CardContent>
    </Card>
  );
}

export function InlineEmptyState({ title, description, action, className }: { title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-white/60 p-6 text-center shadow-sm", className)}>
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/45 text-accent-foreground">
        <FileText className="h-5 w-5" />
      </span>
      <p className="font-semibold text-foreground">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card>
      <CardContent className="flex min-h-44 flex-col items-center justify-center p-7 text-center">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-destructive ring-1 ring-red-100">
          <AlertCircle className="h-6 w-6" />
        </span>
        <p className="font-semibold text-foreground">Something went wrong</p>
        <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{message}</p>
        {onRetry ? <Button className="mt-5" variant="outline" onClick={onRetry}>Try again</Button> : null}
      </CardContent>
    </Card>
  );
}
