import React, { useState } from 'react'
import { Play, Award, BookOpen, MessageCircle, Upload, Download, Trophy } from 'lucide-react'

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [doubtInput, setDoubtInput] = useState('')
  const [aiResponse, setAiResponse] = useState('')

  const stats = {
    videosWatched: 45,
    creditsEarned: 120,
    testsCompleted: 8,
    rank: 15,
    totalStudents: 500
  }

  const recentVideos = [
    { id: 1, title: 'Quadratic Equations', teacher: 'Ms. Sharma', duration: '15:30', subject: 'Mathematics' },
    { id: 2, title: 'Cell Division', teacher: 'Mr. Patel', duration: '12:45', subject: 'Biology' },
    { id: 3, title: 'Essay Writing', teacher: 'Ms. Kumar', duration: '18:20', subject: 'English' }
  ]

  const leaderboard = [
    { rank: 1, name: 'Priya Singh', credits: 450, avatar: '👩‍🎓' },
    { rank: 2, name: 'Rahul Verma', credits: 420, avatar: '👨‍🎓' },
    { rank: 3, name: 'Anita Devi', credits: 380, avatar: '👩‍🎓' },
    { rank: 4, name: 'Vikash Kumar', credits: 350, avatar: '👨‍🎓' },
    { rank: 5, name: 'You', credits: 120, avatar: '🎯' }
  ]

  const handleDoubtSubmit = () => {
    if (!doubtInput.trim()) return
    
    // Simulate AI response
    setTimeout(() => {
      if (doubtInput.toLowerCase().includes('photosynthesis')) {
        setAiResponse('Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in chloroplasts and involves two main stages: light-dependent reactions and the Calvin cycle.')
      } else if (doubtInput.toLowerCase().includes('algebra')) {
        setAiResponse('Algebra is a branch of mathematics that uses symbols and letters to represent numbers and quantities in formulas and equations. It helps solve problems by finding unknown values.')
      } else {
        setAiResponse('I understand your question. Let me help you with that. For more detailed explanations, you can check our video library or ask your teachers directly.')
      }
    }, 1000)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-semibold">
            {stats.creditsEarned} Credits
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
            Rank #{stats.rank}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Videos Watched</p>
              <p className="text-2xl font-bold text-blue-600">{stats.videosWatched}</p>
            </div>
            <Play className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Credits Earned</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.creditsEarned}</p>
            </div>
            <Award className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tests Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.testsCompleted}</p>
            </div>
            <BookOpen className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Your Rank</p>
              <p className="text-2xl font-bold text-purple-600">#{stats.rank}</p>
            </div>
            <Trophy className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BookOpen },
            { id: 'videos', name: 'Continue Learning', icon: Play },
            { id: 'doubts', name: 'Ask AI', icon: MessageCircle },
            { id: 'upload', name: 'Upload & Earn', icon: Upload },
            { id: 'leaderboard', name: 'Leaderboard', icon: Trophy }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Continue Watching</h3>
              <div className="space-y-4">
                {recentVideos.map((video) => (
                  <div key={video.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Play className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{video.title}</h4>
                      <p className="text-sm text-gray-600">{video.teacher} • {video.subject}</p>
                      <p className="text-xs text-gray-500">{video.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Download className="h-6 w-6 text-green-600" />
                  <span>Download Videos for Offline</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  <span>Take a Practice Test</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Upload className="h-6 w-6 text-purple-600" />
                  <span>Upload Educational Content</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'doubts' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">AI Doubt Resolution</h3>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={doubtInput}
                  onChange={(e) => setDoubtInput(e.target.value)}
                  placeholder="Ask your question here..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleDoubtSubmit()}
                />
                <button
                  onClick={handleDoubtSubmit}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Ask AI
                </button>
              </div>
              {aiResponse && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">{aiResponse}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Student Leaderboard</h3>
            <div className="space-y-3">
              {leaderboard.map((student) => (
                <div
                  key={student.rank}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    student.name === 'You' ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{student.avatar}</div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-600">Rank #{student.rank}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-yellow-600">{student.credits} credits</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard
