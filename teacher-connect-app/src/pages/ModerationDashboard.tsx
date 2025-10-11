import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Eye, ThumbsUp, Award, User, Calendar, Filter, Search, MessageSquare } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { studentUploadService } from '../services/studentUploadService'
import type { StudentUpload } from '../services/studentUploadService'

const ModerationDashboard: React.FC = () => {
  const { user: _user } = useAuth()
  const [uploads, setUploads] = useState<StudentUpload[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'under_review' | 'approved' | 'rejected'>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUpload, setSelectedUpload] = useState<StudentUpload | null>(null)
  const [moderationNotes, setModerationNotes] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUploads()
  }, [])

  const loadUploads = () => {
    setLoading(true)
    try {
      const allUploads = studentUploadService.getAllUploads()
      setUploads(allUploads)
    } catch (error) {
      console.error('Failed to load uploads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModeration = (uploadId: string, status: 'approved' | 'rejected', notes?: string) => {
    const moderatedUpload = studentUploadService.moderateUpload(uploadId, status, notes)
    if (moderatedUpload) {
      setUploads(prev => prev.map(upload => 
        upload.id === uploadId ? moderatedUpload : upload
      ))
      setSelectedUpload(null)
      setModerationNotes('')
    }
  }

  const filteredUploads = uploads.filter(upload => {
    const matchesStatus = filterStatus === 'all' || upload.status === filterStatus
    const matchesSearch = upload.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         upload.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         upload.subject.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusIcon = (status: StudentUpload['status']) => {
    switch (status) {
      case 'pending':
      case 'under_review':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
    }
  }

  const getStatusColor = (status: StudentUpload['status']) => {
    switch (status) {
      case 'pending':
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const pendingCount = uploads.filter(u => u.status === 'pending' || u.status === 'under_review').length
  const approvedCount = uploads.filter(u => u.status === 'approved').length
  const rejectedCount = uploads.filter(u => u.status === 'rejected').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading moderation queue...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold font-heading text-gray-900 mb-2">🛡️ Moderation Dashboard</h1>
        <p className="text-gray-600">Review and moderate student video uploads</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Uploads</p>
              <p className="text-2xl font-bold text-gray-900">{uploads.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search uploads, students, or subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Uploads List */}
      {filteredUploads.length > 0 ? (
        <div className="space-y-4">
          {filteredUploads.map(upload => (
            <div key={upload.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <img
                    src={upload.thumbnailUrl}
                    alt={upload.title}
                    className="w-32 h-20 rounded-lg object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{upload.title}</h3>
                    <div className="flex items-center space-x-2 ml-4">
                      {getStatusIcon(upload.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(upload.status)}`}>
                        {upload.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">{upload.description}</p>

                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{upload.studentName}</span>
                    </div>
                    <span className="badge badge-primary">{upload.subject}</span>
                    <span className="badge badge-secondary">{upload.gradeLevel}</span>
                    <span>Duration: {upload.duration}</span>
                    <span>Size: {formatFileSize(upload.fileSize)}</span>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Uploaded: {formatDate(upload.uploadDate)}</span>
                    </div>
                    {upload.status === 'approved' && (
                      <>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{upload.views} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{upload.likes} likes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="h-4 w-4" />
                          <span>Quality: {upload.qualityScore}%</span>
                        </div>
                      </>
                    )}
                  </div>

                  {upload.moderatorNotes && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Moderator Notes:</span>
                      </div>
                      <p className="text-sm text-gray-600">{upload.moderatorNotes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {(upload.status === 'pending' || upload.status === 'under_review') && (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedUpload(upload)}
                        className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => handleModeration(upload.id, 'approved', 'Content meets quality standards')}
                        className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors text-sm font-medium flex items-center space-x-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Quick Approve</span>
                      </button>
                      <button
                        onClick={() => handleModeration(upload.id, 'rejected', 'Content does not meet quality standards')}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium flex items-center space-x-1"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Quick Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Clock className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No uploads found</h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No student uploads to review at this time'
            }
          </p>
        </div>
      )}

      {/* Detailed Review Modal */}
      {selectedUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Review Upload</h3>
              <p className="text-gray-600">{selectedUpload.title}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Student:</span>
                  <p className="text-gray-600">{selectedUpload.studentName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Subject:</span>
                  <p className="text-gray-600">{selectedUpload.subject}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Grade Level:</span>
                  <p className="text-gray-600">{selectedUpload.gradeLevel}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Duration:</span>
                  <p className="text-gray-600">{selectedUpload.duration}</p>
                </div>
              </div>

              <div>
                <span className="font-medium text-gray-700">Description:</span>
                <p className="text-gray-600 mt-1">{selectedUpload.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moderation Notes
                </label>
                <textarea
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add notes about your decision..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setSelectedUpload(null)
                    setModerationNotes('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleModeration(selectedUpload.id, 'rejected', moderationNotes || 'Content rejected')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleModeration(selectedUpload.id, 'approved', moderationNotes || 'Content approved')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModerationDashboard
