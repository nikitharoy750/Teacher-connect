import React, { useState, useEffect } from 'react'
import { Download, Trash2, HardDrive, Wifi, WifiOff, FileText, Video, Volume2, Clock, Eye } from 'lucide-react'
import { OfflineService, type OfflineContent } from '../services/offlineService'

const OfflineManager: React.FC = () => {
  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([])
  const [storageUsage, setStorageUsage] = useState({ used: 0, available: 0 })
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    loadOfflineContent()
    updateStorageUsage()

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadOfflineContent = () => {
    const content = OfflineService.getOfflineContent()
    setOfflineContent(content)
  }

  const updateStorageUsage = async () => {
    try {
      const usage = await OfflineService.getStorageUsage()
      setStorageUsage(usage)
    } catch (error) {
      console.error('Error getting storage usage:', error)
    }
  }

  const handleRemoveContent = (contentId: string) => {
    if (confirm('Are you sure you want to remove this content from offline storage?')) {
      OfflineService.removeOfflineContent(contentId)
      loadOfflineContent()
      updateStorageUsage()
    }
  }

  const handleAccessContent = (content: OfflineContent) => {
    OfflineService.updateLastAccessed(content.id)
    loadOfflineContent()
    
    // In a real app, this would open the content
    alert(`Opening ${content.title} (offline mode)`)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="text-blue-500" size={20} />
      case 'audio': return <Volume2 className="text-green-500" size={20} />
      case 'note': return <FileText className="text-purple-500" size={20} />
      default: return <FileText className="text-gray-500" size={20} />
    }
  }

  const storagePercentage = storageUsage.available > 0 
    ? (storageUsage.used / storageUsage.available) * 100 
    : 0

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <HardDrive className="mr-2" />
          Offline Content Manager
        </h3>
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <div className="flex items-center text-green-600">
              <Wifi size={16} className="mr-1" />
              <span className="text-sm font-medium">Online</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <WifiOff size={16} className="mr-1" />
              <span className="text-sm font-medium">Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Storage Usage */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Storage Usage</span>
          <span className="text-sm text-gray-600">
            {formatFileSize(storageUsage.used)} / {formatFileSize(storageUsage.available)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              storagePercentage > 80 ? 'bg-red-500' : 
              storagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(storagePercentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {storagePercentage.toFixed(1)}% used
        </p>
      </div>

      {/* Offline Support Check */}
      {!OfflineService.isOfflineSupported() && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <WifiOff className="text-yellow-600 mr-2" size={20} />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Limited Offline Support
              </p>
              <p className="text-xs text-yellow-700">
                Your browser has limited offline capabilities. Some features may not work properly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content List */}
      {offlineContent.length === 0 ? (
        <div className="text-center py-12">
          <Download className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 mb-2">No offline content available</p>
          <p className="text-sm text-gray-500">
            Download videos, audio, or notes from the library to access them offline
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              Downloaded Content ({offlineContent.length} items)
            </h4>
            <button
              onClick={() => {
                OfflineService.cleanupOldContent(20)
                loadOfflineContent()
                updateStorageUsage()
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clean up old content
            </button>
          </div>

          <div className="grid gap-4">
            {offlineContent.map(content => (
              <div
                key={content.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getContentIcon(content.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 truncate">
                        {content.title}
                      </h5>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {content.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Download size={12} className="mr-1" />
                          {new Date(content.downloaded_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock size={12} className="mr-1" />
                          {new Date(content.last_accessed).toLocaleDateString()}
                        </span>
                        <span>{formatFileSize(content.file_size)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleAccessContent(content)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Open content"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleRemoveContent(content.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Remove from offline storage"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">💡 Offline Tips</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Download content while connected to WiFi to save mobile data</li>
          <li>• Regularly clean up old content to free up storage space</li>
          <li>• Content summaries are available even when offline</li>
          <li>• Downloaded content expires after 30 days of inactivity</li>
        </ul>
      </div>
    </div>
  )
}

export default OfflineManager
