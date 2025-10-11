import React, { useState } from 'react'
import { Trophy, Users, Star, TrendingUp, Award, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Leaderboard from '../components/Leaderboard'
import { LeaderboardService } from '../services/leaderboardService'

const Community: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'ratings' | 'stats'>('leaderboard')

  const tabs = [
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'ratings', label: 'Teacher Ratings', icon: Star },
    { id: 'stats', label: 'Community Stats', icon: TrendingUp }
  ]

  // Get user stats
  const userStats = user?.role === 'teacher' 
    ? LeaderboardService.getTeacherStats(user.id)
    : user?.role === 'student'
    ? LeaderboardService.getStudentStats(user.id)
    : null

  const recentRatings = LeaderboardService.getTeacherRatings().slice(0, 10)

  return (
    <div className="min-h-screen bg-dark-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-50 flex items-center">
            <Users className="mr-3 text-blue-500" />
            Community Hub
          </h1>
          <p className="mt-2 text-gray-300">
            Connect with teachers and students, track progress, and celebrate achievements
          </p>
        </div>

        {/* User Stats Banner */}
        {userStats && (
          <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Your Progress</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {user?.role === 'teacher' && 'total_ratings' in userStats && (
                    <>
                      <div>
                        <p className="text-sm opacity-90">Average Rating</p>
                        <p className="text-2xl font-bold">
                          {userStats.average_rating.toFixed(1)} ⭐
                        </p>
                      </div>
                      <div>
                        <p className="text-sm opacity-90">Total Ratings</p>
                        <p className="text-2xl font-bold">{userStats.total_ratings}</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-90">Content Views</p>
                        <p className="text-2xl font-bold">{userStats.total_views}</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-90">Points</p>
                        <p className="text-2xl font-bold">{userStats.points}</p>
                      </div>
                    </>
                  )}
                  {user?.role === 'student' && 'total_credits' in userStats && (
                    <>
                      <div>
                        <p className="text-sm opacity-90">Level</p>
                        <p className="text-2xl font-bold">{userStats.level}</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-90">Points</p>
                        <p className="text-2xl font-bold">{userStats.points}</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-90">Assessments</p>
                        <p className="text-2xl font-bold">{userStats.assessments_completed}</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-90">Content Uploaded</p>
                        <p className="text-2xl font-bold">{userStats.content_uploaded}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Award className="mb-2" size={48} />
                <p className="text-sm opacity-90">Badges Earned</p>
                <p className="text-lg font-semibold">{userStats.badges.length}</p>
              </div>
            </div>
            
            {userStats.badges.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <p className="text-sm opacity-90 mb-2">Your Badges:</p>
                <div className="flex flex-wrap gap-2">
                  {userStats.badges.map((badge, index) => (
                    <span
                      key={index}
                      className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'leaderboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Leaderboard category="teacher" showTop={10} />
              <Leaderboard category="student" showTop={10} />
            </div>
          )}

          {activeTab === 'ratings' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Star className="mr-2 text-yellow-500" />
                Recent Teacher Ratings
              </h3>

              {recentRatings.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-600 mb-2">No ratings yet</p>
                  <p className="text-sm text-gray-500">
                    Ratings will appear here as students rate teacher content
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentRatings.map(rating => (
                    <div key={rating.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  size={16}
                                  className={`${
                                    star <= rating.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {rating.rating}/5
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            by {rating.student_name} • {rating.content_type}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {rating.comment && (
                        <p className="text-sm text-gray-700 mt-2 italic">
                          "{rating.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Teachers</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {LeaderboardService.getTeacherLeaderboard().length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Users className="text-green-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Students</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {LeaderboardService.getStudentLeaderboard().length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Star className="text-yellow-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Ratings</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {recentRatings.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <MessageCircle className="text-purple-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Community Score</p>
                    <p className="text-2xl font-semibold text-gray-900">95%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Community Guidelines */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Community Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">For Students:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Rate teachers honestly and constructively</li>
                <li>• Provide helpful feedback in comments</li>
                <li>• Respect all community members</li>
                <li>• Earn points through active participation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">For Teachers:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Create high-quality educational content</li>
                <li>• Respond to student feedback positively</li>
                <li>• Help build a supportive learning environment</li>
                <li>• Continuously improve based on ratings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Community
