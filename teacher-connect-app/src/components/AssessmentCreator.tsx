import React, { useState } from 'react'
import { X, Plus, Trash2, Save, Eye, Clock, Award, BookOpen } from 'lucide-react'
import { assessmentService } from '../services/assessmentService'
import type { Assessment, Question } from '../services/assessmentService'

interface AssessmentCreatorProps {
  onClose: () => void
  onSave: (assessment: Assessment) => void
  teacherId: string
  teacherName: string
}

const AssessmentCreator: React.FC<AssessmentCreatorProps> = ({
  onClose,
  onSave,
  teacherId,
  teacherName
}) => {
  const [step, setStep] = useState<'details' | 'questions' | 'preview'>('details')
  const [assessmentData, setAssessmentData] = useState({
    title: '',
    description: '',
    subject: '',
    gradeLevel: '',
    duration: 30,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    tags: '',
    instructions: '',
    isPublished: false
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    type: 'multiple_choice',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    points: 10,
    difficulty: 'medium',
    tags: []
  })

  const subjects = [
    'Mathematics', 'Science', 'English', 'History', 'Geography',
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art'
  ]

  const gradeLevels = [
    '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade',
    '11th Grade', '12th Grade', 'College Level'
  ]

  const addQuestion = () => {
    if (!currentQuestion.question?.trim()) return

    const question: Question = {
      id: `q-${Date.now()}`,
      type: currentQuestion.type || 'multiple_choice',
      question: currentQuestion.question,
      options: currentQuestion.type === 'multiple_choice' ? currentQuestion.options : undefined,
      correctAnswer: currentQuestion.correctAnswer || '',
      explanation: currentQuestion.explanation || '',
      points: currentQuestion.points || 10,
      difficulty: currentQuestion.difficulty || 'medium',
      subject: assessmentData.subject,
      gradeLevel: assessmentData.gradeLevel,
      tags: currentQuestion.tags ?
        (Array.isArray(currentQuestion.tags)
          ? currentQuestion.tags
          : [])
        : []
    }

    setQuestions([...questions, question])
    setCurrentQuestion({
      type: 'multiple_choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 10,
      difficulty: 'medium',
      tags: []
    })
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    if (!assessmentData.title.trim() || !assessmentData.subject || !assessmentData.gradeLevel || questions.length === 0) {
      alert('Please fill in all required fields and add at least one question')
      return
    }

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

    const assessment = assessmentService.createAssessment({
      ...assessmentData,
      createdBy: teacherId,
      createdByName: teacherName,
      questions,
      totalPoints,
      tags: assessmentData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
    })

    onSave(assessment)
    onClose()
  }

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assessment Title *
          </label>
          <input
            type="text"
            value={assessmentData.title}
            onChange={(e) => setAssessmentData({ ...assessmentData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter assessment title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <select
            value={assessmentData.subject}
            onChange={(e) => setAssessmentData({ ...assessmentData, subject: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            <option value="">Select subject</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grade Level *
          </label>
          <select
            value={assessmentData.gradeLevel}
            onChange={(e) => setAssessmentData({ ...assessmentData, gradeLevel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            <option value="">Select grade</option>
            {gradeLevels.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={assessmentData.duration}
            onChange={(e) => setAssessmentData({ ...assessmentData, duration: parseInt(e.target.value) || 30 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            min="5"
            max="180"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty
          </label>
          <select
            value={assessmentData.difficulty}
            onChange={(e) => setAssessmentData({ ...assessmentData, difficulty: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={assessmentData.description}
          onChange={(e) => setAssessmentData({ ...assessmentData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Describe what this assessment covers..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructions
        </label>
        <textarea
          value={assessmentData.instructions}
          onChange={(e) => setAssessmentData({ ...assessmentData, instructions: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Instructions for students taking this assessment..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (comma separated)
        </label>
        <input
          type="text"
          value={assessmentData.tags}
          onChange={(e) => setAssessmentData({ ...assessmentData, tags: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="algebra, equations, basic math"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="published"
          checked={assessmentData.isPublished}
          onChange={(e) => setAssessmentData({ ...assessmentData, isPublished: e.target.checked })}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="published" className="text-sm text-gray-700">
          Publish immediately (students can take this assessment)
        </label>
      </div>
    </div>
  )

  const renderQuestionsStep = () => (
    <div className="space-y-6">
      {/* Existing Questions */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Questions ({questions.length})</h4>
          {questions.map((question, index) => (
            <div key={question.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                    <span className="badge badge-primary">{question.type.replace('_', ' ')}</span>
                    <span className="badge badge-secondary">{question.points} pts</span>
                  </div>
                  <p className="text-gray-900 mb-2">{question.question}</p>
                  {question.options && (
                    <div className="space-y-1">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className={`text-sm ${optIndex === question.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                          {String.fromCharCode(65 + optIndex)}. {option}
                          {optIndex === question.correctAnswer && ' ✓'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeQuestion(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Question */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Add New Question</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={currentQuestion.type}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="short_answer">Short Answer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
            <input
              type="number"
              value={currentQuestion.points}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 10 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              min="1"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={currentQuestion.difficulty}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, difficulty: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
          <textarea
            value={currentQuestion.question}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter your question here..."
            required
          />
        </div>

        {currentQuestion.type === 'multiple_choice' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
            <div className="space-y-2">
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correct_answer"
                    checked={currentQuestion.correctAnswer === index}
                    onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                    className="text-primary focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(currentQuestion.options || [])]
                      newOptions[index] = e.target.value
                      setCurrentQuestion({ ...currentQuestion, options: newOptions })
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {currentQuestion.type === 'true_false' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tf_answer"
                  value="true"
                  checked={currentQuestion.correctAnswer === 'true'}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                  className="text-primary focus:ring-primary mr-2"
                />
                True
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tf_answer"
                  value="false"
                  checked={currentQuestion.correctAnswer === 'false'}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                  className="text-primary focus:ring-primary mr-2"
                />
                False
              </label>
            </div>
          </div>
        )}

        {currentQuestion.type === 'short_answer' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
            <input
              type="text"
              value={currentQuestion.correctAnswer}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter the correct answer"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (optional)</label>
          <textarea
            value={currentQuestion.explanation}
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Explain why this is the correct answer..."
          />
        </div>

        <button
          onClick={addQuestion}
          disabled={!currentQuestion.question?.trim()}
          className="btn-primary px-4 py-2 disabled:opacity-50 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Question</span>
        </button>
      </div>
    </div>
  )

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="card p-6 bg-blue-50 border-blue-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{assessmentData.title}</h3>
        <p className="text-gray-600 mb-4">{assessmentData.description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span>{assessmentData.subject}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="h-4 w-4 text-blue-600" />
            <span>{assessmentData.gradeLevel}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>{assessmentData.duration} minutes</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              assessmentData.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              assessmentData.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {assessmentData.difficulty.toUpperCase()}
            </span>
          </div>
        </div>

        {assessmentData.instructions && (
          <div className="mt-4 p-3 bg-white rounded-lg border">
            <h4 className="font-medium text-gray-900 mb-1">Instructions:</h4>
            <p className="text-gray-600 text-sm">{assessmentData.instructions}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Questions ({questions.length})</h4>
        {questions.map((question, index) => (
          <div key={question.id} className="card p-4">
            <div className="flex items-start justify-between mb-2">
              <h5 className="font-medium text-gray-900">Question {index + 1}</h5>
              <span className="text-sm text-gray-500">{question.points} points</span>
            </div>
            <p className="text-gray-700 mb-3">{question.question}</p>
            {question.options && (
              <div className="space-y-1">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className={`text-sm p-2 rounded ${
                    optIndex === question.correctAnswer ? 'bg-green-50 text-green-700 border border-green-200' : 'text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + optIndex)}. {option}
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
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Assessment</h2>
            <div className="flex items-center space-x-4 mt-2">
              {['details', 'questions', 'preview'].map((stepName, index) => (
                <div key={stepName} className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === stepName ? 'bg-primary text-white' : 
                    ['details', 'questions', 'preview'].indexOf(step) > index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`text-sm ${step === stepName ? 'text-primary font-medium' : 'text-gray-600'}`}>
                    {stepName.charAt(0).toUpperCase() + stepName.slice(1)}
                  </span>
                  {index < 2 && <div className="w-8 h-px bg-gray-300" />}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'details' && renderDetailsStep()}
          {step === 'questions' && renderQuestionsStep()}
          {step === 'preview' && renderPreviewStep()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div>
            {step === 'questions' && (
              <p className="text-sm text-gray-600">
                {questions.length} question{questions.length !== 1 ? 's' : ''} added
                {questions.length > 0 && ` • ${questions.reduce((sum, q) => sum + q.points, 0)} total points`}
              </p>
            )}
          </div>
          
          <div className="flex space-x-4">
            {step !== 'details' && (
              <button
                onClick={() => setStep(step === 'preview' ? 'questions' : 'details')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            
            {step === 'details' && (
              <button
                onClick={() => setStep('questions')}
                disabled={!assessmentData.title.trim() || !assessmentData.subject || !assessmentData.gradeLevel}
                className="btn-primary px-6 py-2 disabled:opacity-50"
              >
                Next: Add Questions
              </button>
            )}
            
            {step === 'questions' && (
              <button
                onClick={() => setStep('preview')}
                disabled={questions.length === 0}
                className="btn-primary px-6 py-2 disabled:opacity-50 flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </button>
            )}
            
            {step === 'preview' && (
              <button
                onClick={handleSave}
                className="btn-primary px-6 py-2 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Create Assessment</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssessmentCreator
