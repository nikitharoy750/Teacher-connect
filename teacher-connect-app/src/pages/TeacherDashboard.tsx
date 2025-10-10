import React, { useState, useEffect } from 'react'
import { Upload, Video, FileText, Users, Award, TrendingUp, Plus, Eye, BarChart3 } from 'lucide-react'
import VideoUpload from '../components/VideoUpload'
import VideoManager from '../components/VideoManager'
import { videoUploadService } from '../services/videoUploadService'
import { useAuth } from '../contexts/AuthContext'

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [showVideoUpload, setShowVideoUpload] = useState(false)
  const [userVideos, setUserVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const stats = {
    videosUploaded: 12,
    totalViews: 1250,
    studentsReached: 89,
    averageRating: 4.7,
    creditsEarned: 340
  }

  const recentVideos = [
    { id: 1, title: 'Introduction to Algebra', views: 156, likes: 23, subject: 'Mathematics' },
    { id: 2, title: 'Photosynthesis Explained', views: 203, likes: 31, subject: 'Biology' },
    { id: 3, title: 'English Grammar Basics', views: 98, likes: 15, subject: 'English' }
  ]

  // Mock video data for VideoManager
  const mockVideos = [
    {
      id: '1',
      title: 'Introduction to Algebra',
      description: 'Learn the basics of algebraic expressions and equations',
      subject: 'Mathematics',
      gradeLevel: '9th Grade',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
      duration: '15:30',
      uploadDate: '2024-01-15',
      views: 156,
      likes: 23,
      status: 'published' as const,
      fileSize: '45.2 MB'
    },
    {
      id: '2',
      title: 'Photosynthesis Explained',
      description: 'Understanding how plants make their own food through photosynthesis',
      subject: 'Biology',
      gradeLevel: '10th Grade',
      thumbnail: 'https://images.unsplash.com/photo-1574263867128-a3d5c1b1deaa?w=400&h=300&fit=crop',
      duration: '12:45',
      uploadDate: '2024-01-10',
      views: 203,
      likes: 31,
      status: 'published' as const,
      fileSize: '38.7 MB'
    },
    {
      id: '3',
      title: 'English Grammar Basics',
      description: 'Essential grammar rules for better writing and communication',
      subject: 'English',
      gradeLevel: '8th Grade',
      thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
      duration: '18:20',
      uploadDate: '2024-01-08',
      views: 98,
      likes: 15,
      status: 'processing' as const,
      fileSize: '52.1 MB'
    }
  ]

  // Load user's videos
  useEffect(() => {
    const loadVideos = async () => {
      if (!user) return

      try {
        setLoading(true)
        const videos = await videoUploadService.getTeacherVideos(user.id)
        setUserVideos(videos)
      } catch (error) {
        console.error('Failed to load videos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadVideos()
  }, [user])

  const handleVideoUpload = async (result: { videoId: string; videoUrl: string; thumbnailUrl?: string }) => {
    console.log('Video uploaded successfully:', result)
    setShowVideoUpload(false)

    // Refresh the videos list
    if (user) {
      try {
        const videos = await videoUploadService.getTeacherVideos(user.id)
        setUserVideos(videos)
      } catch (error) {
        console.error('Failed to refresh videos:', error)
      }
    }
  }

  const handleEditVideo = (video: any) => {
    console.log('Edit video:', video)
    // Open edit modal
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!user) return

    const confirmed = window.confirm('Are you sure you want to delete this video? This action cannot be undone.')
    if (!confirmed) return

    try {
      await videoUploadService.deleteVideo(videoId, user.id)
      // Refresh the videos list
      const videos = await videoUploadService.getTeacherVideos(user.id)
      setUserVideos(videos)
    } catch (error) {
      console.error('Failed to delete video:', error)
      alert('Failed to delete video. Please try again.')
    }
  }

  const handleToggleStatus = (videoId: string) => {
    console.log('Toggle status:', videoId)
    // Toggle video publish status
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold font-heading gradient-text">Teacher Dashboard</h1>
        <button
          onClick={() => setShowVideoUpload(true)}
          className="btn-primary px-6 py-3 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <Plus className="h-5 w-5 mr-2" />
          <span className="font-semibold">Upload Video</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Videos Uploaded</p>
              <p className="text-3xl font-bold text-primary">{stats.videosUploaded}</p>
            </div>
            <div className="bg-gradient-primary p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Video className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Views</p>
              <p className="text-3xl font-bold text-success">{stats.totalViews.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-accent p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Eye className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Students Reached</p>
              <p className="text-3xl font-bold text-secondary">{stats.studentsReached}</p>
            </div>
            <div className="bg-gradient-secondary p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Average Rating</p>
              <p className="text-3xl font-bold text-warning">⭐ {stats.averageRating}</p>
            </div>
            <div className="bg-gradient-warm p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Award className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Credits Earned</p>
              <p className="text-3xl font-bold text-primary">{stats.creditsEarned}</p>
            </div>
            <div className="bg-gradient-primary p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'videos', name: 'My Videos', icon: Video },
            { id: 'upload', name: 'Upload Content', icon: Upload },
            { id: 'notes', name: 'Notes & Materials', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-semibold text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary-light bg-opacity-10'
                  : 'border-transparent text-gray-500 hover:text-primary hover:border-primary-light'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">📈 Performance Analytics</h3>
                <p className="card-description">Track your teaching impact and student engagement</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-primary bg-opacity-10 rounded-xl">
                    <span className="font-medium text-gray-700">This Month's Views</span>
                    <span className="text-2xl font-bold text-primary">+24%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-accent bg-opacity-10 rounded-xl">
                    <span className="font-medium text-gray-700">Student Engagement</span>
                    <span className="text-2xl font-bold text-secondary">87%</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-warm bg-opacity-10 rounded-xl">
                    <span className="font-medium text-gray-700">Average Watch Time</span>
                    <span className="text-2xl font-bold text-warning">12:30</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-secondary bg-opacity-10 rounded-xl">
                    <span className="font-medium text-gray-700">Completion Rate</span>
                    <span className="text-2xl font-bold text-success">78%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">🎬 Recent Videos</h3>
                <p className="card-description">Your latest uploaded content</p>
              </div>
              <div className="space-y-4">
                {recentVideos.map((video) => (
                  <div key={video.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{video.title}</h4>
                        <p className="text-sm text-gray-600">{video.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{video.views} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="h-4 w-4" />
                        <span>{video.likes} likes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🎬 My Video Library</h3>
              <p className="card-description">Manage your uploaded videos, view analytics, and update content</p>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your videos...</p>
              </div>
            ) : (
              <VideoManager
                videos={userVideos.map(video => ({
                  id: video.id,
                  title: video.title,
                  description: video.description,
                  subject: video.subject,
                  gradeLevel: video.grade_level,
                  thumbnail: video.thumbnail_url || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
                  duration: `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`,
                  uploadDate: video.upload_date,
                  views: video.views || 0,
                  likes: video.upvotes || 0,
                  status: 'published' as const,
                  fileSize: '45.2 MB' // TODO: Calculate actual file size
                }))}
                onEdit={handleEditVideo}
                onDelete={handleDeleteVideo}
                onToggleStatus={handleToggleStatus}
              />
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📤 Upload New Content</h3>
              <p className="card-description">Share your knowledge with students around the world</p>
            </div>
            <div className="text-center py-12">
              <div className="bg-gradient-primary bg-opacity-10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Upload className="h-12 w-12 text-primary" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Ready to Upload?</h4>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Click the button below to start uploading your educational videos and reach more students.
              </p>
              <button
                onClick={() => setShowVideoUpload(true)}
                className="btn-primary px-8 py-4 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <Plus className="h-6 w-6 mr-2" />
                Upload Your First Video
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📚 Notes & Study Materials</h3>
              <p className="card-description">Upload and manage supplementary materials for your students</p>
            </div>
            <div className="text-center py-12">
              <div className="bg-gradient-secondary bg-opacity-10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-12 w-12 text-secondary" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Coming Soon!</h4>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Notes and study materials management will be available in the next update.
              </p>
              <button className="btn-outline px-6 py-3">
                <FileText className="h-5 w-5 mr-2" />
                Learn More
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Video Upload Modal */}
      {showVideoUpload && (
        <VideoUpload
          onUpload={handleVideoUpload}
          onClose={() => setShowVideoUpload(false)}
        />
      )}
    </div>
  )
}

export default TeacherDashboard
