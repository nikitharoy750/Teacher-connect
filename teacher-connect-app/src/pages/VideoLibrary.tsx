import React, { useState } from 'react'
import { Play, Download, Heart, Search, Clock, User, Volume2 } from 'lucide-react'

const VideoLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedGrade, setSelectedGrade] = useState('all')

  const videos = [
    {
      id: 1,
      title: 'Introduction to Algebra',
      teacher: 'Ms. Sharma',
      subject: 'Mathematics',
      grade: '9th',
      duration: '15:30',
      views: 1250,
      likes: 89,
      thumbnail: '/api/placeholder/300/200',
      description: 'Learn the basics of algebraic expressions and equations'
    },
    {
      id: 2,
      title: 'Photosynthesis Process',
      teacher: 'Mr. Patel',
      subject: 'Biology',
      grade: '10th',
      duration: '12:45',
      views: 980,
      likes: 67,
      thumbnail: '/api/placeholder/300/200',
      description: 'Understanding how plants make their own food'
    },
    {
      id: 3,
      title: 'English Grammar Fundamentals',
      teacher: 'Ms. Kumar',
      subject: 'English',
      grade: '8th',
      duration: '18:20',
      views: 756,
      likes: 45,
      thumbnail: '/api/placeholder/300/200',
      description: 'Master the basics of English grammar and sentence structure'
    },
    {
      id: 4,
      title: 'Chemical Reactions',
      teacher: 'Dr. Singh',
      subject: 'Chemistry',
      grade: '11th',
      duration: '22:15',
      views: 1100,
      likes: 78,
      thumbnail: '/api/placeholder/300/200',
      description: 'Explore different types of chemical reactions and their properties'
    },
    {
      id: 5,
      title: 'Indian History - Mughal Empire',
      teacher: 'Mr. Gupta',
      subject: 'History',
      grade: '12th',
      duration: '25:40',
      views: 890,
      likes: 56,
      thumbnail: '/api/placeholder/300/200',
      description: 'Learn about the rise and fall of the Mughal Empire in India'
    },
    {
      id: 6,
      title: 'Physics - Laws of Motion',
      teacher: 'Ms. Reddy',
      subject: 'Physics',
      grade: '11th',
      duration: '19:30',
      views: 1350,
      likes: 92,
      thumbnail: '/api/placeholder/300/200',
      description: 'Understanding Newton\'s three laws of motion with examples'
    }
  ]

  const subjects = ['all', 'Mathematics', 'Biology', 'English', 'Chemistry', 'History', 'Physics']
  const grades = ['all', '8th', '9th', '10th', '11th', '12th']

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === 'all' || video.subject === selectedSubject
    const matchesGrade = selectedGrade === 'all' || video.grade === selectedGrade
    
    return matchesSearch && matchesSubject && matchesGrade
  })

  const handleVideoToAudio = (videoId: number) => {
    // Simulate video to audio conversion
    alert(`Converting video ${videoId} to audio format. This feature will be available soon!`)
  }

  const handleDownload = (videoId: number) => {
    // Simulate download
    alert(`Downloading video ${videoId} for offline viewing...`)
  }

  const handleLike = (videoId: number) => {
    // Simulate like functionality
    alert(`Liked video ${videoId}!`)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Video Library</h1>
        <div className="text-sm text-gray-600">
          {filteredVideos.length} videos available
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search videos, teachers, or subjects..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {grades.map(grade => (
                <option key={grade} value={grade}>
                  {grade === 'all' ? 'All Grades' : `Grade ${grade}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <div key={video.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Video Thumbnail */}
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <Play className="h-16 w-16 text-white opacity-80" />
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {video.duration}
              </div>
            </div>

            {/* Video Info */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <User className="h-4 w-4 mr-1" />
                <span>{video.teacher}</span>
                <span className="mx-2">•</span>
                <span>{video.subject}</span>
                <span className="mx-2">•</span>
                <span>Grade {video.grade}</span>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{video.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{video.views} views</span>
                <span>{video.likes} likes</span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-1">
                  <Play className="h-4 w-4" />
                  <span>Watch</span>
                </button>
                
                <button
                  onClick={() => handleVideoToAudio(video.id)}
                  className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
                  title="Convert to Audio"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => handleDownload(video.id)}
                  className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => handleLike(video.id)}
                  className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                  title="Like"
                >
                  <Heart className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No videos found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  )
}

export default VideoLibrary
