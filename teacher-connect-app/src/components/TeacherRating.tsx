import React, { useState } from 'react'
import { Star, MessageSquare, Send, X } from 'lucide-react'
import { LeaderboardService } from '../services/leaderboardService'
import { useAuth } from '../contexts/AuthContext'

interface TeacherRatingProps {
  teacherId: string
  teacherName: string
  contentId: string
  contentType: 'video' | 'note' | 'assessment'
  contentTitle: string
  onRatingSubmitted?: () => void
  onClose?: () => void
}

const TeacherRating: React.FC<TeacherRatingProps> = ({
  teacherId,
  teacherName,
  contentId,
  contentType,
  contentTitle,
  onRatingSubmitted,
  onClose
}) => {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStarClick = (starRating: number) => {
    setRating(starRating)
  }

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating)
  }

  const handleStarLeave = () => {
    setHoveredRating(0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || rating === 0) {
      alert('Please select a rating')
      return
    }

    setIsSubmitting(true)

    try {
      await LeaderboardService.rateTeacher({
        teacher_id: teacherId,
        student_id: user.id,
        student_name: user.full_name,
        rating,
        comment: comment.trim() || undefined,
        content_id: contentId,
        content_type: contentType
      })

      alert('Thank you for your rating!')
      onRatingSubmitted?.()
      onClose?.()
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Failed to submit rating. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRatingText = (starRating: number) => {
    switch (starRating) {
      case 1: return 'Poor'
      case 2: return 'Fair'
      case 3: return 'Good'
      case 4: return 'Very Good'
      case 5: return 'Excellent'
      default: return 'Select a rating'
    }
  }

  const displayRating = hoveredRating || rating

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Rate Teacher</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Teacher and Content Info */}
          <div className="text-center">
            <h4 className="font-medium text-gray-900 mb-1">{teacherName}</h4>
            <p className="text-sm text-gray-600">
              {contentType === 'video' ? '📹' : contentType === 'note' ? '📄' : '📝'} {contentTitle}
            </p>
          </div>

          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 mb-3">
              How would you rate this {contentType}?
            </p>
            <div className="flex justify-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= displayRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-gray-600">
              {getRatingText(displayRating)}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare size={16} className="inline mr-1" />
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Share your thoughts about this content..."
              maxLength={500}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                Help other students with your feedback
              </span>
              <span className="text-xs text-gray-500">
                {comment.length}/500
              </span>
            </div>
          </div>

          {/* Rating Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h5 className="text-sm font-medium text-blue-900 mb-2">Rating Guidelines:</h5>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>⭐ Poor - Content was not helpful or had issues</li>
              <li>⭐⭐ Fair - Content was somewhat helpful</li>
              <li>⭐⭐⭐ Good - Content was helpful and clear</li>
              <li>⭐⭐⭐⭐ Very Good - Content was very helpful and well-explained</li>
              <li>⭐⭐⭐⭐⭐ Excellent - Outstanding content, extremely helpful</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Submit Rating</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Benefits */}
        <div className="px-6 pb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h5 className="text-sm font-medium text-green-900 mb-1">Why rate teachers?</h5>
            <ul className="text-xs text-green-800 space-y-1">
              <li>• Help other students find the best content</li>
              <li>• Encourage teachers to create quality materials</li>
              <li>• Improve the overall learning experience</li>
              <li>• Build a supportive learning community</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherRating
