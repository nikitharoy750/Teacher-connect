import React, { useState, useRef } from 'react'
import { X, Upload, FileVideo, AlertCircle, CheckCircle, Award, Info, Star } from 'lucide-react'
import { studentUploadService } from '../services/studentUploadService'
import type { UploadGuidelines } from '../services/studentUploadService'

interface StudentUploadModalProps {
  studentId: string
  onClose: () => void
  onUploadComplete: (upload: any) => void
}

const StudentUploadModal: React.FC<StudentUploadModalProps> = ({
  studentId,
  onClose,
  onUploadComplete
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showGuidelines, setShowGuidelines] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    gradeLevel: '',
    tags: ''
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const guidelines = studentUploadService.getUploadGuidelines()

  const subjects = [
    'Mathematics', 'Science', 'English', 'History', 'Geography',
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art',
    'Music', 'Physical Education', 'Economics', 'Psychology', 'Philosophy'
  ]

  const gradeLevels = [
    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade',
    '11th Grade', '12th Grade', 'College Level', 'Adult Education'
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateFile(file)
    if (!validation.isValid) {
      setError(validation.error!)
      return
    }

    setSelectedFile(file)
    setError(null)
  }

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > guidelines.maxFileSize) {
      return { isValid: false, error: `File size must be less than ${guidelines.maxFileSize}MB` }
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !guidelines.allowedFormats.includes(fileExtension)) {
      return { isValid: false, error: `File format must be one of: ${guidelines.allowedFormats.join(', ')}` }
    }

    return { isValid: true }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setError('Please select a video file')
      return
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.subject || !formData.gradeLevel) {
      setError('Please fill in all required fields')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const upload = await studentUploadService.submitUpload(
        studentId,
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          subject: formData.subject,
          gradeLevel: formData.gradeLevel,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        },
        selectedFile,
        setUploadProgress
      )

      setUploadComplete(true)
      onUploadComplete(upload)
    } catch (error) {
      setError('Upload failed. Please try again.')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  if (uploadComplete) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Successful!</h3>
            <p className="text-gray-600 mb-4">
              Your video has been submitted for review. You've earned {guidelines.creditRates.baseUpload} credits!
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 text-yellow-800">
                <Award className="h-5 w-5" />
                <span className="font-semibold">Credits Earned: +{guidelines.creditRates.baseUpload}</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                You'll earn {guidelines.creditRates.approval} more credits when approved!
              </p>
            </div>
            <button
              onClick={onClose}
              className="btn-primary w-full"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Educational Video</h2>
            <p className="text-gray-600">Share your knowledge and earn credits!</p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Guidelines Toggle */}
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => setShowGuidelines(!showGuidelines)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Info className="h-5 w-5" />
            <span className="font-medium">View Upload Guidelines & Credit System</span>
          </button>
          
          {showGuidelines && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3">Upload Guidelines</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-blue-800 mb-2">Technical Requirements:</h5>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Max file size: {guidelines.maxFileSize}MB</li>
                    <li>• Formats: {guidelines.allowedFormats.join(', ')}</li>
                    <li>• Duration: {guidelines.minDuration/60}-{guidelines.maxDuration/60} minutes</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-blue-800 mb-2">Credit System:</h5>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Upload: +{guidelines.creditRates.baseUpload} credits</li>
                    <li>• Approval: +{guidelines.creditRates.approval} credits</li>
                    <li>• Quality bonus: +{guidelines.creditRates.qualityBonus} credits</li>
                    <li>• Per 100 views: +{guidelines.creditRates.viewBonus} credits</li>
                  </ul>
                </div>
              </div>
              <div className="mt-3">
                <h5 className="font-medium text-blue-800 mb-2">Quality Criteria:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {guidelines.qualityCriteria.map((criteria, index) => (
                    <div key={index} className="flex items-center space-x-2 text-blue-700">
                      <Star className="h-4 w-4" />
                      <span className="text-sm">{criteria}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video File *
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              
              {selectedFile ? (
                <div className="space-y-2">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileVideo className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="font-medium text-gray-900">Click to select video file</p>
                    <p className="text-sm text-gray-600">
                      Max {guidelines.maxFileSize}MB • {guidelines.allowedFormats.join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter video title"
                disabled={isUploading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isUploading}
                required
              >
                <option value="">Select subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Level *
              </label>
              <select
                value={formData.gradeLevel}
                onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isUploading}
                required
              >
                <option value="">Select grade level</option>
                {gradeLevels.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (optional)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="math, algebra, equations (comma separated)"
                disabled={isUploading}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Describe what students will learn from this video..."
              disabled={isUploading}
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Uploading...</span>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="flex-1 btn-primary px-6 py-3 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Upload className="h-5 w-5" />
              <span>{isUploading ? 'Uploading...' : 'Upload Video'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StudentUploadModal
