import React, { useState, useEffect } from 'react'
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, Crown, Users } from 'lucide-react'
import { LeaderboardService, type LeaderboardEntry } from '../services/leaderboardService'
import { useAuth } from '../contexts/AuthContext'

interface LeaderboardProps {
  category?: 'teacher' | 'student' | 'both'
  showTop?: number
  compact?: boolean
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  category = 'both', 
  showTop = 10,
  compact = false 
}) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>(
    category === 'both' ? 'teacher' : category
  )
  const [teacherLeaderboard, setTeacherLeaderboard] = useState<LeaderboardEntry[]>([])
  const [studentLeaderboard, setStudentLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboards()
  }, [])

  const loadLeaderboards = () => {
    setLoading(true)
    try {
      const teachers = LeaderboardService.getTeacherLeaderboard()
      const students = LeaderboardService.getStudentLeaderboard()
      
      setTeacherLeaderboard(teachers.slice(0, showTop))
      setStudentLeaderboard(students.slice(0, showTop))
    } catch (error) {
      console.error('Error loading leaderboards:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-500" size={20} />
      case 2:
        return <Medal className="text-gray-400" size={20} />
      case 3:
        return <Award className="text-amber-600" size={20} />
      default:
        return <span className="text-gray-600 font-bold text-sm">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white'
      default:
        return 'bg-white border border-gray-200'
    }
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="text-green-500" size={16} />
    if (change < 0) return <TrendingDown className="text-red-500" size={16} />
    return <Minus className="text-gray-400" size={16} />
  }

  const currentLeaderboard = activeTab === 'teacher' ? teacherLeaderboard : studentLeaderboard

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-semibold flex items-center`}>
          <Trophy className="mr-2 text-yellow-500" />
          Leaderboard
        </h3>
        
        {category === 'both' && (
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('teacher')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'teacher'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Teachers
            </button>
            <button
              onClick={() => setActiveTab('student')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'student'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Students
            </button>
          </div>
        )}
      </div>

      {currentLeaderboard.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 mb-2">No rankings available yet</p>
          <p className="text-sm text-gray-500">
            {activeTab === 'teacher' 
              ? 'Teachers will appear here as they receive ratings'
              : 'Students will appear here as they earn points'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentLeaderboard.map((entry, _index) => (
            <div
              key={entry.id}
              className={`${getRankColor(entry.rank)} rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                user?.id === entry.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {entry.avatar ? (
                        <img
                          src={entry.avatar}
                          alt={entry.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="text-gray-500" size={20} />
                      )}
                    </div>
                    
                    <div>
                      <h4 className={`font-medium ${entry.rank <= 3 ? 'text-white' : 'text-gray-900'}`}>
                        {entry.name}
                        {user?.id === entry.id && (
                          <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${entry.rank <= 3 ? 'text-white opacity-90' : 'text-gray-600'}`}>
                          {entry.score} points
                        </span>
                        {!compact && (
                          <div className="flex items-center space-x-1">
                            {getChangeIcon(entry.change)}
                            {entry.change !== 0 && (
                              <span className={`text-xs ${
                                entry.change > 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {Math.abs(entry.change)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {!compact && entry.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {entry.badges.slice(0, 2).map((badge, badgeIndex) => (
                      <span
                        key={badgeIndex}
                        className={`text-xs px-2 py-1 rounded-full ${
                          entry.rank <= 3 
                            ? 'bg-white bg-opacity-20 text-white' 
                            : 'bg-blue-100 text-blue-800'
                        }`}
                        title={badge}
                      >
                        {badge.split(' ')[0]} {/* Show only emoji/first word */}
                      </span>
                    ))}
                    {entry.badges.length > 2 && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          entry.rank <= 3 
                            ? 'bg-white bg-opacity-20 text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        +{entry.badges.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Full badges list for top 3 */}
              {!compact && entry.rank <= 3 && entry.badges.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white border-opacity-20">
                  <div className="flex flex-wrap gap-1">
                    {entry.badges.map((badge, badgeIndex) => (
                      <span
                        key={badgeIndex}
                        className="text-xs bg-white bg-opacity-20 text-white px-2 py-1 rounded-full"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* User's Position (if not in top list) */}
      {!compact && user && !currentLeaderboard.find(entry => entry.id === user.id) && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="text-blue-600" size={16} />
                <span className="text-sm font-medium text-blue-900">Your Position</span>
              </div>
              <span className="text-sm text-blue-700">
                {activeTab === 'teacher' && user.role === 'teacher' 
                  ? 'Not ranked yet - start receiving ratings!'
                  : activeTab === 'student' && user.role === 'student'
                  ? 'Not ranked yet - start earning points!'
                  : 'Join as a ' + activeTab + ' to see your ranking'
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      {!compact && (
        <div className="mt-4 text-center">
          <button
            onClick={loadLeaderboards}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Refresh Rankings
          </button>
        </div>
      )}
    </div>
  )
}

export default Leaderboard
