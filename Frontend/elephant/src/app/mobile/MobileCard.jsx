"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, X, Filter, CheckCircle, Camera, Clock } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import moment from "moment";

export default function ElephantWatchDashboard() {
  const alerts = useQuery(api.functions.ElephantData.getAlerts);
  const [showPopup, setShowPopup] = useState(false);

  if (!alerts) {
    return <div>Loading...</div>;
  }

  const handleInvestigate = (alertId) => {
    setShowPopup(alertId);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      {!!showPopup && (
        <div className="fixed h-screen w-full inset-0 bg-black/50 p-5 backdrop-blur-md flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 bg-white shadow-lg">
            <CardContent>
              <div className="flex justify-between flex-col  mb-4">
                <h2 className="text-lg font-semibold">Investigate Alert</h2>
                {/* message */}
                <p className="text-sm text-slate-500">
                  {showPopup.message || "No details available for this alert."}
                </p>
                <p className="text-xs text-slate-400">
                  {moment(showPopup._creationTime).fromNow(true)} ago
                </p>
                <p className="text-xs text-slate-400">
                  Camera: {showPopup.camera_id || "Unknown"}
                </p>

                <img
                  src={showPopup.image_path || "/placeholder.svg"}
                  alt="Alert thumbnail"
                  className="rounded-lg object-cover"
                />
                <Button variant="primary" onClick={() => setShowPopup(false)}>
                  <X className="h-5 w-5" /> Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Alerts Feed */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <Card
            key={alert.id}
            className={`${alert.resolved ? "bg-slate-50 border-slate-200" : "bg-white border-slate-300"} ${
              !alert.resolved && alert.confidence * 100 > 90
                ? "ring-2 ring-red-200"
                : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="relative">
                  <img
                    src={alert.image_path || "/placeholder.svg"}
                    alt="Alert thumbnail"
                    width={60}
                    height={60}
                    className="rounded-lg object-cover"
                  />
                  {!alert.resolved && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <p
                    className={`text-sm font-medium ${alert.resolved ? "text-slate-600" : "text-slate-900"}`}
                  >
                    {alert.message}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Camera className="h-3 w-3" />
                      {alert.camera_id}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {moment(alert._creationTime).fromNow(true)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        alert.confidence > 0.9
                          ? "destructive"
                          : alert.confidence > 0.8
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {(alert.confidence * 100).toFixed(2)}% confidence
                    </Badge>

                    {alert.resolved && (
                      <Badge
                        variant="outline"
                        className="text-xs text-green-600 border-green-200"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolved
                      </Badge>
                    )}
                  </div>

                  {!alert.resolved && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleInvestigate(alert)}
                        className="flex-1 h-8 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Investigate
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Floating Filter Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="rounded-full shadow-lg h-14 w-14 bg-slate-900 hover:bg-slate-800"
        >
          <Filter className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
