import React, { useState, useEffect } from 'react'
import { Play, BookOpen, Download, Heart, TrendingUp, Clock, Star, Volume2, Search, Filter, Award, Target, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import VideoCard from '../components/VideoCard'
import VideoPlayer from '../components/VideoPlayer'

const StudentDashboard: React.FC = () => {
  const { user } = useAuth()
  const [recentVideos, setRecentVideos] = useState<any[]>([])
  const [recommendedVideos, setRecommendedVideos] = useState<any[]>([])
  const [favoriteVideos, setFavoriteVideos] = useState<any[]>([])
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set())
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true)

        // Load videos from localStorage (demo mode)
        const allVideos = JSON.parse(localStorage.getItem('demo_videos') || '[]')

        // Get recent videos (last 3)
        const recent = allVideos.slice(0, 3)
        setRecentVideos(recent)

        // Get recommended videos based on popular subjects
        const recommended = allVideos
          .filter((v: any) => ['Mathematics', 'Physics', 'Chemistry'].includes(v.subject))
          .slice(0, 4)
        setRecommendedVideos(recommended)

        // Load user's favorites from localStorage
        const userFavorites = JSON.parse(localStorage.getItem(`favorites_${user?.id}`) || '[]')
        const favoriteVideosList = allVideos.filter((v: any) => userFavorites.includes(v.id))
        setFavoriteVideos(favoriteVideosList)
        setFavorites(new Set(userFavorites))

        // Load user's likes
        const userLikes = JSON.parse(localStorage.getItem(`likes_${user?.id}`) || '[]')
        setLikedVideos(new Set(userLikes))

      } catch (error) {
        console.error('Failed to load student data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadStudentData()
    }
  }, [user])

  const convertToVideoCardFormat = (video: any) => ({
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
    teacher: {
      name: getTeacherName(video.teacher_id),
      avatar: getTeacherAvatar(video.teacher_id),
      rating: 4.8
    },
    tags: [video.subject, video.grade_level]
  })

  const convertToVideoPlayerFormat = (video: any) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    videoUrl: video.file_url,
    thumbnailUrl: video.thumbnail_url,
    teacher: {
      name: getTeacherName(video.teacher_id),
      avatar: getTeacherAvatar(video.teacher_id)
    },
    subject: video.subject,
    gradeLevel: video.grade_level,
    duration: `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`,
    views: video.views || 0,
    likes: video.upvotes || 0,
    uploadDate: video.upload_date
  })

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

  const getTeacherAvatar = (teacherId: string) => {
    const avatars: { [key: string]: string } = {
      'demo-teacher': 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face',
      'demo-teacher-2': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      'demo-teacher-3': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      'demo-teacher-4': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      'demo-teacher-5': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      'demo-teacher-6': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face'
    }
    return avatars[teacherId] || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  }

  const handleVideoPlay = (video: any) => {
    setSelectedVideo(convertToVideoPlayerFormat(video))
  }

  const handleLike = (videoId: string) => {
    const newLikedVideos = new Set(likedVideos)
    if (newLikedVideos.has(videoId)) {
      newLikedVideos.delete(videoId)
    } else {
      newLikedVideos.add(videoId)
    }
    setLikedVideos(newLikedVideos)

    // Save to localStorage
    localStorage.setItem(`likes_${user?.id}`, JSON.stringify(Array.from(newLikedVideos)))
  }

  const handleAddToFavorites = (videoId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(videoId)) {
      newFavorites.delete(videoId)
    } else {
      newFavorites.add(videoId)
    }
    setFavorites(newFavorites)

    // Save to localStorage
    localStorage.setItem(`favorites_${user?.id}`, JSON.stringify(Array.from(newFavorites)))
  }

  const handleDownload = (videoId: string) => {
    console.log('Download video:', videoId)
    // Implement download functionality
  }

  const handleConvertToAudio = (videoId: string) => {
    console.log('Convert to audio:', videoId)
    // Implement video-to-audio conversion
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading mb-2">
              Welcome back, {user?.full_name || 'Student'}! 👋
            </h1>
            <p className="text-primary-light text-lg">
              Continue your learning journey with amazing educational content
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="h-5 w-5" />
                <span className="font-semibold">Credits</span>
              </div>
              <div className="text-2xl font-bold">{user?.credits || 100}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 text-center">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Play className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Videos Watched</h3>
          <p className="text-2xl font-bold text-blue-600">24</p>
        </div>

        <div className="card p-6 text-center">
          <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Heart className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Favorites</h3>
          <p className="text-2xl font-bold text-green-600">{favoriteVideos.length}</p>
        </div>

        <div className="card p-6 text-center">
          <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Target className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Learning Streak</h3>
          <p className="text-2xl font-bold text-purple-600">7 days</p>
        </div>

        <div className="card p-6 text-center">
          <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <BookOpen className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Subjects</h3>
          <p className="text-2xl font-bold text-orange-600">6</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-bold font-heading text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Search className="h-6 w-6 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Browse Videos</div>
              <div className="text-sm text-gray-600">Explore all available content</div>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <Volume2 className="h-6 w-6 text-green-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Audio Mode</div>
              <div className="text-sm text-gray-600">Convert videos to audio</div>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <Download className="h-6 w-6 text-purple-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Offline Content</div>
              <div className="text-sm text-gray-600">Download for offline viewing</div>
            </div>
          </button>
        </div>
      </div>

      {/* Continue Watching */}
      {recentVideos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-heading text-gray-900">Continue Watching</h2>
            <button className="text-primary hover:text-primary-dark font-medium">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentVideos.map(video => (
              <VideoCard
                key={video.id}
                video={convertToVideoCardFormat(video)}
                onPlay={() => handleVideoPlay(video)}
                onLike={handleLike}
                onDownload={handleDownload}
                onAddToFavorites={handleAddToFavorites}
                isLiked={likedVideos.has(video.id)}
                isFavorited={favorites.has(video.id)}
                layout="grid"
              />
            ))}
          </div>
        </div>
      )}

      {/* Recommended for You */}
      {recommendedVideos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-heading text-gray-900">Recommended for You</h2>
            <button className="text-primary hover:text-primary-dark font-medium">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedVideos.map(video => (
              <VideoCard
                key={video.id}
                video={convertToVideoCardFormat(video)}
                onPlay={() => handleVideoPlay(video)}
                onLike={handleLike}
                onDownload={handleDownload}
                onAddToFavorites={handleAddToFavorites}
                isLiked={likedVideos.has(video.id)}
                isFavorited={favorites.has(video.id)}
                layout="grid"
              />
            ))}
          </div>
        </div>
      )}

      {/* Your Favorites */}
      {favoriteVideos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-heading text-gray-900">Your Favorites</h2>
            <button className="text-primary hover:text-primary-dark font-medium">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {favoriteVideos.slice(0, 3).map(video => (
              <VideoCard
                key={video.id}
                video={convertToVideoCardFormat(video)}
                onPlay={() => handleVideoPlay(video)}
                onLike={handleLike}
                onDownload={handleDownload}
                onAddToFavorites={handleAddToFavorites}
                isLiked={likedVideos.has(video.id)}
                isFavorited={favorites.has(video.id)}
                layout="grid"
              />
            ))}
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onLike={handleLike}
          onDownload={handleDownload}
          onConvertToAudio={handleConvertToAudio}
          isLiked={likedVideos.has(selectedVideo.id)}
        />
      )}
    </div>
  )
}

export default StudentDashboard
