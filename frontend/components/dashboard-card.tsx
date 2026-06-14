import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">{value}</CardTitle>
        <CardDescription>{label}</CardDescription>
      </CardHeader>
    </Card>
  );
}
