import { supabase } from '../lib/supabase'
import type { Note, Module } from '../lib/supabase'

export class NotesService {
  // Upload a note file
  static async uploadNote(
    file: File,
    noteData: {
      title: string
      description: string
      subject: string
      grade_level: string
      teacher_id: string
      tags: string[]
    }
  ): Promise<Note> {
    try {
      // Check if we're in demo mode
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co'
      const isDemoMode = supabaseUrl.includes('demo')

      if (isDemoMode) {
        // Demo mode - create mock note
        const mockNote: Note = {
          id: `note-${Date.now()}`,
          title: noteData.title,
          description: noteData.description,
          file_url: URL.createObjectURL(file),
          file_type: file.type,
          file_size: file.size,
          teacher_id: noteData.teacher_id,
          subject: noteData.subject,
          grade_level: noteData.grade_level,
          upload_date: new Date().toISOString(),
          downloads: 0,
          tags: noteData.tags
        }

        // Store in localStorage for demo
        const existingNotes = JSON.parse(localStorage.getItem('demo_notes') || '[]')
        existingNotes.push(mockNote)
        localStorage.setItem('demo_notes', JSON.stringify(existingNotes))

        return mockNote
      }

      // Real Supabase upload
      const fileName = `notes/${noteData.teacher_id}/${Date.now()}-${file.name}`
      
      const { data: _uploadData, error: uploadError } = await supabase.storage
        .from('notes')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('notes')
        .getPublicUrl(fileName)

      const noteRecord = {
        title: noteData.title,
        description: noteData.description,
        file_url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        teacher_id: noteData.teacher_id,
        subject: noteData.subject,
        grade_level: noteData.grade_level,
        tags: noteData.tags
      }

      const { data, error } = await supabase
        .from('notes')
        .insert([noteRecord])
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error uploading note:', error)
      throw error
    }
  }

  // Get all notes with optional filters
  static async getNotes(filters?: {
    subject?: string
    grade_level?: string
    teacher_id?: string
    search?: string
  }): Promise<Note[]> {
    try {
      // Check if we're in demo mode
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co'
      const isDemoMode = supabaseUrl.includes('demo')

      if (isDemoMode) {
        // Demo mode - get from localStorage
        let notes = JSON.parse(localStorage.getItem('demo_notes') || '[]')

        // Apply filters
        if (filters) {
          if (filters.subject) {
            notes = notes.filter((note: Note) => note.subject === filters.subject)
          }
          if (filters.grade_level) {
            notes = notes.filter((note: Note) => note.grade_level === filters.grade_level)
          }
          if (filters.teacher_id) {
            notes = notes.filter((note: Note) => note.teacher_id === filters.teacher_id)
          }
          if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            notes = notes.filter((note: Note) => 
              note.title.toLowerCase().includes(searchLower) ||
              note.description.toLowerCase().includes(searchLower) ||
              note.tags.some(tag => tag.toLowerCase().includes(searchLower))
            )
          }
        }

        return notes
      }

      // Real Supabase query
      let query = supabase.from('notes').select('*')

      if (filters) {
        if (filters.subject) query = query.eq('subject', filters.subject)
        if (filters.grade_level) query = query.eq('grade_level', filters.grade_level)
        if (filters.teacher_id) query = query.eq('teacher_id', filters.teacher_id)
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
        }
      }

      const { data, error } = await query.order('upload_date', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching notes:', error)
      throw error
    }
  }

  // Download a note and increment download count
  static async downloadNote(noteId: string): Promise<void> {
    try {
      // Check if we're in demo mode
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co'
      const isDemoMode = supabaseUrl.includes('demo')

      if (isDemoMode) {
        // Demo mode - increment download count in localStorage
        const notes = JSON.parse(localStorage.getItem('demo_notes') || '[]')
        const noteIndex = notes.findIndex((note: Note) => note.id === noteId)
        if (noteIndex !== -1) {
          notes[noteIndex].downloads += 1
          localStorage.setItem('demo_notes', JSON.stringify(notes))
        }
        return
      }

      // Real Supabase update - get current note first
      const { data: currentNote, error: fetchError } = await supabase
        .from('notes')
        .select('downloads')
        .eq('id', noteId)
        .single()

      if (fetchError) throw fetchError

      const { error } = await supabase
        .from('notes')
        .update({ downloads: (currentNote?.downloads || 0) + 1 })
        .eq('id', noteId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating download count:', error)
      throw error
    }
  }

  // Create a module (collection of notes)
  static async createModule(moduleData: {
    title: string
    description: string
    subject: string
    grade_level: string
    teacher_id: string
    note_ids: string[]
  }): Promise<Module> {
    try {
      // Check if we're in demo mode
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co'
      const isDemoMode = supabaseUrl.includes('demo')

      if (isDemoMode) {
        // Demo mode - create mock module
        const notes = JSON.parse(localStorage.getItem('demo_notes') || '[]')
        const moduleNotes = notes.filter((note: Note) => moduleData.note_ids.includes(note.id))

        const mockModule: Module = {
          id: `module-${Date.now()}`,
          title: moduleData.title,
          description: moduleData.description,
          notes: moduleNotes,
          teacher_id: moduleData.teacher_id,
          subject: moduleData.subject,
          grade_level: moduleData.grade_level,
          created_at: new Date().toISOString(),
          is_published: false
        }

        // Store in localStorage for demo
        const existingModules = JSON.parse(localStorage.getItem('demo_modules') || '[]')
        existingModules.push(mockModule)
        localStorage.setItem('demo_modules', JSON.stringify(existingModules))

        return mockModule
      }

      // Real Supabase insert
      const { data, error } = await supabase
        .from('modules')
        .insert([{
          title: moduleData.title,
          description: moduleData.description,
          subject: moduleData.subject,
          grade_level: moduleData.grade_level,
          teacher_id: moduleData.teacher_id,
          note_ids: moduleData.note_ids
        }])
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error creating module:', error)
      throw error
    }
  }

  // Get modules with their notes
  static async getModules(filters?: {
    subject?: string
    grade_level?: string
    teacher_id?: string
  }): Promise<Module[]> {
    try {
      // Check if we're in demo mode
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co'
      const isDemoMode = supabaseUrl.includes('demo')

      if (isDemoMode) {
        // Demo mode - get from localStorage
        let modules = JSON.parse(localStorage.getItem('demo_modules') || '[]')

        // Apply filters
        if (filters) {
          if (filters.subject) {
            modules = modules.filter((module: Module) => module.subject === filters.subject)
          }
          if (filters.grade_level) {
            modules = modules.filter((module: Module) => module.grade_level === filters.grade_level)
          }
          if (filters.teacher_id) {
            modules = modules.filter((module: Module) => module.teacher_id === filters.teacher_id)
          }
        }

        return modules
      }

      // Real Supabase query
      let query = supabase.from('modules').select('*, notes(*)')

      if (filters) {
        if (filters.subject) query = query.eq('subject', filters.subject)
        if (filters.grade_level) query = query.eq('grade_level', filters.grade_level)
        if (filters.teacher_id) query = query.eq('teacher_id', filters.teacher_id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching modules:', error)
      throw error
    }
  }
}
