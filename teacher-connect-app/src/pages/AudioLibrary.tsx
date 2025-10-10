import React, { useState, useEffect } from 'react'
import { Play, Pause, Download, Trash2, Volume2, Search, Headphones } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { audioConversionService } from '../services/audioConversionService'

const AudioLibrary: React.FC = () => {
  const { user } = useAuth()
  const [audioFiles, setAudioFiles] = useState<any[]>([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map())
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAudioFiles()
  }, [user])

  const loadAudioFiles = () => {
    try {
      setLoading(true)
      const convertedAudios = JSON.parse(localStorage.getItem('converted_audios') || '[]')
      const demoVideos = JSON.parse(localStorage.getItem('demo_videos') || '[]')
      
      // Combine audio data with video metadata
      const audioWithMetadata = convertedAudios.map((audio: any) => {
        const video = demoVideos.find((v: any) => v.id === audio.videoId)
        return {
          ...audio,
          title: video?.title || 'Unknown Video',
          description: video?.description || '',
          subject: video?.subject || '',
          gradeLevel: video?.grade_level || '',
          teacher: getTeacherName(video?.teacher_id || ''),
          thumbnail: video?.thumbnail_url || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&h=150&fit=crop'
        }
      })
      
      setAudioFiles(audioWithMetadata)
    } catch (error) {
      console.error('Failed to load audio files:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTeacherName = (teacherId: string) => {
    const teacherNames: { [key: string]: string } = {
      'demo-teacher': 'Ms. Sharma',
      'demo-teacher-2': 'Mr. Patel',
      'demo-teacher-3': 'Ms. Kumar',
      'demo-teacher-4': 'Dr. Singh',
      'demo-teacher-5': 'Prof. Gupta',
      'demo-teacher-6': 'Dr. Reddy'
    }
    return teacherNames[teacherId] || 'Unknown Teacher'
  }

  const filteredAudios = audioFiles.filter(audio =>
    audio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audio.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audio.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedAudios = [...filteredAudios].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.convertedAt).getTime() - new Date(a.convertedAt).getTime()
      case 'title':
        return a.title.localeCompare(b.title)
      case 'duration':
        return b.duration - a.duration
      case 'size':
        return b.size - a.size
      default:
        return 0
    }
  })

  const handlePlayPause = (audioId: string, audioUrl: string) => {
    const currentAudio = audioElements.get(audioId)
    
    if (currentlyPlaying && currentlyPlaying !== audioId) {
      // Stop currently playing audio
      const playingAudio = audioElements.get(currentlyPlaying)
      if (playingAudio) {
        playingAudio.pause()
        playingAudio.currentTime = 0
      }
    }

    if (currentAudio) {
      if (currentlyPlaying === audioId) {
        currentAudio.pause()
        setCurrentlyPlaying(null)
      } else {
        currentAudio.play()
        setCurrentlyPlaying(audioId)
      }
    } else {
      // Create new audio element
      const audio = new Audio(audioUrl)
      audio.onended = () => setCurrentlyPlaying(null)
      audio.onerror = () => setCurrentlyPlaying(null)
      
      setAudioElements(prev => new Map(prev.set(audioId, audio)))
      audio.play()
      setCurrentlyPlaying(audioId)
    }
  }

  const handleDownload = (audio: any) => {
    // For demo mode, create a mock download
    const link = document.createElement('a')
    link.href = audio.audioUrl
    link.download = `${audio.title.replace(/[^a-zA-Z0-9]/g, '_')}.${audio.format}`
    link.click()
  }

  const handleDelete = (audioId: string) => {
    if (window.confirm('Are you sure you want to delete this audio file?')) {
      const updatedAudios = JSON.parse(localStorage.getItem('converted_audios') || '[]')
      const filteredAudios = updatedAudios.filter((audio: any) => audio.videoId !== audioId)
      localStorage.setItem('converted_audios', JSON.stringify(filteredAudios))
      
      // Stop playing if this audio is currently playing
      if (currentlyPlaying === audioId) {
        const audio = audioElements.get(audioId)
        if (audio) {
          audio.pause()
        }
        setCurrentlyPlaying(null)
      }
      
      loadAudioFiles()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your audio library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-heading text-gray-900 mb-2">🎵 Audio Library</h1>
          <p className="text-gray-600">Your converted audio files for offline listening</p>
        </div>
        
        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
          {sortedAudios.length} audio files • {audioConversionService.formatFileSize(
            sortedAudios.reduce((total, audio) => total + audio.size, 0)
          )} total
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search audio files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="title">Title A-Z</option>
              <option value="duration">Longest Duration</option>
              <option value="size">Largest File</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audio Files */}
      {sortedAudios.length > 0 ? (
        <div className="space-y-4">
          {sortedAudios.map(audio => (
            <div key={audio.videoId} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                {/* Thumbnail */}
                <div className="relative flex-shrink-0">
                  <img
                    src={audio.thumbnail}
                    alt={audio.title}
                    className="w-20 h-15 rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                    <Volume2 className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{audio.title}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{audio.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>by {audio.teacher}</span>
                    <span>•</span>
                    <span>{audio.subject}</span>
                    <span>•</span>
                    <span>{audioConversionService.formatDuration(audio.duration)}</span>
                    <span>•</span>
                    <span>{audioConversionService.formatFileSize(audio.size)}</span>
                    <span>•</span>
                    <span>{audio.format.toUpperCase()}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Converted on {formatDate(audio.convertedAt)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePlayPause(audio.videoId, audio.audioUrl)}
                    className={`p-3 rounded-lg transition-colors ${
                      currentlyPlaying === audio.videoId
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentlyPlaying === audio.videoId ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDownload(audio)}
                    className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(audio.videoId)}
                    className="p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Headphones className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No audio files yet</h3>
          <p className="text-gray-500 mb-4">
            Convert videos to audio format to start building your offline library
          </p>
          <button className="btn-primary px-6 py-3">
            Browse Videos
          </button>
        </div>
      )}
    </div>
  )
}

export default AudioLibrary
