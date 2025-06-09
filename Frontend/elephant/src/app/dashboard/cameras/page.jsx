"use client"
import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Camera, Play, Pause, Eye, Maximize, Plus, X, Edit2, Trash2 } from "lucide-react"

// Modal for adding or editing a camera
function CameraModal({ open, onClose, onSubmit, initialData, isEdit }) {
    const [ip, setIp] = useState(initialData?.ip || "")
    const [name, setName] = useState(initialData?.name || "")
    const [location, setLocation] = useState(initialData?.location || "")

    // Reset fields when modal opens/closes or initialData changes
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
                        <label className="block text-sm font-medium mb-1">Stream URL</label>
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

// Delete confirmation modal
function DeleteModal({ open, onClose, onConfirm, cameraName }) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg w-full max-w-md p-6 relative">
                <h2 className="text-xl font-semibold mb-4 text-red-600">Delete Camera</h2>
                <p className="mb-6">
                    Are you sure you want to delete <strong>{cameraName}</strong>? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} className="flex-1">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
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
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [editingCamera, setEditingCamera] = useState(null)
    const [deletingCamera, setDeletingCamera] = useState(null)

    // Load cameras from localStorage on component mount
    useEffect(() => {
        const savedCameras = localStorage.getItem('elephantCameras')
        if (savedCameras) {
            setCameras(JSON.parse(savedCameras))
        }
    }, [])

    // Save cameras to localStorage whenever cameras change
    useEffect(() => {
        localStorage.setItem('elephantCameras', JSON.stringify(cameras))
    }, [cameras])

    const handleImageLoad = (cameraId) => {
        console.log(`Camera ${cameraId} loaded successfully`)
        setLoadingStates(prev => ({ ...prev, [cameraId]: false }))
        setErrorStates(prev => ({ ...prev, [cameraId]: false }))
        
        // Update camera status to online when image loads
        setCameras(prev =>
            prev.map(cam =>
                cam.id === cameraId
                    ? { ...cam, status: "online" }
                    : cam
            )
        )
    }

    const handleImageError = (cameraId) => {
        console.log(`Camera ${cameraId} failed to load`)
        setLoadingStates(prev => ({ ...prev, [cameraId]: false }))
        setErrorStates(prev => ({ ...prev, [cameraId]: true }))
        
        // Update camera status to offline when image fails
        setCameras(prev =>
            prev.map(cam =>
                cam.id === cameraId
                    ? { ...cam, status: "offline" }
                    : cam
            )
        )
    }

    const handleImageLoadStart = (cameraId) => {
        console.log(`Camera ${cameraId} starting to load`)
        setLoadingStates(prev => ({ ...prev, [cameraId]: true }))
        setErrorStates(prev => ({ ...prev, [cameraId]: false }))
    }

    const openFullScreen = (camera) => {
        if (camera.ip) {
            window.open(camera.ip, '_blank', 'width=1400,height=900,scrollbars=yes,resizable=yes')
        }
    }

    const refreshStream = (camera) => {
        if (camera.ip) {
            const img = document.getElementById(`camera-${camera.id}`)
            if (img) {
                handleImageLoadStart(camera.id)
                // Force reload by changing src
                const newSrc = `${camera.ip}?t=${Date.now()}`
                img.src = newSrc
            }
        }
    }

    // Simplified connection test - just check if URL is valid
    const testCameraConnection = (ip) => {
        try {
            new URL(ip)
            return true
        } catch {
            return false
        }
    }

    const handleAddCamera = (camera) => {
        const newCamera = {
            ...camera,
            id: Date.now(),
            status: "connecting", // Start as connecting, will update based on image load
            recording: true,
            dateAdded: new Date().toISOString(),
        }

        setCameras(prev => [...prev, newCamera])
        
        // Start loading the stream
        setTimeout(() => {
            handleImageLoadStart(newCamera.id)
        }, 100)
    }

    const handleEditCamera = (updatedCamera) => {
        setCameras(prev =>
            prev.map(cam =>
                cam.id === updatedCamera.id
                    ? {
                        ...cam,
                        ...updatedCamera,
                        status: "connecting" // Reset status, will update based on image load
                    }
                    : cam
            )
        )
        
        // Refresh the stream
        setTimeout(() => {
            refreshStream(updatedCamera)
        }, 100)
    }

    const handleDeleteCamera = (cameraId) => {
        setCameras(prev => prev.filter(cam => cam.id !== cameraId))
        setDeleteModalOpen(false)
        setDeletingCamera(null)
    }

    const openEditModal = (camera) => {
        setEditingCamera(camera)
        setEditModalOpen(true)
    }

    const openDeleteModal = (camera) => {
        setDeletingCamera(camera)
        setDeleteModalOpen(true)
    }

    const toggleCameraRecording = (cameraId) => {
        setCameras(prev =>
            prev.map(cam =>
                cam.id === cameraId
                    ? { ...cam, recording: !cam.recording }
                    : cam
            )
        )
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
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

            {/* Delete Camera Modal */}
            <DeleteModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => handleDeleteCamera(deletingCamera?.id)}
                cameraName={deletingCamera?.name}
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

            {/* Camera Grid - Responsive layout */}
            <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
                {cameras.length === 0 && (
                    <Card className="col-span-full">
                        <CardHeader>
                            <CardTitle>No Cameras Added</CardTitle>
                            <CardDescription>Add a camera to start monitoring elephant detection.</CardDescription>
                        </CardHeader>
                    </Card>
                )}

                {cameras.map((camera) => (
                    <Card key={camera.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{camera.name}</CardTitle>
                                <Badge
                                    variant={camera.status === "online" ? "default" : camera.status === "connecting" ? "secondary" : "destructive"}
                                    className={
                                        camera.status === "online" ? "bg-green-500" : 
                                        camera.status === "connecting" ? "bg-yellow-500" : ""
                                    }
                                >
                                    {camera.status}
                                </Badge>
                            </div>
                            <CardDescription>{camera.location}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Optimized Stream container with ideal aspect ratio */}
                            <div className="bg-black rounded-lg overflow-hidden relative group aspect-video w-full">
                                {camera.ip ? (
                                    <>
                                        {loadingStates[camera.id] && (
                                            <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
                                                <div className="text-center">
                                                    <Camera className="h-8 w-8 text-muted-foreground animate-pulse mx-auto mb-3" />
                                                    <p className="text-base text-muted-foreground">Loading stream...</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Connecting to {camera.name}</p>
                                                </div>
                                            </div>
                                        )}
                                        {errorStates[camera.id] && (
                                            <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
                                                <div className="text-center">
                                                    <Camera className="h-8 w-8 text-red-500 mx-auto mb-3" />
                                                    <p className="text-base text-red-500 mb-2">Stream unavailable</p>
                                                    <p className="text-xs text-muted-foreground mb-3">Cannot connect to camera</p>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => refreshStream(camera)}
                                                    >
                                                        Retry Connection
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        <img
                                            id={`camera-${camera.id}`}
                                            src={camera.ip}
                                            alt={`${camera.name} live stream`}
                                            className="w-full h-full object-fit bg-black"
                                            onLoad={() => handleImageLoad(camera.id)}
                                            onError={() => handleImageError(camera.id)}
                                            onLoadStart={() => handleImageLoadStart(camera.id)}
                                            style={{
                                                display: (errorStates[camera.id] || loadingStates[camera.id]) ? 'none' : 'block'
                                            }}
                                        />
                                        {camera.recording && camera.status === "online" && !errorStates[camera.id] && (
                                            <div className="absolute top-3 right-3">
                                                <div className="flex items-center space-x-2 bg-red-500 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-lg">
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                                    <span>LIVE</span>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                            <p className="text-base text-muted-foreground mb-1">No Stream URL</p>
                                            <p className="text-xs text-muted-foreground">
                                                Edit camera to add stream URL
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Compact control section */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                        camera.recording && camera.status === "online"
                                            ? "bg-red-500 animate-pulse"
                                            : camera.status === "connecting"
                                            ? "bg-yellow-500 animate-pulse"
                                            : "bg-gray-400"
                                    }`}></div>
                                    <span className="text-xs font-medium">
                                        {camera.status === "online" && camera.recording
                                            ? "Detection Active"
                                            : camera.status === "connecting"
                                            ? "Connecting..."
                                            : "Inactive"}
                                    </span>
                                </div>

                                <div className="flex space-x-1">
                                    {/* <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openFullScreen(camera)}
                                        disabled={!camera.ip}
                                        title="View Full Screen"
                                        className="h-8 w-8 p-0"
                                    >
                                        <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => refreshStream(camera)}
                                        disabled={!camera.ip}
                                        title="Refresh Stream"
                                        className="h-8 w-8 p-0"
                                    >
                                        <Camera className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => toggleCameraRecording(camera.id)}
                                        disabled={camera.status === "offline"}
                                        title={camera.recording ? "Stop Monitoring" : "Start Monitoring"}
                                        className="h-8 w-8 p-0"
                                    >
                                        {camera.recording ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                                    </Button> */}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openEditModal(camera)}
                                        title="Edit Camera"
                                        className="h-8 w-8 p-0"
                                    >
                                        <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openDeleteModal(camera)}
                                        title="Delete Camera"
                                        className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>

                            {/* Compact camera info */}
                            {camera.ip && (
                                <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-foreground">Status:</span>
                                        <span className={
                                            camera.status === "online" ? "text-green-600" : 
                                            camera.status === "connecting" ? "text-yellow-600" : 
                                            "text-red-600"
                                        }>
                                            {camera.status === "online" ? "Streaming" : 
                                             camera.status === "connecting" ? "Connecting" : 
                                             "Offline"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-foreground">URL:</span>
                                        <span className="font-mono text-xs truncate max-w-[200px]">{camera.ip}</span>
                                    </div>
                                    {camera.dateAdded && (
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-foreground">Added:</span>
                                            <span>{new Date(camera.dateAdded).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Compact system information */}
            <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">System Overview</h3>
                <div className="grid gap-3 grid-cols-2 md:grid-cols-4 text-sm">
                    <div className="text-center p-3 bg-background rounded-md">
                        <p className="text-xl font-bold text-green-600">{cameras.filter(c => c.status === "online").length}</p>
                        <p className="text-muted-foreground text-xs">Active Cameras</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-md">
                        <p className="text-sm font-semibold">{cameras[0] ? cameras[0].name : "None"}</p>
                        <p className="text-muted-foreground text-xs">Primary Camera</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-md">
                        <p className="text-sm font-semibold">MJPEG</p>
                        <p className="text-muted-foreground text-xs">Stream Format</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-md">
                        <p className="text-sm font-semibold">Live AI</p>
                        <p className="text-muted-foreground text-xs">Detection Mode</p>
                    </div>
                </div>
            </div>
        </div>
    )
}