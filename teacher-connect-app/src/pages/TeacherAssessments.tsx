import React, { useState, useEffect } from 'react'
import { Plus, BookOpen, Users, TrendingUp, Eye, Trash2, BarChart3, Clock, Award } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { assessmentService } from '../services/assessmentService'
import type { Assessment, AssessmentStats } from '../services/assessmentService'
import AssessmentCreator from '../components/AssessmentCreator'

const TeacherAssessments: React.FC = () => {
  const { user } = useAuth()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [stats, setStats] = useState<AssessmentStats | null>(null)
  const [showCreator, setShowCreator] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
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
      const teacherAssessments = assessmentService.getAssessmentsByTeacher(user.id)
      const assessmentStats = assessmentService.getAssessmentStats()
      
      setAssessments(teacherAssessments)
      setStats(assessmentStats)
    } catch (error) {
      console.error('Failed to load assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssessment = (assessment: Assessment) => {
    setAssessments(prev => [assessment, ...prev])
    loadData() // Refresh stats
  }

  const handleDeleteAssessment = (assessmentId: string) => {
    if (confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      // In a real app, this would call assessmentService.deleteAssessment()
      setAssessments(prev => prev.filter(a => a.id !== assessmentId))
    }
  }

  const togglePublishStatus = (assessment: Assessment) => {
    // In a real app, this would call assessmentService.updateAssessment()
    const updatedAssessments = assessments.map(a => 
      a.id === assessment.id 
        ? { ...a, isPublished: !a.isPublished }
        : a
    )
    setAssessments(updatedAssessments)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDifficultyColor = (difficulty: Assessment['difficulty']): string => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
    }
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-heading text-gray-900 mb-2">📝 My Assessments</h1>
          <p className="text-gray-600">Create and manage your assessments</p>
        </div>
        
        <button
          onClick={() => setShowCreator(true)}
          className="btn-primary px-6 py-3 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Assessment</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Assessments</p>
                <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Performers */}
      {stats && stats.topPerformers.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Top Performers</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.topPerformers.map((performer, index) => (
              <div key={performer.studentId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{performer.studentName}</p>
                  <p className="text-sm text-gray-600">{performer.percentage.toFixed(1)}% average</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessments List */}
      {assessments.length > 0 ? (
        <div className="space-y-4">
          {assessments.map(assessment => (
            <div key={assessment.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-1">{assessment.title}</h3>
                      <p className="text-gray-600 mb-3">{assessment.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        assessment.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {assessment.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                    <span className="badge badge-primary">{assessment.subject}</span>
                    <span className="badge badge-secondary">{assessment.gradeLevel}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(assessment.difficulty)}`}>
                      {assessment.difficulty.toUpperCase()}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{assessment.duration} minutes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{assessment.questions.length} questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="h-4 w-4" />
                      <span>{assessment.totalPoints} points</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                    <span>Created: {formatDate(assessment.createdAt)}</span>
                    {assessment.attempts > 0 && (
                      <>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{assessment.attempts} attempts</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{assessment.averageScore.toFixed(1)}% avg score</span>
                        </div>
                      </>
                    )}
                  </div>

                  {assessment.tags.length > 0 && (
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-sm text-gray-500">Tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {assessment.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedAssessment(assessment)}
                      className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                    
                    <button
                      onClick={() => togglePublishStatus(assessment)}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                        assessment.isPublished
                          ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                          : 'bg-green-100 hover:bg-green-200 text-green-700'
                      }`}
                    >
                      {assessment.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteAssessment(assessment.id)}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium flex items-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <BookOpen className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No assessments yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first assessment to start testing your students' knowledge
          </p>
          <button
            onClick={() => setShowCreator(true)}
            className="btn-primary px-6 py-3"
          >
            Create Your First Assessment
          </button>
        </div>
      )}

      {/* Assessment Creator Modal */}
      {showCreator && user && (
        <AssessmentCreator
          onClose={() => setShowCreator(false)}
          onSave={handleCreateAssessment}
          teacherId={user.id}
          teacherName={user.full_name}
        />
      )}

      {/* Assessment Details Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">{selectedAssessment.title}</h3>
                <button
                  onClick={() => setSelectedAssessment(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Eye className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{selectedAssessment.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Subject:</span>
                  <p className="text-gray-600">{selectedAssessment.subject}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Grade Level:</span>
                  <p className="text-gray-600">{selectedAssessment.gradeLevel}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Duration:</span>
                  <p className="text-gray-600">{selectedAssessment.duration} minutes</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Difficulty:</span>
                  <p className="text-gray-600">{selectedAssessment.difficulty}</p>
                </div>
              </div>

              {selectedAssessment.instructions && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Instructions</h4>
                  <p className="text-gray-600">{selectedAssessment.instructions}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Questions ({selectedAssessment.questions.length})</h4>
                <div className="space-y-3">
                  {selectedAssessment.questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900">Question {index + 1}</h5>
                        <span className="text-sm text-gray-500">{question.points} points</span>
                      </div>
                      <p className="text-gray-700 mb-2">{question.question}</p>
                      {question.options && (
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className={`text-sm ${
                              optIndex === question.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'
                            }`}>
                              {String.fromCharCode(65 + optIndex)}. {option}
                              {optIndex === question.correctAnswer && ' ✓'}
                            </div>
                          ))}
                        </div>
                      )}
                      {question.explanation && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedAssessment(null)}
                  className="btn-primary px-6 py-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherAssessments
