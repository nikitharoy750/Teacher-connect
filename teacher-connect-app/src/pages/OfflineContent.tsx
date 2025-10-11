import React, { useState } from 'react'
import { WifiOff, Download, Sparkles, HardDrive } from 'lucide-react'
import OfflineManager from '../components/OfflineManager'
import ContentSummaryComponent from '../components/ContentSummary'

const OfflineContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'offline' | 'summaries'>('offline')

  // Mock data for demonstration
  const mockContent = [
    {
      id: 'video-1',
      title: 'Introduction to Algebra',
      type: 'video' as const,
      subject: 'Mathematics',
      grade: 'Grade 9'
    },
    {
      id: 'note-1',
      title: 'Photosynthesis Process',
      type: 'note' as const,
      subject: 'Biology',
      grade: 'Grade 10'
    },
    {
      id: 'video-2',
      title: 'English Grammar Basics',
      type: 'video' as const,
      subject: 'English',
      grade: 'Grade 8'
    }
  ]

  const tabs = [
    { id: 'offline', label: 'Offline Content', icon: WifiOff },
    { id: 'summaries', label: 'Content Summaries', icon: Sparkles }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <WifiOff className="mr-3" />
            Offline Learning Hub
          </h1>
          <p className="mt-2 text-gray-600">
            Access your downloaded content and AI-generated summaries even without internet connection
          </p>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          {navigator.onLine ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-green-800 font-medium">You're online</p>
                  <p className="text-green-700 text-sm">
                    Perfect time to download content for offline access
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-orange-800 font-medium">You're offline</p>
                  <p className="text-orange-700 text-sm">
                    You can still access your downloaded content and summaries
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

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
          {activeTab === 'offline' && (
            <div>
              <OfflineManager />
            </div>
          )}

          {activeTab === 'summaries' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Sparkles className="mr-2" />
                  AI-Generated Content Summaries
                </h3>
                <p className="text-gray-600 mb-6">
                  Quick overviews and key points from your educational content, powered by AI
                </p>

                {mockContent.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-600 mb-2">No summaries available</p>
                    <p className="text-sm text-gray-500">
                      Generate summaries from videos and notes in your library
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockContent.map(content => (
                      <ContentSummaryComponent
                        key={content.id}
                        contentId={content.id}
                        contentTitle={content.title}
                        contentType={content.type}
                        showDownloadOption={true}
                        onDownload={() => {
                          alert(`Downloading ${content.title} for offline access...`)
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Download className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Downloaded Items</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Sparkles className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Summaries</p>
                <p className="text-2xl font-semibold text-gray-900">{mockContent.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <HardDrive className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-2xl font-semibold text-gray-900">0 MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <h3 className="text-xl font-semibold mb-4">💡 Offline Learning Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">For Students:</h4>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• Download content before traveling to areas with poor connectivity</li>
                <li>• Use AI summaries for quick review sessions</li>
                <li>• Access key points even when offline</li>
                <li>• Save mobile data by downloading on WiFi</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Best Practices:</h4>
              <ul className="text-sm space-y-1 opacity-90">
                <li>• Regularly clean up old downloads to save space</li>
                <li>• Generate summaries for better retention</li>
                <li>• Download content for upcoming lessons</li>
                <li>• Use offline mode during exams for distraction-free study</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OfflineContent
