import { supabase } from '../lib/supabase'

export interface VideoUploadData {
  file: File
  title: string
  description: string
  subject: string
  gradeLevel: string
  thumbnail?: File
}

export interface UploadProgress {
  progress: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
  message: string
}

export class VideoUploadService {
  private static instance: VideoUploadService
  private uploadCallbacks: Map<string, (progress: UploadProgress) => void> = new Map()

  static getInstance(): VideoUploadService {
    if (!VideoUploadService.instance) {
      VideoUploadService.instance = new VideoUploadService()
    }
    return VideoUploadService.instance
  }

  // Generate unique filename
  private generateFileName(originalName: string, userId: string): string {
    const timestamp = Date.now()
    const extension = originalName.split('.').pop()
    const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
    return `${userId}/${timestamp}_${cleanName}`
  }

  // Get video duration
  private getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        resolve(video.duration)
      }
      
      video.onerror = () => {
        resolve(0) // Default duration if can't be determined
      }
      
      video.src = URL.createObjectURL(file)
    })
  }

  // Generate video thumbnail
  private generateThumbnail(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        // Seek to 10% of video duration for thumbnail
        video.currentTime = video.duration * 0.1
      }
      
      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to generate thumbnail'))
            }
          }, 'image/jpeg', 0.8)
        }
      }
      
      video.onerror = () => reject(new Error('Failed to load video'))
      video.src = URL.createObjectURL(file)
    })
  }

  // Simulate file upload with progress (for demo without real Supabase)
  private simulateUpload(
    file: File,
    onProgress: (progress: UploadProgress) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let progress = 0
      const totalSize = file.size
      const chunkSize = totalSize / 20 // Simulate 20 chunks
      
      const uploadChunk = () => {
        progress += chunkSize
        const percentage = Math.min((progress / totalSize) * 100, 100)
        
        onProgress({
          progress: percentage,
          status: percentage < 100 ? 'uploading' : 'processing',
          message: percentage < 100 
            ? `Uploading... ${Math.round(percentage)}%`
            : 'Processing video...'
        })
        
        if (percentage < 100) {
          setTimeout(uploadChunk, 100 + Math.random() * 200) // Random delay
        } else {
          // Simulate processing time
          setTimeout(() => {
            onProgress({
              progress: 100,
              status: 'complete',
              message: 'Upload complete!'
            })
            
            // Return a mock URL (in real implementation, this would be the Supabase URL)
            const mockUrl = `https://demo-storage.supabase.co/videos/${Date.now()}_${file.name}`
            resolve(mockUrl)
          }, 1000)
        }
      }
      
      uploadChunk()
    })
  }

  // Real Supabase upload (when you have real credentials)
  private async uploadToSupabase(
    file: File,
    fileName: string,
    onProgress: (progress: UploadProgress) => void
  ): Promise<string> {
    try {
      onProgress({
        progress: 0,
        status: 'uploading',
        message: 'Starting upload...'
      })

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw error
      }

      onProgress({
        progress: 90,
        status: 'processing',
        message: 'Processing video...'
      })

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName)

      onProgress({
        progress: 100,
        status: 'complete',
        message: 'Upload complete!'
      })

      return urlData.publicUrl
    } catch (error) {
      onProgress({
        progress: 0,
        status: 'error',
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
      throw error
    }
  }

  // Main upload method
  async uploadVideo(
    videoData: VideoUploadData,
    userId: string,
    onProgress: (progress: UploadProgress) => void
  ): Promise<{
    videoUrl: string
    thumbnailUrl?: string
    duration: number
    videoId: string
  }> {
    try {
      const uploadId = `upload_${Date.now()}`
      this.uploadCallbacks.set(uploadId, onProgress)

      // Get video duration
      const duration = await this.getVideoDuration(videoData.file)

      // Generate filename
      const videoFileName = this.generateFileName(videoData.file.name, userId)
      
      // Check if we have real Supabase credentials
      const hasRealSupabase = !supabase.supabaseUrl.includes('demo')

      let videoUrl: string
      let thumbnailUrl: string | undefined

      if (hasRealSupabase) {
        // Real Supabase upload
        videoUrl = await this.uploadToSupabase(videoData.file, videoFileName, onProgress)
        
        // Upload thumbnail if provided or generate one
        if (videoData.thumbnail) {
          const thumbnailFileName = this.generateFileName(
            `thumbnail_${videoData.thumbnail.name}`,
            userId
          )
          const { data: thumbData } = await supabase.storage
            .from('thumbnails')
            .upload(thumbnailFileName, videoData.thumbnail)
          
          if (thumbData) {
            const { data: thumbUrlData } = supabase.storage
              .from('thumbnails')
              .getPublicUrl(thumbnailFileName)
            thumbnailUrl = thumbUrlData.publicUrl
          }
        } else {
          // Generate thumbnail from video
          try {
            const thumbnailBlob = await this.generateThumbnail(videoData.file)
            const thumbnailFileName = this.generateFileName(
              `auto_thumbnail_${videoData.file.name}.jpg`,
              userId
            )
            const { data: thumbData } = await supabase.storage
              .from('thumbnails')
              .upload(thumbnailFileName, thumbnailBlob)
            
            if (thumbData) {
              const { data: thumbUrlData } = supabase.storage
                .from('thumbnails')
                .getPublicUrl(thumbnailFileName)
              thumbnailUrl = thumbUrlData.publicUrl
            }
          } catch (error) {
            console.warn('Failed to generate thumbnail:', error)
          }
        }
      } else {
        // Demo mode - simulate upload
        videoUrl = await this.simulateUpload(videoData.file, onProgress)
        thumbnailUrl = `https://demo-storage.supabase.co/thumbnails/${Date.now()}_thumbnail.jpg`
      }

      // Save video metadata to database
      const videoRecord = {
        title: videoData.title,
        description: videoData.description,
        file_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        teacher_id: userId,
        subject: videoData.subject,
        grade_level: videoData.gradeLevel,
        duration: Math.round(duration),
        upload_date: new Date().toISOString(),
        upvotes: 0,
        views: 0
      }

      if (hasRealSupabase) {
        const { data: insertData, error: insertError } = await supabase
          .from('videos')
          .insert([videoRecord])
          .select()
          .single()

        if (insertError) {
          throw insertError
        }

        return {
          videoUrl,
          thumbnailUrl,
          duration: Math.round(duration),
          videoId: insertData.id
        }
      } else {
        // Demo mode - store in localStorage
        const videos = JSON.parse(localStorage.getItem('demo_videos') || '[]')
        const videoId = `video_${Date.now()}`
        videos.push({ ...videoRecord, id: videoId })
        localStorage.setItem('demo_videos', JSON.stringify(videos))

        return {
          videoUrl,
          thumbnailUrl,
          duration: Math.round(duration),
          videoId
        }
      }
    } catch (error) {
      onProgress({
        progress: 0,
        status: 'error',
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
      throw error
    }
  }

  // Get uploaded videos for a teacher
  async getTeacherVideos(teacherId: string): Promise<any[]> {
    const hasRealSupabase = !supabase.supabaseUrl.includes('demo')

    if (hasRealSupabase) {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('upload_date', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } else {
      // Demo mode - get from localStorage
      const videos = JSON.parse(localStorage.getItem('demo_videos') || '[]')
      return videos.filter((video: any) => video.teacher_id === teacherId)
    }
  }

  // Delete video
  async deleteVideo(videoId: string, userId: string): Promise<void> {
    const hasRealSupabase = !supabase.supabaseUrl.includes('demo')

    if (hasRealSupabase) {
      // Delete from database
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)
        .eq('teacher_id', userId)

      if (error) {
        throw error
      }

      // TODO: Also delete files from storage
    } else {
      // Demo mode - remove from localStorage
      const videos = JSON.parse(localStorage.getItem('demo_videos') || '[]')
      const filteredVideos = videos.filter((video: any) => 
        !(video.id === videoId && video.teacher_id === userId)
      )
      localStorage.setItem('demo_videos', JSON.stringify(filteredVideos))
    }
  }
}

export const videoUploadService = VideoUploadService.getInstance()
