import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Camera, Settings, Play, Pause } from "lucide-react"

const cameras = [
  { id: 1, name: "Front Entrance", location: "Building A", status: "online", recording: true },
  { id: 2, name: "Parking Lot", location: "Outdoor", status: "online", recording: true },
  { id: 3, name: "Reception Area", location: "Building A", status: "online", recording: false },
  { id: 4, name: "Server Room", location: "Building B", status: "offline", recording: false },
  { id: 5, name: "Emergency Exit", location: "Building A", status: "online", recording: true },
  { id: 6, name: "Loading Dock", location: "Warehouse", status: "online", recording: true },
]

export default function CamerasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cameras</h1>
          <p className="text-muted-foreground">Monitor and manage your security cameras</p>
        </div>
        <Button>
          <Camera className="h-4 w-4 mr-2" />
          Add Camera
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cameras.map((camera) => (
          <Card key={camera.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{camera.name}</CardTitle>
                <Badge
                  variant={camera.status === "online" ? "default" : "destructive"}
                  className={camera.status === "online" ? "bg-green-500" : ""}
                >
                  {camera.status}
                </Badge>
              </div>
              <CardDescription>{camera.location}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Camera className="h-12 w-12 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${camera.recording ? "bg-red-500" : "bg-gray-400"}`}></div>
                  <span className="text-sm text-muted-foreground">
                    {camera.recording ? "Recording" : "Not Recording"}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    {camera.recording ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3" />
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
