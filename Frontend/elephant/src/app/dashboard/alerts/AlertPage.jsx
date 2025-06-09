"use client";
import { api } from "../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import { CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import moment from "moment";

function AlertPage() {
  const alerts = useQuery(api.functions.ElephantData.getAlerts);
  if (!alerts) {
    return <div>Loading...</div>;
  }
  if (alerts.length === 0) {
    return <div>No alerts found.</div>;
  }
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alerts.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Under 5 Minutes
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {
                alerts.filter(
                  (alert) =>
                    moment().diff(moment(alert._creationTime), "minutes") < 5
                ).length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under an Hour</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {
                alerts.filter(
                  (alert) =>
                    moment().diff(moment(alert._creationTime), "minutes") < 60
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        {alerts?.map((alert) => (
          <Card
            key={alert._id}
            className={`${alert.confidence > 90 ? "border-red-200" : ""}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle
                    className={`h-5 w-5 ${
                      alert.confidence > 90
                        ? "text-red-500"
                        : alert.confidence > 80
                          ? "text-yellow-500"
                          : "text-blue-500"
                    }`}
                  />
                  <div>
                    <CardTitle className="text-lg">{alert?.message}</CardTitle>
                    <CardDescription>{alert?.type}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      alert?.confidence > 90
                        ? "destructive"
                        : alert?.confidence > 80
                          ? "secondary"
                          : "default"
                    }
                    className={
                      alert?.confidence > 90
                        ? "bg-yellow-500"
                        : alert?.confidence > 80
                          ? "bg-blue-500"
                          : ""
                    }
                  >
                    {alert?.confidence}% Confidence
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      alert?.status === "active"
                        ? "border-red-500 text-red-700"
                        : alert?.status === "investigating"
                          ? "border-yellow-500 text-yellow-700"
                          : alert?.status === "resolved"
                            ? "border-green-500 text-green-700"
                            : "border-blue-500 text-blue-700"
                    }
                  >
                    {alert?.camera_id
                      ? "Camera: " + alert?.camera_id
                      : "No Camera"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <div className="flex p-4">
              <img
                src={process.env.NEXT_PUBLIC_BACKEND + alert?.image_path}
                alt="Alert Image"
                className="w-62  rounded-3xl object-cover mb-4"
              />
            </div>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{alert?.location}</span>
                  <span>•</span>
                  <span>{moment(alert?._creationTime).fromNow()}</span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    Investigate
                  </Button>
                  <Button size="sm" variant="outline">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AlertPage;
