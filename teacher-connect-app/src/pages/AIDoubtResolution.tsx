import React, { useState } from 'react'
import { MessageCircle, Bot, Users, TrendingUp, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import DoubtSubmission from '../components/DoubtSubmission'
import DoubtsList from '../components/DoubtsList'

const AIDoubtResolution: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'ask' | 'my-doubts' | 'browse'>('ask')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const tabs = [
    { id: 'ask', label: 'Ask Question', icon: MessageCircle },
    { id: 'my-doubts', label: 'My Doubts', icon: Users },
    { id: 'browse', label: 'Browse All', icon: TrendingUp }
  ]

  const handleSubmitSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
    setActiveTab('my-doubts')
  }

  return (
    <div className="min-h-screen bg-dark-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-50 flex items-center">
            <Bot className="mr-3 text-blue-500" />
            AI Doubt Resolution
          </h1>
          <p className="mt-2 text-gray-300">
            Get instant, intelligent answers to your academic questions powered by AI
          </p>
        </div>

        {/* AI Features Banner */}
        <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center mb-4">
            <Bot className="mr-3" size={32} />
            <div>
              <h2 className="text-xl font-semibold">Intelligent Learning Assistant</h2>
              <p className="opacity-90">Advanced AI technology to help you learn better</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-medium mb-2">🧠 Smart Analysis</h3>
              <p className="text-sm opacity-90">AI analyzes your question to understand context and difficulty level</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-medium mb-2">⚡ Instant Responses</h3>
              <p className="text-sm opacity-90">Get detailed explanations and step-by-step solutions immediately</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="font-medium mb-2">📚 Personalized Learning</h3>
              <p className="text-sm opacity-90">Receive customized resources and recommendations</p>
            </div>
          </div>
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
          {activeTab === 'ask' && (
            <div>
              <DoubtSubmission onSubmitSuccess={handleSubmitSuccess} />
            </div>
          )}

          {activeTab === 'my-doubts' && (
            <div>
              <DoubtsList showMyDoubtsOnly={true} refreshTrigger={refreshTrigger} />
            </div>
          )}

          {activeTab === 'browse' && (
            <div>
              <DoubtsList showMyDoubtsOnly={false} refreshTrigger={refreshTrigger} />
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <MessageCircle className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Questions Asked</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Bot className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Responses</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-semibold text-gray-900">2s</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="text-yellow-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-semibold text-gray-900">95%</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-6 text-center">How AI Doubt Resolution Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-medium mb-2">Ask Your Question</h4>
              <p className="text-sm text-gray-600">Submit your doubt with context and subject details</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h4 className="font-medium mb-2">AI Analysis</h4>
              <p className="text-sm text-gray-600">Our AI analyzes your question and identifies key concepts</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h4 className="font-medium mb-2">Generate Response</h4>
              <p className="text-sm text-gray-600">Get detailed explanations with step-by-step solutions</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-600">4</span>
              </div>
              <h4 className="font-medium mb-2">Learn & Practice</h4>
              <p className="text-sm text-gray-600">Use provided resources and practice similar problems</p>
            </div>
          </div>
        </div>

        {/* Tips for Students */}
        {user?.role === 'student' && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">💡 Tips for Better Learning</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-green-800 mb-2">Before Asking:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Try to solve the problem yourself first</li>
                  <li>• Review your notes and textbook</li>
                  <li>• Identify exactly what you don't understand</li>
                  <li>• Gather all relevant information</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-800 mb-2">After Getting Answers:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Read the explanation carefully</li>
                  <li>• Practice with similar problems</li>
                  <li>• Use suggested resources for deeper learning</li>
                  <li>• Ask follow-up questions if needed</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIDoubtResolution
