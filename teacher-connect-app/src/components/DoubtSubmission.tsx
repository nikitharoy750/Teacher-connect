import React, { useState } from 'react'
import { MessageCircle, Send, Tag, X, Plus, AlertCircle, Sparkles } from 'lucide-react'
import { AIDoubtService } from '../services/aiDoubtService'
import { useAuth } from '../contexts/AuthContext'

interface DoubtSubmissionProps {
  onSubmitSuccess?: () => void
}

const DoubtSubmission: React.FC<DoubtSubmissionProps> = ({ onSubmitSuccess }) => {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    question: '',
    subject: '',
    grade_level: '',
    tags: [] as string[]
  })
  const [newTag, setNewTag] = useState('')

  const subjects = [
    'Mathematics', 'Science', 'English', 'History', 'Geography',
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art'
  ]

  const gradeLevels = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('Please log in to submit a doubt')
      return
    }

    if (!formData.question.trim() || !formData.subject || !formData.grade_level) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      await AIDoubtService.submitDoubt({
        question: formData.question.trim(),
        subject: formData.subject,
        grade_level: formData.grade_level,
        student_id: user.id,
        student_name: user.full_name,
        tags: formData.tags
      })

      // Reset form
      setFormData({
        question: '',
        subject: '',
        grade_level: '',
        tags: []
      })

      alert('Your doubt has been submitted! AI is generating a response...')
      onSubmitSuccess?.()
    } catch (error) {
      console.error('Error submitting doubt:', error)
      alert('Failed to submit doubt. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getQuestionLength = () => formData.question.length
  const getQuestionLengthColor = () => {
    const length = getQuestionLength()
    if (length < 20) return 'text-red-500'
    if (length < 50) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-blue-100 rounded-full mr-4">
          <MessageCircle className="text-blue-600" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Ask Your Doubt</h3>
          <p className="text-gray-600">Get instant AI-powered answers to your questions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Question *
          </label>
          <textarea
            name="question"
            value={formData.question}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Describe your doubt in detail. The more specific you are, the better the AI can help you..."
            required
          />
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xs ${getQuestionLengthColor()}`}>
              {getQuestionLength()} characters
              {getQuestionLength() < 20 && ' (Please provide more details)'}
            </span>
            <div className="flex items-center text-xs text-gray-500">
              <Sparkles size={12} className="mr-1" />
              AI will analyze your question
            </div>
          </div>
        </div>

        {/* Subject and Grade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade Level *
            </label>
            <select
              name="grade_level"
              value={formData.grade_level}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Grade</option>
              {gradeLevels.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (Optional)
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add tags to help categorize your doubt"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  <Tag size={12} className="mr-1" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="text-blue-600 mr-2 mt-0.5" size={16} />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Tips for better answers:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be specific about what you're struggling with</li>
                <li>• Include any relevant context or background information</li>
                <li>• Mention what you've already tried</li>
                <li>• Use proper subject terminology when possible</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !formData.question.trim() || !formData.subject || !formData.grade_level}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Submitting & Generating AI Response...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>Submit Doubt & Get AI Answer</span>
            </>
          )}
        </button>
      </form>

      {/* AI Features Info */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <div className="flex items-center mb-2">
          <Sparkles className="text-purple-600 mr-2" size={16} />
          <h4 className="text-sm font-medium text-purple-900">AI-Powered Features</h4>
        </div>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Instant intelligent responses based on your question</li>
          <li>• Subject and difficulty level detection</li>
          <li>• Personalized learning recommendations</li>
          <li>• Step-by-step explanations and examples</li>
        </ul>
      </div>
    </div>
  )
}

export default DoubtSubmission
