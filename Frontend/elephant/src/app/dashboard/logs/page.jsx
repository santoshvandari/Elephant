import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Search, Filter } from "lucide-react"

const logs = [
  {
    id: 1,
    timestamp: "2024-01-15 14:30:25",
    level: "INFO",
    source: "Camera System",
    message: "Camera 12 motion detection triggered",
    user: "System",
  },
  {
    id: 2,
    timestamp: "2024-01-15 14:28:15",
    level: "WARNING",
    source: "Access Control",
    message: "Failed login attempt from IP 192.168.1.100",
    user: "Unknown",
  },
  {
    id: 3,
    timestamp: "2024-01-15 14:25:10",
    level: "INFO",
    source: "User Management",
    message: "User admin@company.com logged in successfully",
    user: "admin@company.com",
  },
  {
    id: 4,
    timestamp: "2024-01-15 14:20:05",
    level: "ERROR",
    source: "Camera System",
    message: "Camera 4 connection lost",
    user: "System",
  },
  {
    id: 5,
    timestamp: "2024-01-15 14:15:30",
    level: "INFO",
    source: "Backup System",
    message: "Daily backup completed successfully",
    user: "System",
  },
]

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
          <p className="text-muted-foreground">View and analyze system activity logs</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search logs..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Badge
                  variant={log.level === "ERROR" ? "destructive" : log.level === "WARNING" ? "secondary" : "default"}
                  className={log.level === "INFO" ? "bg-blue-500" : log.level === "WARNING" ? "bg-yellow-500" : ""}
                >
                  {log.level}
                </Badge>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{log.message}</p>
                    <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Source: {log.source}</span>
                    <span>User: {log.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
