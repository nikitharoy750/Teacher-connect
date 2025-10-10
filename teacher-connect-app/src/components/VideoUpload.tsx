import React, { useState, useRef } from 'react'
import { Upload, X, Play, FileVideo, AlertCircle, CheckCircle } from 'lucide-react'
import { videoUploadService, VideoUploadData, UploadProgress } from '../services/videoUploadService'
import { useAuth } from '../contexts/AuthContext'

interface VideoUploadProps {
  onUpload: (result: { videoId: string; videoUrl: string; thumbnailUrl?: string }) => void
  onClose: () => void
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUpload, onClose }) => {
  const { user } = useAuth()
  const [dragActive, setDragActive] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'uploading',
    message: ''
  })
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    gradeLevel: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const subjects = [
    'Mathematics', 'Science', 'English', 'History', 'Geography',
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Arts'
  ]

  const gradeLevels = [
    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade',
    '11th Grade', '12th Grade', 'College Level'
  ]

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    const videoFile = files.find(file => file.type.startsWith('video/'))
    if (videoFile) {
      handleVideoFile(videoFile)
    }
  }

  const handleVideoFile = (file: File) => {
    if (file.size > 500 * 1024 * 1024) { // 500MB limit
      setErrors({ video: 'Video file size must be less than 500MB' })
      return
    }

    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
    setErrors({ ...errors, video: '' })
  }

  const handleThumbnailFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors({ thumbnail: 'Thumbnail file size must be less than 5MB' })
      return
    }

    setThumbnailFile(file)
    setThumbnailPreview(URL.createObjectURL(file))
    setErrors({ ...errors, thumbnail: '' })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!videoFile) newErrors.video = 'Please select a video file'
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.subject) newErrors.subject = 'Subject is required'
    if (!formData.gradeLevel) newErrors.gradeLevel = 'Grade level is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !user) return

    setIsUploading(true)

    try {
      const videoData: VideoUploadData = {
        file: videoFile!,
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        gradeLevel: formData.gradeLevel,
        thumbnail: thumbnailFile || undefined
      }

      const result = await videoUploadService.uploadVideo(
        videoData,
        user.id,
        (progress) => {
          setUploadProgress(progress)
        }
      )

      // Success! Call the parent callback
      onUpload({
        videoId: result.videoId,
        videoUrl: result.videoUrl,
        thumbnailUrl: result.thumbnailUrl
      })

    } catch (error) {
      console.error('Upload failed:', error)
      setErrors({
        upload: error instanceof Error ? error.message : 'Upload failed. Please try again.'
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-heading text-gray-900">Upload Educational Video</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Video Upload Area */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              Video File *
            </label>
            
            {!videoFile ? (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary-light bg-opacity-10' 
                    : 'border-gray-300 hover:border-primary'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileVideo className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drag and drop your video here
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  or click to browse files (MP4, AVI, MOV - Max 500MB)
                </p>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="btn-primary px-6 py-3"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Choose Video File
                </button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => e.target.files?.[0] && handleVideoFile(e.target.files[0])}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <FileVideo className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium text-gray-900">{videoFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoFile(null)
                      setVideoPreview(null)
                    }}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                
                {videoPreview && (
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-48 bg-black rounded-lg"
                  />
                )}
              </div>
            )}
            
            {errors.video && (
              <p className="text-error text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.video}
              </p>
            )}
          </div>

          {/* Video Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.title ? 'border-error' : 'border-gray-300'
                  }`}
                  placeholder="Enter video title"
                />
                {errors.title && (
                  <p className="text-error text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.subject ? 'border-error' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                {errors.subject && (
                  <p className="text-error text-sm mt-1">{errors.subject}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Grade Level *
                </label>
                <select
                  value={formData.gradeLevel}
                  onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.gradeLevel ? 'border-error' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Grade Level</option>
                  {gradeLevels.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
                {errors.gradeLevel && (
                  <p className="text-error text-sm mt-1">{errors.gradeLevel}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none ${
                    errors.description ? 'border-error' : 'border-gray-300'
                  }`}
                  placeholder="Describe what students will learn from this video"
                />
                {errors.description && (
                  <p className="text-error text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Custom Thumbnail (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="btn-outline px-4 py-2 text-sm"
                  >
                    Choose Thumbnail
                  </button>
                  {thumbnailPreview && (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-16 h-12 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailFile(null)
                          setThumbnailPreview(null)
                        }}
                        className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleThumbnailFile(e.target.files[0])}
                  className="hidden"
                />
                {errors.thumbnail && (
                  <p className="text-error text-sm mt-1">{errors.thumbnail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{uploadProgress.message}</span>
                <span className="text-sm text-gray-500">{Math.round(uploadProgress.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    uploadProgress.status === 'error'
                      ? 'bg-red-500'
                      : uploadProgress.status === 'complete'
                      ? 'bg-green-500'
                      : 'bg-gradient-primary'
                  }`}
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
              {uploadProgress.status === 'error' && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {uploadProgress.message}
                </p>
              )}
              {uploadProgress.status === 'complete' && (
                <p className="text-green-600 text-sm mt-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Upload successful!
                </p>
              )}
            </div>
          )}

          {/* Upload Error */}
          {errors.upload && !isUploading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {errors.upload}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost px-6 py-3"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-8 py-3"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Video
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VideoUpload
