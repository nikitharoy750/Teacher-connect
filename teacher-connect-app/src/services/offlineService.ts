import type { Video, Note } from '../lib/supabase'

export interface OfflineContent {
  id: string
  type: 'video' | 'note' | 'audio'
  title: string
  description: string
  file_url: string
  file_size: number
  downloaded_at: string
  last_accessed: string
  summary?: string
}

export interface ContentSummary {
  id: string
  content_id: string
  content_type: 'video' | 'note'
  summary: string
  key_points: string[]
  duration_minutes?: number
  created_at: string
}

export class OfflineService {
  private static readonly STORAGE_KEY = 'offline_content'
  private static readonly SUMMARIES_KEY = 'content_summaries'
  private static readonly MAX_STORAGE_SIZE = 500 * 1024 * 1024 // 500MB limit

  // Check if browser supports offline storage
  static isOfflineSupported(): boolean {
    return 'serviceWorker' in navigator && 'caches' in window && 'indexedDB' in window
  }

  // Get current storage usage
  static async getStorageUsage(): Promise<{ used: number; available: number }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        return {
          used: estimate.usage || 0,
          available: estimate.quota || this.MAX_STORAGE_SIZE
        }
      }
    } catch (error) {
      console.error('Error getting storage estimate:', error)
    }
    
    // Fallback to localStorage size estimation
    const offlineContent = this.getOfflineContent()
    const estimatedSize = JSON.stringify(offlineContent).length * 2 // Rough estimate
    
    return {
      used: estimatedSize,
      available: this.MAX_STORAGE_SIZE
    }
  }

  // Download content for offline access
  static async downloadForOffline(
    content: Video | Note,
    type: 'video' | 'note'
  ): Promise<void> {
    try {
      if (!this.isOfflineSupported()) {
        throw new Error('Offline storage is not supported in this browser')
      }

      const { used, available } = await this.getStorageUsage()
      const estimatedContentSize = type === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024 // Rough estimates

      if (used + estimatedContentSize > available) {
        throw new Error('Not enough storage space available')
      }

      // Create offline content record
      const offlineContent: OfflineContent = {
        id: content.id,
        type,
        title: content.title,
        description: content.description,
        file_url: content.file_url,
        file_size: type === 'video' ? (content as Video).duration * 1000 : (content as Note).file_size,
        downloaded_at: new Date().toISOString(),
        last_accessed: new Date().toISOString()
      }

      // In a real implementation, you would:
      // 1. Use Service Worker to cache the actual file
      // 2. Store metadata in IndexedDB
      // For demo purposes, we'll just store metadata in localStorage

      const existingContent = this.getOfflineContent()
      const updatedContent = [...existingContent.filter(c => c.id !== content.id), offlineContent]
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedContent))

      // Generate summary for the content
      await this.generateSummary(content, type)

    } catch (error) {
      console.error('Error downloading content for offline:', error)
      throw error
    }
  }

  // Get all offline content
  static getOfflineContent(): OfflineContent[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error getting offline content:', error)
      return []
    }
  }

  // Remove content from offline storage
  static removeOfflineContent(contentId: string): void {
    try {
      const existingContent = this.getOfflineContent()
      const updatedContent = existingContent.filter(c => c.id !== contentId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedContent))

      // Also remove summary
      const summaries = this.getContentSummaries()
      const updatedSummaries = summaries.filter(s => s.content_id !== contentId)
      localStorage.setItem(this.SUMMARIES_KEY, JSON.stringify(updatedSummaries))
    } catch (error) {
      console.error('Error removing offline content:', error)
    }
  }

  // Check if content is available offline
  static isContentOffline(contentId: string): boolean {
    const offlineContent = this.getOfflineContent()
    return offlineContent.some(c => c.id === contentId)
  }

  // Update last accessed time
  static updateLastAccessed(contentId: string): void {
    try {
      const offlineContent = this.getOfflineContent()
      const updatedContent = offlineContent.map(c => 
        c.id === contentId 
          ? { ...c, last_accessed: new Date().toISOString() }
          : c
      )
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedContent))
    } catch (error) {
      console.error('Error updating last accessed:', error)
    }
  }

  // Generate AI-powered summary (mock implementation)
  static async generateSummary(
    content: Video | Note,
    type: 'video' | 'note'
  ): Promise<ContentSummary> {
    try {
      // In a real implementation, this would call an AI service
      // For demo purposes, we'll generate a mock summary
      
      const mockSummary: ContentSummary = {
        id: `summary-${content.id}`,
        content_id: content.id,
        content_type: type,
        summary: this.generateMockSummary(content.title, content.description),
        key_points: this.generateMockKeyPoints(content.title, type),
        duration_minutes: type === 'video' ? Math.ceil((content as Video).duration / 60) : undefined,
        created_at: new Date().toISOString()
      }

      // Store summary
      const existingSummaries = this.getContentSummaries()
      const updatedSummaries = [...existingSummaries.filter(s => s.content_id !== content.id), mockSummary]
      localStorage.setItem(this.SUMMARIES_KEY, JSON.stringify(updatedSummaries))

      return mockSummary
    } catch (error) {
      console.error('Error generating summary:', error)
      throw error
    }
  }

  // Get content summaries
  static getContentSummaries(): ContentSummary[] {
    try {
      const stored = localStorage.getItem(this.SUMMARIES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error getting content summaries:', error)
      return []
    }
  }

  // Get summary for specific content
  static getContentSummary(contentId: string): ContentSummary | null {
    const summaries = this.getContentSummaries()
    return summaries.find(s => s.content_id === contentId) || null
  }

  // Clean up old offline content (remove least recently accessed)
  static cleanupOldContent(maxItems: number = 50): void {
    try {
      const offlineContent = this.getOfflineContent()
      
      if (offlineContent.length <= maxItems) return

      // Sort by last accessed (oldest first)
      const sortedContent = offlineContent.sort((a, b) => 
        new Date(a.last_accessed).getTime() - new Date(b.last_accessed).getTime()
      )

      // Keep only the most recent items
      const contentToKeep = sortedContent.slice(-maxItems)
      const contentToRemove = sortedContent.slice(0, -maxItems)

      // Remove old content and summaries
      contentToRemove.forEach(content => {
        this.removeOfflineContent(content.id)
      })

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contentToKeep))
    } catch (error) {
      console.error('Error cleaning up old content:', error)
    }
  }

  // Helper method to generate mock summary
  private static generateMockSummary(title: string, description: string): string {
    const summaryTemplates = [
      `This content covers ${title.toLowerCase()} with focus on key concepts and practical applications. ${description || 'Essential learning material for students.'}`,
      `An educational resource about ${title.toLowerCase()} that provides comprehensive coverage of the topic. ${description || 'Includes important concepts and examples.'}`,
      `Study material on ${title.toLowerCase()} designed to help students understand fundamental principles. ${description || 'Contains detailed explanations and practice exercises.'}`
    ]
    
    return summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)]
  }

  // Helper method to generate mock key points
  private static generateMockKeyPoints(title: string, type: 'video' | 'note'): string[] {
    const basePoints = [
      `Introduction to ${title.toLowerCase()}`,
      'Key concepts and definitions',
      'Practical examples and applications',
      'Important formulas and methods'
    ]

    if (type === 'video') {
      basePoints.push('Visual demonstrations', 'Step-by-step explanations')
    } else {
      basePoints.push('Detailed notes and references', 'Practice problems')
    }

    return basePoints.slice(0, 4) // Return 4 key points
  }
}
