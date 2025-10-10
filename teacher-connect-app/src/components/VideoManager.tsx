import React, { useState } from 'react'
import { Play, Edit, Trash2, Eye, ThumbsUp, Download, MoreVertical, Calendar } from 'lucide-react'

interface Video {
  id: string
  title: string
  description: string
  subject: string
  gradeLevel: string
  thumbnail: string
  duration: string
  uploadDate: string
  views: number
  likes: number
  status: 'published' | 'processing' | 'draft'
  fileSize: string
}

interface VideoManagerProps {
  videos: Video[]
  onEdit: (video: Video) => void
  onDelete: (videoId: string) => void
  onToggleStatus: (videoId: string) => void
}

const VideoManager: React.FC<VideoManagerProps> = ({ videos, onEdit, onDelete, onToggleStatus: _ }) => {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'likes' | 'title'>('date')
  const [filterBy, setFilterBy] = useState<'all' | 'published' | 'processing' | 'draft'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredVideos = videos
    .filter(video => {
      const matchesFilter = filterBy === 'all' || video.status === filterBy
      const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           video.subject.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesFilter && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        case 'views':
          return b.views - a.views
        case 'likes':
          return b.likes - a.likes
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })



  const handleSelectVideo = (videoId: string) => {
    setSelectedVideos(prev =>
      prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    )
  }

  const getStatusBadge = (status: Video['status']) => {
    switch (status) {
      case 'published':
        return <span className="badge badge-success">Published</span>
      case 'processing':
        return <span className="badge badge-warning">Processing</span>
      case 'draft':
        return <span className="badge badge-secondary">Draft</span>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="processing">Processing</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="date">Sort by Date</option>
            <option value="views">Sort by Views</option>
            <option value="likes">Sort by Likes</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>

        {selectedVideos.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedVideos.length} selected
            </span>
            <button className="btn-error px-4 py-2 text-sm">
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Videos Grid */}
      <div className="grid gap-6">
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No videos found</h3>
            <p className="text-gray-500">
              {searchTerm || filterBy !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first video to get started'
              }
            </p>
          </div>
        ) : (
          filteredVideos.map((video) => (
            <div
              key={video.id}
              className="card hover:shadow-xl transition-all duration-300 p-0 overflow-hidden"
            >
              <div className="flex">
                {/* Thumbnail */}
                <div className="relative w-48 h-32 bg-gray-200 flex-shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    {video.duration}
                  </div>
                  {getStatusBadge(video.status) && (
                    <div className="absolute top-2 left-2">
                      {getStatusBadge(video.status)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedVideos.includes(video.id)}
                          onChange={() => handleSelectVideo(video.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {video.title}
                        </h3>
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {video.description}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(video.uploadDate)}
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {video.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {video.likes.toLocaleString()} likes
                        </span>
                        <span>{video.fileSize}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="badge badge-primary">{video.subject}</span>
                        <span className="badge badge-secondary">{video.gradeLevel}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => onEdit(video)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit video"
                      >
                        <Edit className="h-5 w-5 text-gray-600" />
                      </button>
                      
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download video"
                      >
                        <Download className="h-5 w-5 text-gray-600" />
                      </button>
                      
                      <button
                        onClick={() => onDelete(video.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete video"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                      
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredVideos.length > 0 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredVideos.length} of {videos.length} videos
          </p>
          <div className="flex items-center space-x-2">
            <button className="btn-ghost px-3 py-2 text-sm">Previous</button>
            <button className="btn-primary px-3 py-2 text-sm">1</button>
            <button className="btn-ghost px-3 py-2 text-sm">2</button>
            <button className="btn-ghost px-3 py-2 text-sm">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoManager
