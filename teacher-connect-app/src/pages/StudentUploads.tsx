import React, { useState, useEffect } from 'react'
import { Plus, Upload, Clock, CheckCircle, XCircle, Eye, ThumbsUp, Award, TrendingUp, Filter, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { studentUploadService } from '../services/studentUploadService'
import type { StudentUpload, CreditTransaction } from '../services/studentUploadService'
import StudentUploadModal from '../components/StudentUploadModal'

const StudentUploads: React.FC = () => {
  const { user } = useAuth()
  const [uploads, setUploads] = useState<StudentUpload[]>([])
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = () => {
    if (!user) return
    
    setLoading(true)
    try {
      const userUploads = studentUploadService.getStudentUploads(user.id)
      const transactions = studentUploadService.getCreditTransactions(user.id)
      
      setUploads(userUploads)
      setCreditTransactions(transactions)
    } catch (error) {
      console.error('Failed to load uploads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = (upload: StudentUpload) => {
    setUploads(prev => [upload, ...prev])
    setShowUploadModal(false)
    loadData() // Refresh to get updated credits
  }

  const filteredUploads = uploads.filter(upload => {
    const matchesStatus = filterStatus === 'all' || upload.status === filterStatus
    const matchesSearch = upload.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      day: 'numeric'
    })
  }

  const totalCreditsEarned = creditTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  const approvedUploads = uploads.filter(upload => upload.status === 'approved').length
  const pendingUploads = uploads.filter(upload => upload.status === 'pending' || upload.status === 'under_review').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your uploads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-heading text-gray-900 mb-2">📚 My Uploads</h1>
          <p className="text-gray-600">Share your knowledge and earn credits</p>
        </div>
        
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary px-6 py-3 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Upload Video</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Uploads</p>
              <p className="text-2xl font-bold text-gray-900">{uploads.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">{approvedUploads}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingUploads}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Credits Earned</p>
              <p className="text-2xl font-bold text-gray-900">{totalCreditsEarned}</p>
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
              placeholder="Search uploads..."
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
                    <h3 className="font-bold text-lg text-gray-900 truncate">{upload.title}</h3>
                    <div className="flex items-center space-x-2 ml-4">
                      {getStatusIcon(upload.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(upload.status)}`}>
                        {upload.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{upload.description}</p>

                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                    <span className="badge badge-primary">{upload.subject}</span>
                    <span className="badge badge-secondary">{upload.gradeLevel}</span>
                    <span>Duration: {upload.duration}</span>
                    <span>Uploaded: {formatDate(upload.uploadDate)}</span>
                  </div>

                  {upload.status === 'approved' && (
                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{upload.views} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{upload.likes} likes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>Quality: {upload.qualityScore}%</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-purple-600">
                      <Award className="h-4 w-4" />
                      <span className="font-medium">{upload.creditsEarned} credits earned</span>
                    </div>

                    {upload.moderatorNotes && (
                      <div className="text-sm text-gray-600 max-w-md">
                        <span className="font-medium">Moderator notes:</span> {upload.moderatorNotes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Upload className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No uploads found' : 'No uploads yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start sharing your knowledge by uploading educational videos'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary px-6 py-3"
            >
              Upload Your First Video
            </button>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && user && (
        <StudentUploadModal
          studentId={user.id}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  )
}

export default StudentUploads
