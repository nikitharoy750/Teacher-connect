import React, { useState } from 'react'
import { FileText, BookOpen, Upload, Library } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import NotesUpload from '../components/NotesUpload'
import NotesLibrary from '../components/NotesLibrary'

const NotesAndModules: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'browse' | 'upload' | 'modules'>('browse')

  const tabs = [
    { id: 'browse', label: 'Browse Notes', icon: Library },
    ...(user?.role === 'teacher' ? [
      { id: 'upload', label: 'Upload Notes', icon: Upload },
      { id: 'modules', label: 'My Modules', icon: BookOpen }
    ] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-3" />
            Notes & Study Materials
          </h1>
          <p className="mt-2 text-gray-600">
            Access comprehensive study materials, lecture notes, and educational resources
          </p>
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
          {activeTab === 'browse' && (
            <div>
              <NotesLibrary />
            </div>
          )}

          {activeTab === 'upload' && user?.role === 'teacher' && (
            <div>
              <NotesUpload onUploadComplete={() => setActiveTab('browse')} />
            </div>
          )}

          {activeTab === 'modules' && user?.role === 'teacher' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <BookOpen className="mr-2" />
                Educational Modules
              </h3>
              <div className="text-center py-12">
                <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600 mb-4">Module creation feature coming soon!</p>
                <p className="text-sm text-gray-500">
                  You'll be able to organize your notes into structured learning modules.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats for Teachers */}
        {user?.role === 'teacher' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="text-blue-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Notes</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <BookOpen className="text-green-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Modules Created</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Library className="text-purple-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Quick Access */}
        {user?.role === 'student' && (
          <div className="mt-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Quick Access</h3>
              <p className="mb-4">Find study materials for your current subjects</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Mathematics', 'Science', 'English', 'History'].map(subject => (
                  <button
                    key={subject}
                    onClick={() => {
                      // This would filter by subject
                      setActiveTab('browse')
                    }}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md p-3 text-center transition-colors"
                  >
                    <FileText className="mx-auto mb-1" size={20} />
                    <span className="text-sm">{subject}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotesAndModules
