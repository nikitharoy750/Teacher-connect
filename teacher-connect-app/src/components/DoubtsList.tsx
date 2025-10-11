import React, { useState, useEffect } from 'react'
import { MessageCircle, Clock, Tag, ThumbsUp, ThumbsDown, Bot, User, CheckCircle, Filter } from 'lucide-react'
import { AIDoubtService, type Doubt, type DoubtResponse } from '../services/aiDoubtService'
import { useAuth } from '../contexts/AuthContext'

interface DoubtsListProps {
  showMyDoubtsOnly?: boolean
  refreshTrigger?: number
}

const DoubtsList: React.FC<DoubtsListProps> = ({ showMyDoubtsOnly = false, refreshTrigger = 0 }) => {
  const { user } = useAuth()
  const [doubts, setDoubts] = useState<Doubt[]>([])
  const [responses, setResponses] = useState<{ [key: string]: DoubtResponse[] }>({})
  const [loading, setLoading] = useState(true)
  const [selectedFilters, setSelectedFilters] = useState({
    subject: '',
    status: '',
    priority: ''
  })
  const [expandedDoubts, setExpandedDoubts] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadDoubts()
  }, [showMyDoubtsOnly, selectedFilters, refreshTrigger])

  const loadDoubts = () => {
    setLoading(true)
    try {
      const filters: any = {}
      
      if (showMyDoubtsOnly && user) {
        filters.student_id = user.id
      }
      
      if (selectedFilters.subject) filters.subject = selectedFilters.subject
      if (selectedFilters.status) filters.status = selectedFilters.status

      const fetchedDoubts = AIDoubtService.getDoubts(filters)
      
      // Apply priority filter locally
      let filteredDoubts = fetchedDoubts
      if (selectedFilters.priority) {
        filteredDoubts = fetchedDoubts.filter(doubt => doubt.priority === selectedFilters.priority)
      }

      setDoubts(filteredDoubts)

      // Load responses for each doubt
      const responsesMap: { [key: string]: DoubtResponse[] } = {}
      filteredDoubts.forEach(doubt => {
        responsesMap[doubt.id] = AIDoubtService.getDoubtResponses(doubt.id)
      })
      setResponses(responsesMap)
    } catch (error) {
      console.error('Error loading doubts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = (responseId: string, helpful: boolean) => {
    AIDoubtService.voteOnResponse(responseId, helpful)
    loadDoubts() // Refresh to show updated votes
  }

  const toggleDoubtExpansion = (doubtId: string) => {
    const newExpanded = new Set(expandedDoubts)
    if (newExpanded.has(doubtId)) {
      newExpanded.delete(doubtId)
    } else {
      newExpanded.add(doubtId)
    }
    setExpandedDoubts(newExpanded)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'answered':
        return <CheckCircle className="text-green-500" size={16} />
      case 'resolved':
        return <CheckCircle className="text-blue-500" size={16} />
      default:
        return <Clock className="text-yellow-500" size={16} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <MessageCircle className="mr-2" />
          {showMyDoubtsOnly ? 'My Doubts' : 'Recent Doubts'}
        </h3>
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={selectedFilters.subject}
            onChange={(e) => setSelectedFilters(prev => ({ ...prev, subject: e.target.value }))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science</option>
            <option value="English">English</option>
            <option value="History">History</option>
          </select>
          <select
            value={selectedFilters.status}
            onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value }))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="answered">Answered</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {doubts.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 mb-2">
            {showMyDoubtsOnly ? 'You haven\'t submitted any doubts yet' : 'No doubts found'}
          </p>
          <p className="text-sm text-gray-500">
            {showMyDoubtsOnly ? 'Ask your first question to get AI-powered help!' : 'Check back later for new questions'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {doubts.map(doubt => (
            <div key={doubt.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(doubt.status)}
                      <span className="text-sm font-medium text-gray-900 capitalize">{doubt.status}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(doubt.priority)}`}>
                        {doubt.priority} priority
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(doubt.created_at)}</span>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {doubt.question}
                    </h4>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <User size={14} className="mr-1" />
                        {doubt.student_name}
                      </span>
                      <span>{doubt.subject}</span>
                      <span>{doubt.grade_level}</span>
                    </div>

                    {doubt.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doubt.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            <Tag size={10} className="mr-1" />
                            {tag}
                          </span>
                        ))}
                        {doubt.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{doubt.tags.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => toggleDoubtExpansion(doubt.id)}
                    className="ml-4 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    {expandedDoubts.has(doubt.id) ? 'Hide' : 'View'} Responses
                  </button>
                </div>

                {/* Responses */}
                {expandedDoubts.has(doubt.id) && responses[doubt.id] && (
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <h5 className="font-medium text-gray-900 mb-3">
                      Responses ({responses[doubt.id].length})
                    </h5>
                    
                    {responses[doubt.id].length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <Bot className="mx-auto mb-2" size={24} />
                        <p className="text-sm">AI is generating a response...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {responses[doubt.id].map(response => (
                          <div key={response.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {response.response_type === 'ai' ? (
                                  <Bot className="text-blue-500" size={16} />
                                ) : (
                                  <User className="text-green-500" size={16} />
                                )}
                                <span className="text-sm font-medium">
                                  {response.response_type === 'ai' ? 'AI Assistant' : response.responder_name}
                                </span>
                                {response.confidence_score && (
                                  <span className="text-xs text-gray-500">
                                    {Math.round(response.confidence_score * 100)}% confidence
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDate(response.created_at)}
                              </span>
                            </div>
                            
                            <div className="text-gray-700 mb-3 whitespace-pre-line">
                              {response.response}
                            </div>

                            {response.sources && response.sources.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs font-medium text-gray-600 mb-1">Suggested Resources:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {response.sources.map((source, index) => (
                                    <li key={index}>• {source}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleVote(response.id, true)}
                                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                >
                                  <ThumbsUp size={12} />
                                  <span>Helpful ({response.helpful_votes})</span>
                                </button>
                                <button
                                  onClick={() => handleVote(response.id, false)}
                                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                >
                                  <ThumbsDown size={12} />
                                  <span>Not Helpful</span>
                                </button>
                              </div>
                              
                              {response.response_type === 'ai' && (
                                <div className="flex items-center text-xs text-blue-600">
                                  <Bot size={12} className="mr-1" />
                                  AI-Generated
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DoubtsList
