import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, X } from "lucide-react";
import AlertPage from "./AlertPage";

export async function getAlerts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/useData`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch alerts");
  }

  return res.json();
}

export default async function AlertsPage() {
  const alerts = await getAlerts();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Alerts</h1>
          <p className="text-muted-foreground">
            Monitor and respond to security alerts
          </p>
        </div>
        <Button>
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark All Read
        </Button>
      </div>
      {/* Alert Summary */}

      {/* Alerts List */}
      <div className="flex flex-col gap-3">
        <AlertPage />
      </div>
    </div>
  );
}
