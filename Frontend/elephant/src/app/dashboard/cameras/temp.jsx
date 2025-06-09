"use client"
import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Camera, Play, Pause, Eye, Maximize, Plus, X, Edit2 } from "lucide-react"

// Modal for adding or editing a camera
function CameraModal({ open, onClose, onSubmit, initialData, isEdit }) {
  const [ip, setIp] = useState(initialData?.ip || "")
  const [name, setName] = useState(initialData?.name || "")
  const [location, setLocation] = useState(initialData?.location || "")

  // Reset fields when modal opens/closes or initialData+ changes
  React.useEffect(() => {
    setIp(initialData?.ip || "")
    setName(initialData?.name || "")
    setLocation(initialData?.location || "")
  }, [open, initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!ip || !name || !location) return
    onSubmit({
      ...initialData,
      ip,
      name,
      location,
    })
    setIp("")
    setName("")
    setLocation("")
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Camera className="h-5 w-5 mr-2" /> {isEdit ? "Edit Camera" : "Add Camera"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Camera Name</label>
            <input
              className="w-full border rounded px-3 py-2 bg-muted"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="e.g. Front Entrance"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">IP Address / Stream URL</label>
            <input
              className="w-full border rounded px-3 py-2 bg-muted"
              value={ip}
              onChange={e => setIp(e.target.value)}
              required
              placeholder="e.g. http://127.0.0.1:8000/main/"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              className="w-full border rounded px-3 py-2 bg-muted"
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
              placeholder="e.g. Building A"
            />
          </div>
          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" /> {isEdit ? "Save Changes" : "Add Camera"}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function CamerasPage() {
  const [cameras, setCameras] = useState([])
  const [loadingStates, setLoadingStates] = useState({})
  const [errorStates, setErrorStates] = useState({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingCamera, setEditingCamera] = useState(null)

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

  const handleAddCamera = (camera) => {
    setCameras(prev => [
      ...prev,
      {
        ...camera,
        id: Date.now(),
        status: "online",
        recording: true,
      }
    ])
  }

  const handleEditCamera = (updatedCamera) => {
    setCameras(prev =>
      prev.map(cam => cam.id === updatedCamera.id ? { ...cam, ...updatedCamera } : cam)
    )
  }

  const openEditModal = (camera) => {
    setEditingCamera(camera)
    setEditModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Add Camera Modal */}
      <CameraModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddCamera}
        isEdit={false}
      />
      {/* Edit Camera Modal */}
      <CameraModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditCamera}
        initialData={editingCamera}
        isEdit={true}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Elephant Detection Cameras</h1>
          <p className="text-muted-foreground">Monitor and manage your elephant detection cameras</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Camera className="h-4 w-4 mr-2" />
          Add Camera
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cameras.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Cameras Added</CardTitle>
              <CardDescription>Add a camera to start monitoring.</CardDescription>
            </CardHeader>
          </Card>
        )}
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
                    {loadingStates[camera.id] && (
                      <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
                        <div className="text-center">
                          <Camera className="h-8 w-8 text-muted-foreground animate-pulse mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Loading stream...</p>
                        </div>
                      </div>
                    )}
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
                    {camera.recording && !errorStates[camera.id] && (
                      <div className="absolute top-2 right-2">
                        <div className="flex items-center space-x-1 bg-red-500 text-white px-2 py-1 rounded text-xs">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                          <span>LIVE</span>
                        </div>
                      </div>
                    )}
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(camera)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
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
      <div className="mt-8 p-4 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Stream Information</h3>
        <div className="grid gap-2 text-sm">
          <p><strong>Active Streams:</strong> {cameras.filter(c => c.status === "online").length} of {cameras.length}</p>
          <p><strong>Main Detection Camera:</strong> {cameras[0] ? `${cameras[0].name} (${cameras[0].location})` : "None"}</p>
          <p><strong>Stream Format:</strong> MJPEG over HTTP</p>
          <p><strong>Refresh Rate:</strong> ~30 FPS</p>
        </div>
      </div>
    </div>
  )
}
