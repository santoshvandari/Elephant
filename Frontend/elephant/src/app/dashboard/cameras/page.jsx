"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Camera, Settings, Play, Pause, Eye, Maximize } from "lucide-react"
import { useState } from "react"

const cameras = [
  { id: 1, ip: "http://127.0.0.1:8000/main/", name: "Front Entrance", location: "Building A", status: "online", recording: true },

]

export default function CamerasPage() {
  const [loadingStates, setLoadingStates] = useState({})
  const [errorStates, setErrorStates] = useState({})

  const handleImageLoad = (cameraId) => {
    setLoadingStates(prev => ({ ...prev, [cameraId]: false }))
    setErrorStates(prev => ({ ...prev, [cameraId]: false }))
  }

  const handleImageError = (cameraId) => {
    setLoadingStates(prev => ({ ...prev, [cameraId]: false }))
    setErrorStates(prev => ({ ...prev, [cameraId]: true }))
  }

  const handleImageLoadStart = (cameraId) => {
    setLoadingStates(prev => ({ ...prev, [cameraId]: true }))
    setErrorStates(prev => ({ ...prev, [cameraId]: false }))
  }

  const openFullScreen = (camera) => {
    if (camera.ip && camera.status === "online") {
      window.open(camera.ip, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
    }
  }

  const refreshStream = (camera) => {
    if (camera.ip) {
      const img = document.getElementById(`camera-${camera.id}`)
      if (img) {
        const newSrc = `${camera.ip}?t=${Date.now()}`
        img.src = newSrc
        handleImageLoadStart(camera.id)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Elephant Detection Cameras</h1>
          <p className="text-muted-foreground">Monitor and manage your elephant detection cameras</p>
        </div>
        <Button>
          <Camera className="h-4 w-4 mr-2" />
          Add Camera
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cameras.map((camera) => (
          <Card key={camera.id} className="overflow-hidden">
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
              <div className="aspect-video bg-muted rounded-lg overflow-hidden relative group">
                {camera.ip && camera.status === "online" ? (
                  <>
                    {/* Loading indicator */}
                    {loadingStates[camera.id] && (
                      <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
                        <div className="text-center">
                          <Camera className="h-8 w-8 text-muted-foreground animate-pulse mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Loading stream...</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Error state */}
                    {errorStates[camera.id] && (
                      <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
                        <div className="text-center">
                          <Camera className="h-8 w-8 text-red-500 mx-auto mb-2" />
                          <p className="text-sm text-red-500 mb-2">Stream unavailable</p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => refreshStream(camera)}
                          >
                            Retry
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Live stream */}
                    <img
                      id={`camera-${camera.id}`}
                      src={camera.ip}
                      alt={`${camera.name} live stream`}
                      className="w-full h-full object-cover"
                      onLoad={() => handleImageLoad(camera.id)}
                      onError={() => handleImageError(camera.id)}
                      onLoadStart={() => handleImageLoadStart(camera.id)}
                      style={{ 
                        display: errorStates[camera.id] ? 'none' : 'block'
                      }}
                    />

                    {/* Live indicator */}
                    {camera.recording && !errorStates[camera.id] && (
                      <div className="absolute top-2 right-2">
                        <div className="flex items-center space-x-1 bg-red-500 text-white px-2 py-1 rounded text-xs">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                          <span>LIVE</span>
                        </div>
                      </div>
                    )}

                    {/* Hover overlay with controls */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => openFullScreen(camera)}
                          variant="secondary"
                          size="sm"
                        >
                          <Maximize className="h-4 w-4 mr-2" />
                          Full Screen
                        </Button>
                        <Button
                          onClick={() => refreshStream(camera)}
                          variant="secondary"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  // Offline camera
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {camera.status === "offline" ? "Camera Offline" : "No Stream Available"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    camera.recording && camera.status === "online" 
                      ? "bg-red-500 animate-pulse" 
                      : "bg-gray-400"
                  }`}></div>
                  <span className="text-sm text-muted-foreground">
                    {camera.recording && camera.status === "online" 
                      ? "Monitoring" 
                      : "Not Active"}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => openFullScreen(camera)}
                    disabled={!camera.ip || camera.status === "offline"}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => refreshStream(camera)}
                    disabled={!camera.ip || camera.status === "offline"}
                  >
                    {camera.recording ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Camera info */}
              {camera.ip && (
                <div className="text-xs text-muted-foreground">
                  <p>Stream: {camera.ip}</p>
                  <p>Status: {camera.status === "online" ? "Connected" : "Disconnected"}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stream Info Section */}
      <div className="mt-8 p-4 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Stream Information</h3>
        <div className="grid gap-2 text-sm">
          <p><strong>Active Streams:</strong> {cameras.filter(c => c.status === "online").length} of {cameras.length}</p>
          <p><strong>Main Detection Camera:</strong> Front Entrance (Building A)</p>
          <p><strong>Stream Format:</strong> MJPEG over HTTP</p>
          <p><strong>Refresh Rate:</strong> ~30 FPS</p>
        </div>
      </div>
    </div>
  )
}
