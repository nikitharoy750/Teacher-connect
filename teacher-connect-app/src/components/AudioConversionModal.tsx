import React, { useState, useEffect } from 'react'
import { X, Volume2, Download, Play, Pause, FileAudio, Loader, CheckCircle, AlertCircle, Headphones } from 'lucide-react'
import { audioConversionService } from '../services/audioConversionService'
import type { ConversionProgress, AudioConversionResult } from '../services/audioConversionService'

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

interface AudioConversionModalProps {
  video: Video
  onClose: () => void
}

const AudioConversionModal: React.FC<AudioConversionModalProps> = ({
  video,
  onClose
}) => {
  const [conversionProgress, setConversionProgress] = useState<ConversionProgress | null>(null)
  const [audioResult, setAudioResult] = useState<AudioConversionResult | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<'mp3' | 'wav'>('mp3')
  const [existingAudio, setExistingAudio] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Check if audio already exists for this video
    const existing = audioConversionService.getConvertedAudio(video.id)
    setExistingAudio(existing)
  }, [video.id])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isConverting) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose, isConverting])

  const handleStartConversion = async () => {
    try {
      setIsConverting(true)
      setConversionProgress(null)
      setAudioResult(null)

      const result = await audioConversionService.convertVideoToAudio(
        video.videoUrl,
        (progress) => {
          setConversionProgress(progress)
        },
        selectedFormat
      )

      setAudioResult(result)
      
      // Save to storage
      audioConversionService.saveAudioToStorage(video.id, result)
      
      // Update existing audio
      setExistingAudio({
        videoId: video.id,
        audioUrl: result.audioUrl,
        duration: result.duration,
        size: result.size,
        format: result.format,
        convertedAt: new Date().toISOString()
      })

    } catch (error) {
      console.error('Conversion failed:', error)
    } finally {
      setIsConverting(false)
    }
  }

  const handleDownload = () => {
    if (audioResult) {
      audioConversionService.downloadAudio(
        audioResult.audioBlob,
        `${video.title.replace(/[^a-zA-Z0-9]/g, '_')}`,
        audioResult.format
      )
    } else if (existingAudio) {
      // For demo mode, create a mock download
      const link = document.createElement('a')
      link.href = existingAudio.audioUrl
      link.download = `${video.title.replace(/[^a-zA-Z0-9]/g, '_')}.${existingAudio.format}`
      link.click()
    }
  }

  const handlePlayPause = () => {
    const audioUrl = audioResult?.audioUrl || existingAudio?.audioUrl
    if (!audioUrl) return

    if (!audioElement) {
      const audio = new Audio(audioUrl)
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => setIsPlaying(false)
      setAudioElement(audio)
      audio.play()
      setIsPlaying(true)
    } else {
      if (isPlaying) {
        audioElement.pause()
        setIsPlaying(false)
      } else {
        audioElement.play()
        setIsPlaying(true)
      }
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isConverting) {
      onClose()
    }
  }

  const getProgressColor = () => {
    if (!conversionProgress) return 'bg-blue-500'
    switch (conversionProgress.status) {
      case 'complete': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-blue-500'
    }
  }

  const getStatusIcon = () => {
    if (!conversionProgress) return <Loader className="h-5 w-5 animate-spin" />
    switch (conversionProgress.status) {
      case 'complete': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />
      default: return <Loader className="h-5 w-5 animate-spin" />
    }
  }

  const hasAudio = audioResult || existingAudio

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Volume2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-heading text-gray-900">Convert to Audio</h2>
                <p className="text-gray-600">Extract audio from video for offline listening</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isConverting}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start space-x-4">
            <img
              src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&h=150&fit=crop'}
              alt={video.title}
              className="w-24 h-18 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 mb-1">{video.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{video.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>by {video.teacher.name}</span>
                <span>•</span>
                <span>{video.subject}</span>
                <span>•</span>
                <span>{video.duration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Settings */}
        {!hasAudio && !isConverting && (
          <div className="p-6 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Audio Format</h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedFormat('mp3')}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  selectedFormat === 'mp3'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileAudio className="h-6 w-6 text-green-600" />
                  <div className="text-left">
                    <div className="font-semibold">MP3</div>
                    <div className="text-sm text-gray-600">Smaller file size, good quality</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedFormat('wav')}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  selectedFormat === 'wav'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Headphones className="h-6 w-6 text-blue-600" />
                  <div className="text-left">
                    <div className="font-semibold">WAV</div>
                    <div className="text-sm text-gray-600">Higher quality, larger file</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Conversion Progress */}
        {isConverting && conversionProgress && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              {getStatusIcon()}
              <div>
                <div className="font-semibold text-gray-900">
                  {conversionProgress.status === 'complete' ? 'Conversion Complete!' : 'Converting...'}
                </div>
                <div className="text-sm text-gray-600">{conversionProgress.message}</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${conversionProgress.progress}%` }}
              />
            </div>
            <div className="text-sm text-gray-600 mt-2 text-right">
              {Math.round(conversionProgress.progress)}%
            </div>
          </div>
        )}

        {/* Audio Result */}
        {hasAudio && (
          <div className="p-6 border-b border-gray-200">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <div className="font-semibold text-green-900">Audio Ready!</div>
                  <div className="text-sm text-green-700">
                    {audioConversionService.formatFileSize(audioResult?.size || existingAudio?.size || 0)} • 
                    {audioConversionService.formatDuration(audioResult?.duration || existingAudio?.duration || 0)} • 
                    {(audioResult?.format || existingAudio?.format || 'mp3').toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePlayPause}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{isPlaying ? 'Pause' : 'Preview'}</span>
                </button>
                
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6">
          <div className="flex items-center justify-end space-x-4">
            <button
              onClick={onClose}
              disabled={isConverting}
              className="btn-ghost px-6 py-3 disabled:opacity-50"
            >
              {hasAudio ? 'Close' : 'Cancel'}
            </button>
            
            {!hasAudio && !isConverting && (
              <button
                onClick={handleStartConversion}
                className="btn-primary px-8 py-3 flex items-center space-x-2"
              >
                <Volume2 className="h-5 w-5" />
                <span>Convert to Audio</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AudioConversionModal
