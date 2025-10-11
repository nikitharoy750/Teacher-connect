import React, { useState, useEffect } from 'react'
import { Search, Download, FileText, Filter, Tag, Calendar } from 'lucide-react'
import { NotesService } from '../services/notesService'
import type { Note } from '../lib/supabase'

interface NotesLibraryProps {
  teacherMode?: boolean
  teacherId?: string
}

const NotesLibrary: React.FC<NotesLibraryProps> = ({ teacherMode = false, teacherId }) => {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const subjects = [
    'Mathematics', 'Science', 'English', 'History', 'Geography',
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art'
  ]

  const gradeLevels = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12'
  ]

  useEffect(() => {
    loadNotes()
  }, [searchTerm, selectedSubject, selectedGrade, teacherId])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const filters: any = {}
      
      if (searchTerm) filters.search = searchTerm
      if (selectedSubject) filters.subject = selectedSubject
      if (selectedGrade) filters.grade_level = selectedGrade
      if (teacherMode && teacherId) filters.teacher_id = teacherId

      const fetchedNotes = await NotesService.getNotes(filters)
      setNotes(fetchedNotes)
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (note: Note) => {
    try {
      // Increment download count
      await NotesService.downloadNote(note.id)
      
      // Create download link
      const link = document.createElement('a')
      link.href = note.file_url
      link.download = note.title
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Update local state
      setNotes(prev => prev.map(n => 
        n.id === note.id ? { ...n, downloads: n.downloads + 1 } : n
      ))
    } catch (error) {
      console.error('Error downloading note:', error)
      alert('Failed to download note. Please try again.')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word')) return '📝'
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊'
    return '📄'
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
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold flex items-center">
          <FileText className="mr-2" />
          {teacherMode ? 'My Notes' : 'Study Notes Library'}
        </h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          <Filter size={16} className="mr-1" />
          Filters
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search notes by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Grades</option>
                {gradeLevels.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">No notes found matching your criteria.</p>
          {teacherMode && (
            <p className="text-sm text-gray-500 mt-2">Upload your first note to get started!</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{getFileIcon(note.file_type)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 line-clamp-2">{note.title}</h4>
                    <p className="text-sm text-gray-600">{note.subject} • {note.grade_level}</p>
                  </div>
                </div>
              </div>

              {note.description && (
                <p className="text-sm text-gray-700 mb-3 line-clamp-3">{note.description}</p>
              )}

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {note.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      <Tag size={10} className="mr-1" />
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{note.tags.length - 3} more</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {new Date(note.upload_date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Download size={14} className="mr-1" />
                  {note.downloads}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{formatFileSize(note.file_size)}</span>
                <button
                  onClick={() => handleDownload(note)}
                  className="flex items-center px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                >
                  <Download size={14} className="mr-1" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotesLibrary
