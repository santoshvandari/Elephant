"use client"
import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Camera, Play, Pause, Eye, Maximize, Plus, X, Edit2, Trash2, RefreshCw, Monitor } from "lucide-react"

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative border">
                <button
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={onClose}
                >
                    <X className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                    <Camera className="h-5 w-5 mr-2 text-blue-600" /> 
                    {isEdit ? "Edit Camera" : "Add New Camera"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-2">Camera Name</label>
                        <input
                            className="w-full border rounded-lg px-3 py-2.5 bg-muted focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            placeholder="e.g. Front Entrance Camera"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Stream URL</label>
                        <input
                            className="w-full border rounded-lg px-3 py-2.5 bg-muted focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={ip}
                            onChange={e => setIp(e.target.value)}
                            required
                            placeholder="http://127.0.0.1:8000/main/"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Location</label>
                        <input
                            className="w-full border rounded-lg px-3 py-2.5 bg-muted focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            required
                            placeholder="e.g. Building A - Main Entrance"
                        />
                    </div>
                    <Button type="submit" className="w-full mt-6 py-2.5">
                        <Plus className="h-4 w-4 mr-2" /> 
                        {isEdit ? "Save Changes" : "Add Camera"}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative border">
                <h2 className="text-xl font-semibold mb-4 text-red-600 flex items-center">
                    <Trash2 className="h-5 w-5 mr-2" />
                    Delete Camera
                </h2>
                <p className="mb-6 text-muted-foreground">
                    Are you sure you want to delete <strong className="text-foreground">{cameraName}</strong>? 
                    This action cannot be undone and will remove all camera data.
                </p>
                <div className="flex space-x-3">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm} className="flex-1">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Camera
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

    const handleAddCamera = (camera) => {
        const newCamera = {
            ...camera,
            id: Date.now(),
            status: "connecting",
            recording: true,
            dateAdded: new Date().toISOString(),
        }

        setCameras(prev => [...prev, newCamera])
        
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
                        status: "connecting"
                    }
                    : cam
            )
        )
        
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

    const refreshAllStreams = () => {
        cameras.forEach(camera => {
            if (camera.ip) {
                refreshStream(camera)
            }
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Modals */}
                <CameraModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleAddCamera}
                    isEdit={false}
                />

                <CameraModal
                    open={editModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    onSubmit={handleEditCamera}
                    initialData={editingCamera}
                    isEdit={true}
                />

                <DeleteModal
                    open={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={() => handleDeleteCamera(deletingCamera?.id)}
                    cameraName={deletingCamera?.name}
                />

                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Elephant Detection System
                            </h1>
                            <p className="text-muted-foreground mt-2 text-lg">
                                Monitor and manage your AI-powered elephant detection cameras
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button 
                                variant="outline" 
                                onClick={refreshAllStreams}
                                className="border-blue-200 hover:bg-blue-50"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh All
                            </Button>
                            <Button 
                                onClick={() => setModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 shadow-lg"
                            >
                                <Camera className="h-4 w-4 mr-2" />
                                Add Camera
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-4 mb-8">
                    <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-500 rounded-lg">
                                    <Monitor className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-green-700 dark:text-green-400">Active Cameras</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {cameras.filter(c => c.status === "online").length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-500 rounded-lg">
                                    <Camera className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Total Cameras</p>
                                    <p className="text-2xl font-bold text-blue-600">{cameras.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-yellow-500 rounded-lg">
                                    <Eye className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Monitoring</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {cameras.filter(c => c.recording).length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-purple-500 rounded-lg">
                                    <RefreshCw className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-purple-700 dark:text-purple-400">Stream Format</p>
                                    <p className="text-xl font-bold text-purple-600">MJPEG</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Camera Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {cameras.length === 0 && (
                        <Card className="col-span-full border-dashed border-2 border-muted-foreground/25">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <Camera className="h-16 w-16 text-muted-foreground/50 mb-4" />
                                <CardTitle className="text-xl mb-2">No Cameras Added</CardTitle>
                                <CardDescription className="text-center mb-6 max-w-md">
                                    Add your first camera to start monitoring elephant detection. 
                                    Connect your AI-powered cameras to begin real-time surveillance.
                                </CardDescription>
                                <Button onClick={() => setModalOpen(true)}>
                                    <Camera className="h-4 w-4 mr-2" />
                                    Add Your First Camera
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {cameras.map((camera) => (
                        <Card key={camera.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                            <CardHeader className="pb-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-semibold">{camera.name}</CardTitle>
                                        <CardDescription className="text-sm mt-1">{camera.location}</CardDescription>
                                    </div>
                                    <Badge
                                        variant={camera.status === "online" ? "default" : camera.status === "connecting" ? "secondary" : "destructive"}
                                        className={`px-3 py-1 font-medium ${
                                            camera.status === "online" ? "bg-green-500 hover:bg-green-600" : 
                                            camera.status === "connecting" ? "bg-yellow-500 hover:bg-yellow-600 text-black" : ""
                                        }`}
                                    >
                                        {camera.status === "online" ? "🟢 Online" : 
                                         camera.status === "connecting" ? "🟡 Connecting" : 
                                         "🔴 Offline"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="p-6">
                                {/* Stream Display */}
                                <div className="bg-black rounded-xl overflow-hidden relative group aspect-video w-full shadow-inner">
                                    {camera.ip ? (
                                        <>
                                            {loadingStates[camera.id] && (
                                                <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
                                                    <div className="text-center">
                                                        <Camera className="h-10 w-10 text-blue-400 animate-pulse mx-auto mb-3" />
                                                        <p className="text-white font-medium">Connecting to stream...</p>
                                                        <p className="text-blue-400 text-sm mt-1">{camera.name}</p>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {errorStates[camera.id] && (
                                                <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
                                                    <div className="text-center">
                                                        <Camera className="h-10 w-10 text-red-400 mx-auto mb-3" />
                                                        <p className="text-red-400 font-medium mb-2">Stream Unavailable</p>
                                                        <p className="text-gray-400 text-sm mb-4">Cannot connect to camera</p>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => refreshStream(camera)}
                                                            className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                                                        >
                                                            <RefreshCw className="h-4 w-4 mr-2" />
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
                                                <div className="absolute top-4 right-4">
                                                    <div className="flex items-center space-x-2 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
                                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                        <span>LIVE DETECTION</span>
                                                    </div>
                                                </div>
                                            )}
                          
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">
                                                <Camera className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                                <p className="text-gray-400 font-medium mb-2">No Stream URL</p>
                                                <p className="text-gray-500 text-sm">
                                                    Edit camera to add stream URL
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Controls and Info */}
                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-3 h-3 rounded-full ${
                                                camera.recording && camera.status === "online"
                                                    ? "bg-red-500 animate-pulse"
                                                    : camera.status === "connecting"
                                                    ? "bg-yellow-500 animate-pulse"
                                                    : "bg-gray-400"
                                            }`}></div>
                                            <span className="text-sm font-medium">
                                                {camera.status === "online" && camera.recording
                                                    ? "Detection Active"
                                                    : camera.status === "connecting"
                                                    ? "Connecting..."
                                                    : "Inactive"}
                                            </span>
                                        </div>

                                        <div className="flex space-x-2">
                                           
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openEditModal(camera)}
                                                title="Edit Camera"
                                                className="h-9 w-9 p-0 hover:bg-purple-50"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openDeleteModal(camera)}
                                                title="Delete Camera"
                                                className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {camera.ip && (
                                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 p-4 rounded-lg border">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="font-medium text-muted-foreground">Status</p>
                                                    <p className={`font-semibold ${
                                                        camera.status === "online" ? "text-green-600" : 
                                                        camera.status === "connecting" ? "text-yellow-600" : 
                                                        "text-red-600"
                                                    }`}>
                                                        {camera.status === "online" ? "Streaming" : 
                                                         camera.status === "connecting" ? "Connecting" : 
                                                         "Offline"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-muted-foreground">Stream URL</p>
                                                    <p className="font-mono text-s truncate dark:bg-slate-600 px-2 py-1 rounded">
                                                        {camera.ip}
                                                    </p>
                                                </div>
                                                {camera.dateAdded && (
                                                    <div className="col-span-2">
                                                        <p className="font-medium text-muted-foreground">Added</p>
                                                        <p className="text-sm">
                                                            {new Date(camera.dateAdded).toLocaleDateString()} at {new Date(camera.dateAdded).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}