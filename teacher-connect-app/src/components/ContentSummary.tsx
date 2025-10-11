import React, { useState, useEffect } from 'react'
import { FileText, Clock, Lightbulb, Download, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { OfflineService, type ContentSummary } from '../services/offlineService'

interface ContentSummaryProps {
  contentId: string
  contentTitle: string
  contentType: 'video' | 'note'
  showDownloadOption?: boolean
  onDownload?: () => void
}

const ContentSummaryComponent: React.FC<ContentSummaryProps> = ({
  contentId,
  contentTitle,
  contentType,
  showDownloadOption = false,
  onDownload
}) => {
  const [summary, setSummary] = useState<ContentSummary | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    loadSummary()
  }, [contentId])

  const loadSummary = () => {
    const existingSummary = OfflineService.getContentSummary(contentId)
    setSummary(existingSummary)
  }

  const generateSummary = async () => {
    setIsGenerating(true)
    try {
      // Mock content object for summary generation
      const mockContent = {
        id: contentId,
        title: contentTitle,
        description: `Educational content about ${contentTitle}`,
        file_url: '',
        ...(contentType === 'video' ? { duration: 600 } : { file_size: 1024 * 1024 })
      }

      const newSummary = await OfflineService.generateSummary(mockContent as any, contentType)
      setSummary(newSummary)
    } catch (error) {
      console.error('Error generating summary:', error)
      alert('Failed to generate summary. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (!summary && !isGenerating) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="text-blue-500 mr-2" size={20} />
            <div>
              <h4 className="font-medium text-gray-900">AI Summary Available</h4>
              <p className="text-sm text-gray-600">
                Get a quick overview of this {contentType} content
              </p>
            </div>
          </div>
          <button
            onClick={generateSummary}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Generate Summary
          </button>
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="text-gray-600">Generating AI summary...</span>
        </div>
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div 
        className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 cursor-pointer hover:from-blue-100 hover:to-purple-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="text-blue-500 mr-2" size={20} />
            <div>
              <h4 className="font-medium text-gray-900">AI-Generated Summary</h4>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span className="flex items-center">
                  <FileText size={12} className="mr-1" />
                  {contentType === 'video' ? 'Video' : 'Document'}
                </span>
                {summary.duration_minutes && (
                  <span className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    {summary.duration_minutes} min
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  Generated {new Date(summary.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {showDownloadOption && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDownload?.()
                }}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                title="Download for offline access"
              >
                <Download size={16} />
              </button>
            )}
            {isExpanded ? (
              <ChevronUp className="text-gray-400" size={20} />
            ) : (
              <ChevronDown className="text-gray-400" size={20} />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Summary Text */}
          <div>
            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
              <FileText size={16} className="mr-1" />
              Summary
            </h5>
            <p className="text-gray-700 leading-relaxed">
              {summary.summary}
            </p>
          </div>

          {/* Key Points */}
          <div>
            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
              <Lightbulb size={16} className="mr-1" />
              Key Points
            </h5>
            <ul className="space-y-2">
              {summary.key_points.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Study Tips */}
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <h6 className="font-medium text-yellow-800 mb-1 flex items-center">
              <Lightbulb size={14} className="mr-1" />
              Study Tips
            </h6>
            <ul className="text-sm text-yellow-700 space-y-1">
              {contentType === 'video' ? (
                <>
                  <li>• Take notes while watching to reinforce learning</li>
                  <li>• Pause and replay difficult sections</li>
                  <li>• Practice the concepts shown in examples</li>
                </>
              ) : (
                <>
                  <li>• Read through the entire document first</li>
                  <li>• Highlight important concepts and formulas</li>
                  <li>• Create your own summary notes</li>
                </>
              )}
              <li>• Review the key points regularly</li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Summary generated using AI • {summary.key_points.length} key points identified
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  // Copy summary to clipboard
                  const summaryText = `${summary.summary}\n\nKey Points:\n${summary.key_points.map(p => `• ${p}`).join('\n')}`
                  navigator.clipboard.writeText(summaryText)
                  alert('Summary copied to clipboard!')
                }}
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
              >
                Copy Summary
              </button>
              {showDownloadOption && (
                <button
                  onClick={onDownload}
                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                >
                  Download Content
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentSummaryComponent
