import React, { useState, useEffect } from 'react'
import { Clock, Award, BookOpen, Users, Play, Trophy, Filter, Search, CheckCircle, Star } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { assessmentService } from '../services/assessmentService'
import type { Assessment, AssessmentAttempt } from '../services/assessmentService'
import AssessmentTaker from '../components/AssessmentTaker'

const Assessments: React.FC = () => {
  const { user } = useAuth()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [showTaker, setShowTaker] = useState(false)
  const [completedAttempt, setCompletedAttempt] = useState<AssessmentAttempt | null>(null)
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Generate sample assessments if none exist
      const existingAssessments = assessmentService.getAllAssessments()
      if (existingAssessments.length === 0) {
        assessmentService.generateSampleAssessments()
      }
      
      const publishedAssessments = assessmentService.getPublishedAssessments()
      const studentAttempts = assessmentService.getStudentAttempts(user.id)
      
      setAssessments(publishedAssessments)
      setAttempts(studentAttempts)
    } catch (error) {
      console.error('Failed to load assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment)
    setShowTaker(true)
  }

  const handleAssessmentComplete = (attempt: AssessmentAttempt) => {
    setCompletedAttempt(attempt)
    setShowTaker(false)
    setSelectedAssessment(null)
    loadData() // Refresh data to show new attempt
  }

  const handleExitAssessment = () => {
    setShowTaker(false)
    setSelectedAssessment(null)
  }

  const getAttemptForAssessment = (assessmentId: string): AssessmentAttempt | undefined => {
    return attempts.find(attempt => 
      attempt.assessmentId === assessmentId && attempt.status === 'completed'
    )
  }

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSubject = filterSubject === 'all' || assessment.subject === filterSubject
    const matchesDifficulty = filterDifficulty === 'all' || assessment.difficulty === filterDifficulty
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSubject && matchesDifficulty && matchesSearch
  })

  const subjects = [...new Set(assessments.map(a => a.subject))]

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const getDifficultyColor = (difficulty: Assessment['difficulty']): string => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
    }
  }

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessments...</p>
        </div>
      </div>
    )
  }

  if (showTaker && selectedAssessment && user) {
    return (
      <AssessmentTaker
        assessment={selectedAssessment}
        studentId={user.id}
        studentName={user.full_name}
        onComplete={handleAssessmentComplete}
        onExit={handleExitAssessment}
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold font-heading text-gray-900 mb-2">📝 Assessments</h1>
        <p className="text-gray-600">Test your knowledge and earn credits</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{attempts.filter(a => a.status === 'completed').length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {attempts.length > 0 
                  ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Credits Earned</p>
              <p className="text-2xl font-bold text-gray-900">
                {attempts.reduce((sum, a) => sum + a.creditsEarned, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-gray-400" />
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assessments Grid */}
      {filteredAssessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map(assessment => {
            const attempt = getAttemptForAssessment(assessment.id)
            const isCompleted = !!attempt
            
            return (
              <div key={assessment.id} className="card hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{assessment.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{assessment.description}</p>
                    </div>
                    {isCompleted && (
                      <div className="flex items-center space-x-1 text-green-600 ml-2">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span className="badge badge-primary">{assessment.subject}</span>
                    <span className="badge badge-secondary">{assessment.gradeLevel}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(assessment.difficulty)}`}>
                      {assessment.difficulty.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(assessment.duration)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{assessment.questions.length} questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="h-4 w-4" />
                      <span>{assessment.totalPoints} pts</span>
                    </div>
                  </div>

                  {isCompleted && attempt && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Your Score:</span>
                        <span className={`font-bold ${getScoreColor(attempt.percentage)}`}>
                          {attempt.percentage.toFixed(1)}% ({attempt.score}/{assessment.totalPoints})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Credits Earned:</span>
                        <span className="font-medium text-purple-600">+{attempt.creditsEarned}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleStartAssessment(assessment)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                        isCompleted
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'btn-primary'
                      }`}
                    >
                      <Play className="h-4 w-4" />
                      <span>{isCompleted ? 'Retake' : 'Start'}</span>
                    </button>
                    
                    {assessment.attempts > 0 && (
                      <div className="text-xs text-gray-500 text-center">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{assessment.attempts} attempts</span>
                        </div>
                        <div>Avg: {assessment.averageScore.toFixed(1)}%</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <BookOpen className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No assessments found</h3>
          <p className="text-gray-500">
            {searchTerm || filterSubject !== 'all' || filterDifficulty !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'No assessments are currently available'
            }
          </p>
        </div>
      )}

      {/* Completion Modal */}
      {completedAttempt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Assessment Complete!</h3>
              <p className="text-gray-600 mb-4">
                You scored {completedAttempt.percentage.toFixed(1)}% ({completedAttempt.score}/{selectedAssessment?.totalPoints})
              </p>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 text-purple-800">
                  <Award className="h-5 w-5" />
                  <span className="font-semibold">Credits Earned: +{completedAttempt.creditsEarned}</span>
                </div>
              </div>

              <button
                onClick={() => setCompletedAttempt(null)}
                className="btn-primary w-full"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Assessments
