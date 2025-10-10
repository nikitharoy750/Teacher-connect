import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Settings, Download, Heart, Share2 } from 'lucide-react'
import AudioConversionModal from './AudioConversionModal'

interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl?: string
  teacher: {
    name: string
    avatar: string
  }
  subject: string
  gradeLevel: string
  duration: string
  views: number
  likes: number
  uploadDate: string
}

interface VideoPlayerProps {
  video: Video
  onClose: () => void
  onLike: (videoId: string) => void
  onDownload: (videoId: string) => void

  isLiked?: boolean
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onClose,
  onLike,
  onDownload,

  isLiked = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [, setIsFullscreen] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [showAudioConversion, setShowAudioConversion] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [])

  // Handle escape key to close player
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newTime = (parseFloat(e.target.value) / 100) * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = parseFloat(e.target.value) / 100
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const skip = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
  }

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = rate
    setPlaybackRate(rate)
    setShowSettings(false)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-75 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold">{video.title}</h1>
            <p className="text-gray-300 text-sm">by {video.teacher.name} • {video.subject} • {video.gradeLevel}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onLike(video.id)}
            className={`p-2 rounded-lg transition-colors ${
              isLiked ? 'bg-red-500 text-white' : 'hover:bg-white hover:bg-opacity-20'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => setShowAudioConversion(true)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Convert to Audio"
          >
            <Volume2 className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDownload(video.id)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Share"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnailUrl}
          className="max-w-full max-h-full"
          onClick={togglePlay}
          onMouseMove={() => setShowControls(true)}
        />

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-colors"
          >
            <div className="bg-white bg-opacity-90 rounded-full p-6">
              <Play className="h-12 w-12 text-black ml-1" />
            </div>
          </button>
        )}

        {/* Video Controls */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercentage}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <button onClick={() => skip(-10)} className="p-2 hover:bg-white hover:bg-opacity-20 rounded">
                  <SkipBack className="h-5 w-5" />
                </button>
                <button onClick={togglePlay} className="p-3 hover:bg-white hover:bg-opacity-20 rounded-full">
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                </button>
                <button onClick={() => skip(10)} className="p-2 hover:bg-white hover:bg-opacity-20 rounded">
                  <SkipForward className="h-5 w-5" />
                </button>
                
                <div className="flex items-center space-x-2">
                  <button onClick={toggleMute} className="p-2 hover:bg-white hover:bg-opacity-20 rounded">
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume * 100}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                  
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 rounded-lg p-3 min-w-[120px]">
                      <p className="text-sm font-medium mb-2">Playback Speed</p>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-white hover:bg-opacity-20 ${
                            playbackRate === rate ? 'bg-white bg-opacity-20' : ''
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <button onClick={toggleFullscreen} className="p-2 hover:bg-white hover:bg-opacity-20 rounded">
                  <Maximize className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Info Sidebar (Optional) */}
      <div className="bg-gray-900 text-white p-6 max-h-48 overflow-y-auto">
        <div className="flex items-start space-x-4">
          <img
            src={video.teacher.avatar}
            alt={video.teacher.name}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <h3 className="font-semibold mb-2">{video.title}</h3>
            <p className="text-gray-300 text-sm mb-3">{video.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>{video.views.toLocaleString()} views</span>
              <span>{video.likes} likes</span>
              <span>Uploaded {new Date(video.uploadDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Conversion Modal */}
      {showAudioConversion && (
        <AudioConversionModal
          video={video}
          onClose={() => setShowAudioConversion(false)}
        />
      )}
    </div>
  )
}

export default VideoPlayer
