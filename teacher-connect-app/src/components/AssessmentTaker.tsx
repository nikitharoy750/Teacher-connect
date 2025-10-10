import React, { useState, useEffect, useRef } from 'react'
import { Clock, AlertCircle, CheckCircle, Award, ArrowLeft, ArrowRight, Flag } from 'lucide-react'
import { assessmentService } from '../services/assessmentService'
import type { Assessment, StudentAnswer, AssessmentAttempt } from '../services/assessmentService'

interface AssessmentTakerProps {
  assessment: Assessment
  studentId: string
  studentName: string
  onComplete: (attempt: AssessmentAttempt) => void
  onExit: () => void
}

const AssessmentTaker: React.FC<AssessmentTakerProps> = ({
  assessment,
  studentId,
  studentName,
  onComplete,
  onExit
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Map<string, StudentAnswer>>(new Map())
  const [timeRemaining, setTimeRemaining] = useState(assessment.duration * 60) // in seconds
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  
  const timerRef = useRef<NodeJS.Timeout>()
  const currentQuestion = assessment.questions[currentQuestionIndex]

  useEffect(() => {
    // Start the assessment attempt
    const newAttempt = assessmentService.startAssessment(assessment.id, studentId, studentName)
    setAttempt(newAttempt)
    setQuestionStartTime(Date.now())

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit(true) // Auto-submit when time runs out
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const handleAnswerChange = (answer: string | number) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    
    const studentAnswer: StudentAnswer = {
      questionId: currentQuestion.id,
      answer,
      timeSpent
    }

    setAnswers(prev => new Map(prev.set(currentQuestion.id, studentAnswer)))
  }

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < assessment.questions.length) {
      setCurrentQuestionIndex(index)
      setQuestionStartTime(Date.now())
    }
  }

  const handleSubmit = async (autoSubmit = false) => {
    if (!attempt) return

    setIsSubmitting(true)
    
    try {
      // Convert answers map to array
      const answersArray = Array.from(answers.values())
      
      // Submit the assessment
      const completedAttempt = assessmentService.submitAssessment(attempt.id, answersArray)
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      onComplete(completedAttempt)
    } catch (error) {
      console.error('Failed to submit assessment:', error)
      alert('Failed to submit assessment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getTimeColor = (): string => {
    if (timeRemaining > assessment.duration * 60 * 0.5) return 'text-green-600'
    if (timeRemaining > assessment.duration * 60 * 0.25) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAnsweredCount = (): number => {
    return answers.size
  }

  const isQuestionAnswered = (questionId: string): boolean => {
    return answers.has(questionId)
  }

  const renderQuestion = () => {
    const answer = answers.get(currentQuestion.id)

    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-sm font-medium text-gray-500">
                Question {currentQuestionIndex + 1} of {assessment.questions.length}
              </span>
              <span className="badge badge-primary">{currentQuestion.points} points</span>
              <span className={`badge ${
                currentQuestion.difficulty === 'easy' ? 'badge-success' :
                currentQuestion.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'
              }`}>
                {currentQuestion.difficulty}
              </span>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQuestion.question}
            </h3>
          </div>
          
          {isQuestionAnswered(currentQuestion.id) && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Answered</span>
            </div>
          )}
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answer?.answer === index
                      ? 'border-primary bg-primary-light bg-opacity-10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={index}
                    checked={answer?.answer === index}
                    onChange={() => handleAnswerChange(index)}
                    className="text-primary focus:ring-primary mr-4"
                  />
                  <span className="text-gray-900">
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'true_false' && (
            <div className="space-y-3">
              {['True', 'False'].map((option) => (
                <label
                  key={option}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answer?.answer === option.toLowerCase()
                      ? 'border-primary bg-primary-light bg-opacity-10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option.toLowerCase()}
                    checked={answer?.answer === option.toLowerCase()}
                    onChange={() => handleAnswerChange(option.toLowerCase())}
                    className="text-primary focus:ring-primary mr-4"
                  />
                  <span className="text-gray-900 font-medium">{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'short_answer' && (
            <div>
              <textarea
                value={answer?.answer || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all"
                placeholder="Enter your answer here..."
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{assessment.title}</h1>
              <p className="text-sm text-gray-600">{assessment.subject} • {assessment.gradeLevel}</p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Clock className={`h-5 w-5 ${getTimeColor()}`} />
                <span className={`font-mono text-lg font-bold ${getTimeColor()}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                {getAnsweredCount()} of {assessment.questions.length} answered
              </div>
              
              <button
                onClick={onExit}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <div className="card p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                {assessment.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => goToQuestion(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      index === currentQuestionIndex
                        ? 'bg-primary text-white'
                        : isQuestionAnswered(question.id)
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Answered:</span>
                    <span className="font-medium">{getAnsweredCount()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Remaining:</span>
                    <span className="font-medium">{assessment.questions.length - getAnsweredCount()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="card p-8">
              {renderQuestion()}
              
              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => goToQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center space-x-4">
                  {currentQuestionIndex === assessment.questions.length - 1 ? (
                    <button
                      onClick={() => setShowConfirmSubmit(true)}
                      disabled={isSubmitting}
                      className="btn-primary px-6 py-2 flex items-center space-x-2"
                    >
                      <Flag className="h-4 w-4" />
                      <span>Submit Assessment</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => goToQuestion(currentQuestionIndex + 1)}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Assessment?</h3>
              <p className="text-gray-600 mb-6">
                You have answered {getAnsweredCount()} out of {assessment.questions.length} questions.
                {getAnsweredCount() < assessment.questions.length && (
                  <span className="block mt-2 text-yellow-600 font-medium">
                    {assessment.questions.length - getAnsweredCount()} questions remain unanswered.
                  </span>
                )}
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Continue
                </button>
                <button
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="flex-1 btn-primary px-4 py-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssessmentTaker
