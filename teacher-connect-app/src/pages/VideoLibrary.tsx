import React, { useState, useEffect } from 'react'
import { Play, Download, Heart, Search, Clock, User, Volume2, Filter, Grid, List, Star, TrendingUp, BookOpen, Eye } from 'lucide-react'
import VideoPlayer from '../components/VideoPlayer'
import VideoCard from '../components/VideoCard'
import { videoUploadService } from '../services/videoUploadService'

const VideoLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set())
  const [favoriteVideos, setFavoriteVideos] = useState<Set<string>>(new Set())
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Load videos from all teachers
  useEffect(() => {
    const loadAllVideos = async () => {
      try {
        setLoading(true)
        // In demo mode, get videos from localStorage
        const demoVideos = JSON.parse(localStorage.getItem('demo_videos') || '[]')
        
        // Add some sample videos if none exist
        if (demoVideos.length === 0) {
          const sampleVideos = [
            {
              id: 'sample-1',
              title: 'Introduction to Algebra',
              description: 'Learn the basics of algebraic expressions and equations',
              subject: 'Mathematics',
              grade_level: '9th Grade',
              thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
              duration: 930, // 15:30 in seconds
              upload_date: '2024-01-15',
              views: 1250,
              upvotes: 89,
              teacher_id: 'demo-teacher',
              file_url: 'https://demo-storage.supabase.co/videos/sample1.mp4'
            },
            {
              id: 'sample-2',
              title: 'Photosynthesis Process',
              description: 'Understanding how plants make their own food through photosynthesis',
              subject: 'Biology',
              grade_level: '10th Grade',
              thumbnail_url: 'https://images.unsplash.com/photo-1574263867128-a3d5c1b1deaa?w=400&h=300&fit=crop',
              duration: 765, // 12:45 in seconds
              upload_date: '2024-01-20',
              views: 980,
              upvotes: 67,
              teacher_id: 'demo-teacher-2',
              file_url: 'https://demo-storage.supabase.co/videos/sample2.mp4'
            },
            {
              id: 'sample-3',
              title: 'English Grammar Fundamentals',
              description: 'Master the basics of English grammar and sentence structure',
              subject: 'English',
              grade_level: '8th Grade',
              thumbnail_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
              duration: 1100, // 18:20 in seconds
              upload_date: '2024-01-25',
              views: 756,
              upvotes: 45,
              teacher_id: 'demo-teacher-3',
              file_url: 'https://demo-storage.supabase.co/videos/sample3.mp4'
            },
            {
              id: 'sample-4',
              title: 'Chemical Reactions',
              description: 'Explore different types of chemical reactions and their properties',
              subject: 'Chemistry',
              grade_level: '11th Grade',
              thumbnail_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop',
              duration: 855, // 14:15 in seconds
              upload_date: '2024-02-01',
              views: 1100,
              upvotes: 78,
              teacher_id: 'demo-teacher-4',
              file_url: 'https://demo-storage.supabase.co/videos/sample4.mp4'
            },
            {
              id: 'sample-5',
              title: 'Indian History - Mughal Empire',
              description: 'Learn about the rise and fall of the Mughal Empire in India',
              subject: 'History',
              grade_level: '12th Grade',
              thumbnail_url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=300&fit=crop',
              duration: 1540, // 25:40 in seconds
              upload_date: '2024-02-05',
              views: 890,
              upvotes: 56,
              teacher_id: 'demo-teacher-5',
              file_url: 'https://demo-storage.supabase.co/videos/sample5.mp4'
            },
            {
              id: 'sample-6',
              title: 'Physics - Laws of Motion',
              description: 'Understanding Newton\'s three laws of motion with examples',
              subject: 'Physics',
              grade_level: '11th Grade',
              thumbnail_url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=300&fit=crop',
              duration: 1170, // 19:30 in seconds
              upload_date: '2024-02-10',
              views: 1350,
              upvotes: 92,
              teacher_id: 'demo-teacher-6',
              file_url: 'https://demo-storage.supabase.co/videos/sample6.mp4'
            }
          ]
          localStorage.setItem('demo_videos', JSON.stringify(sampleVideos))
          setVideos(sampleVideos)
        } else {
          setVideos(demoVideos)
        }
      } catch (error) {
        console.error('Failed to load videos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAllVideos()
  }, [])

  const subjects = ['all', 'Mathematics', 'Biology', 'English', 'Chemistry', 'History', 'Physics']
  const grades = ['all', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade']

  // Convert video data to VideoCard format
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

  // Convert video data to VideoPlayer format
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

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === 'all' || video.subject === selectedSubject
    const matchesGrade = selectedGrade === 'all' || video.grade_level === selectedGrade
    
    return matchesSearch && matchesSubject && matchesGrade
  })

  // Sort videos
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime()
      case 'popular':
        return b.views - a.views
      case 'liked':
        return b.upvotes - a.upvotes
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

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
  }

  const handleAddToFavorites = (videoId: string) => {
    const newFavoriteVideos = new Set(favoriteVideos)
    if (newFavoriteVideos.has(videoId)) {
      newFavoriteVideos.delete(videoId)
    } else {
      newFavoriteVideos.add(videoId)
    }
    setFavoriteVideos(newFavoriteVideos)
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
          <p className="text-gray-600">Loading videos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-heading text-gray-900 mb-2">📚 Video Library</h1>
          <p className="text-gray-600">Discover educational content from amazing teachers</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
            {sortedVideos.length} videos available
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search videos, teachers, or subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {subjects.slice(1).map(subject => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          {/* Grade Filter */}
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Grades</option>
              {grades.slice(1).map(grade => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="liked">Most Liked</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {sortedVideos.length} of {videos.length} videos
          </div>
        </div>
      </div>

      {/* Video Grid/List */}
      {sortedVideos.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {sortedVideos.map(video => (
            <VideoCard
              key={video.id}
              video={convertToVideoCardFormat(video)}
              onPlay={() => handleVideoPlay(video)}
              onLike={handleLike}
              onDownload={handleDownload}
              onAddToFavorites={handleAddToFavorites}
              isLiked={likedVideos.has(video.id)}
              isFavorited={favoriteVideos.has(video.id)}
              layout={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No videos found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters</p>
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

export default VideoLibrary
