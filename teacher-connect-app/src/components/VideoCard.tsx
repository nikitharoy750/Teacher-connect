import React, { useState } from 'react'
import { Play, ThumbsUp, Download, Heart, Share2, MoreVertical, Volume2 } from 'lucide-react'
import AudioConversionModal from './AudioConversionModal'

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
  teacher: {
    name: string
    avatar: string
    rating: number
  }
  tags: string[]
}

interface VideoCardProps {
  video: Video
  onPlay: (video: Video) => void
  onLike: (videoId: string) => void
  onDownload: (videoId: string) => void
  onAddToFavorites: (videoId: string) => void

  isLiked?: boolean
  isFavorited?: boolean
  layout?: 'grid' | 'list'
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPlay,
  onLike,
  onDownload,
  onAddToFavorites,

  isLiked = false,
  isFavorited = false,
  layout = 'grid'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showAudioConversion, setShowAudioConversion] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  const formatViews = (views: number) => {
    if (views < 1000) return views.toString()
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K`
    return `${(views / 1000000).toFixed(1)}M`
  }

  if (layout === 'list') {
    return (
      <div className="card p-0 overflow-hidden hover:shadow-xl transition-all duration-300 group">
        <div className="flex">
          {/* Thumbnail */}
          <div className="relative w-64 h-36 bg-gray-200 flex-shrink-0">
            <img
              src={video.thumbnail}
              alt={video.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <Play className="h-8 w-8 text-gray-400" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
              <button
                onClick={() => onPlay(video)}
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transform scale-75 group-hover:scale-100"
              >
                <Play className="h-8 w-8 text-primary ml-1" />
              </button>
            </div>
            
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
              {video.duration}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {video.description}
                </p>
              </div>
              
              <div className="relative ml-4">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="h-5 w-5 text-gray-500" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[160px]">
                    <button
                      onClick={() => {
                        onAddToFavorites(video.id)
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Heart className={`h-4 w-4 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
                      <span>{isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAudioConversion(true)
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Volume2 className="h-4 w-4 text-gray-500" />
                      <span>Convert to Audio</span>
                    </button>
                    <button
                      onClick={() => {
                        onDownload(video.id)
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4 text-gray-500" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => setShowMenu(false)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Share2 className="h-4 w-4 text-gray-500" />
                      <span>Share</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <img
                  src={video.teacher.avatar}
                  alt={video.teacher.name}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-medium">{video.teacher.name}</span>
              </div>
              <span>•</span>
              <span>{formatViews(video.views)} views</span>
              <span>•</span>
              <span>{formatDate(video.uploadDate)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="badge badge-primary">{video.subject}</span>
                <span className="badge badge-secondary">{video.gradeLevel}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onLike(video.id)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                    isLiked 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{video.likes}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid layout
  return (
    <div className="card p-0 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200">
        <img
          src={video.thumbnail}
          alt={video.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <Play className="h-8 w-8 text-gray-400" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={() => onPlay(video)}
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transform scale-75 group-hover:scale-100"
          >
            <Play className="h-8 w-8 text-primary ml-1" />
          </button>
        </div>
        
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
          {video.duration}
        </div>

        <div className="absolute top-2 right-2">
          <button
            onClick={() => onAddToFavorites(video.id)}
            className={`p-2 rounded-full transition-all duration-300 ${
              isFavorited 
                ? 'bg-red-500 text-white' 
                : 'bg-black bg-opacity-50 text-white hover:bg-opacity-75'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start space-x-3 mb-3">
          <img
            src={video.teacher.avatar}
            alt={video.teacher.name}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              {video.title}
            </h3>
            <p className="text-xs text-gray-600 mb-2">{video.teacher.name}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{formatViews(video.views)} views</span>
              <span>•</span>
              <span>{formatDate(video.uploadDate)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="badge badge-primary text-xs">{video.subject}</span>
            <span className="badge badge-secondary text-xs">{video.gradeLevel}</span>
          </div>
          
          <button
            onClick={() => onLike(video.id)}
            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
              isLiked 
                ? 'bg-primary text-white' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <ThumbsUp className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">{video.likes}</span>
          </button>
        </div>
      </div>

      {/* Audio Conversion Modal */}
      {showAudioConversion && (
        <AudioConversionModal
          video={{
            id: video.id,
            title: video.title,
            description: video.description,
            videoUrl: `https://demo-storage.supabase.co/videos/${video.id}.mp4`,
            thumbnailUrl: video.thumbnail,
            teacher: video.teacher,
            subject: video.subject,
            gradeLevel: video.gradeLevel,
            duration: video.duration,
            views: video.views,
            likes: video.likes,
            uploadDate: video.uploadDate
          }}
          onClose={() => setShowAudioConversion(false)}
        />
      )}
    </div>
  )
}

export default VideoCard
