import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Clock, X } from "lucide-react"

const alerts = [
  {
    id: 1,
    title: "Motion Detected - Camera 12",
    description: "Unusual movement detected in restricted area",
    severity: "high",
    timestamp: "2 minutes ago",
    status: "active",
    location: "Building A - Floor 2",
  },
  {
    id: 2,
    title: "Low Battery Warning",
    description: "Sensor 8 battery level below 20%",
    severity: "medium",
    timestamp: "15 minutes ago",
    status: "active",
    location: "Parking Lot",
  },
  {
    id: 3,
    title: "Unauthorized Access Attempt",
    description: "Failed keycard access at main entrance",
    severity: "high",
    timestamp: "1 hour ago",
    status: "investigating",
    location: "Main Entrance",
  },
  {
    id: 4,
    title: "System Maintenance Required",
    description: "Camera 15 requires routine maintenance",
    severity: "low",
    timestamp: "2 hours ago",
    status: "scheduled",
    location: "Server Room",
  },
  {
    id: 5,
    title: "Network Connectivity Issue",
    description: "Intermittent connection to Camera 7",
    severity: "medium",
    timestamp: "3 hours ago",
    status: "resolved",
    location: "Loading Dock",
  },
]

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Alerts</h1>
          <p className="text-muted-foreground">Monitor and respond to security alerts</p>
        </div>
        <Button>
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Investigation</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">1</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">8</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className={`${alert.severity === "high" ? "border-red-200" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle
                    className={`h-5 w-5 ${
                      alert.severity === "high"
                        ? "text-red-500"
                        : alert.severity === "medium"
                          ? "text-yellow-500"
                          : "text-blue-500"
                    }`}
                  />
                  <div>
                    <CardTitle className="text-lg">{alert.title}</CardTitle>
                    <CardDescription>{alert.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      alert.severity === "high" ? "destructive" : alert.severity === "medium" ? "secondary" : "default"
                    }
                    className={
                      alert.severity === "medium" ? "bg-yellow-500" : alert.severity === "low" ? "bg-blue-500" : ""
                    }
                  >
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      alert.status === "active"
                        ? "border-red-500 text-red-700"
                        : alert.status === "investigating"
                          ? "border-yellow-500 text-yellow-700"
                          : alert.status === "resolved"
                            ? "border-green-500 text-green-700"
                            : "border-blue-500 text-blue-700"
                    }
                  >
                    {alert.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{alert.location}</span>
                  <span>•</span>
                  <span>{alert.timestamp}</span>
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
  )
}
