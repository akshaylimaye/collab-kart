import { AlertCircle, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <Card>
      <CardContent className="flex min-h-40 items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {label}
      </CardContent>
    </Card>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex min-h-40 flex-col items-center justify-center p-6 text-center">
        <Search className="mb-3 h-6 w-6 text-muted-foreground" />
        <p className="font-medium">{title}</p>
        {description ? <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p> : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </CardContent>
    </Card>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card>
      <CardContent className="flex min-h-40 flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="mb-3 h-6 w-6 text-destructive" />
        <p className="font-medium">Something went wrong</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
        {onRetry ? <Button className="mt-4" variant="outline" onClick={onRetry}>Try again</Button> : null}
      </CardContent>
    </Card>
  );
}
