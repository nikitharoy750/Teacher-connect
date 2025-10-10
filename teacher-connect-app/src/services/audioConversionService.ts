export interface ConversionProgress {
  progress: number
  status: 'initializing' | 'extracting' | 'converting' | 'complete' | 'error'
  message: string
}

export interface AudioConversionResult {
  audioUrl: string
  audioBlob: Blob
  duration: number
  size: number
  format: 'mp3' | 'wav'
}

export class AudioConversionService {
  private static instance: AudioConversionService

  static getInstance(): AudioConversionService {
    if (!AudioConversionService.instance) {
      AudioConversionService.instance = new AudioConversionService()
    }
    return AudioConversionService.instance
  }

  // Convert video to audio using Web Audio API
  async convertVideoToAudio(
    videoFile: File | string,
    onProgress: (progress: ConversionProgress) => void,
    format: 'mp3' | 'wav' = 'mp3'
  ): Promise<AudioConversionResult> {
    try {
      onProgress({
        progress: 0,
        status: 'initializing',
        message: 'Initializing audio conversion...'
      })

      // Check if we're in demo mode
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co'
      const isDemoMode = supabaseUrl.includes('demo')

      if (isDemoMode) {
        // Demo mode - simulate conversion
        return await this.simulateAudioConversion(videoFile, onProgress, format)
      } else {
        // Real conversion using Web Audio API
        return await this.realAudioConversion(videoFile, onProgress, format)
      }
    } catch (error) {
      onProgress({
        progress: 0,
        status: 'error',
        message: `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
      throw error
    }
  }

  // Real audio conversion using Web Audio API
  private async realAudioConversion(
    videoFile: File | string,
    onProgress: (progress: ConversionProgress) => void,
    format: 'mp3' | 'wav'
  ): Promise<AudioConversionResult> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      video.crossOrigin = 'anonymous'
      
      onProgress({
        progress: 10,
        status: 'extracting',
        message: 'Loading video file...'
      })

      video.onloadedmetadata = async () => {
        try {
          onProgress({
            progress: 30,
            status: 'extracting',
            message: 'Extracting audio track...'
          })

          // Create audio context
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const source = audioContext.createMediaElementSource(video)
          const destination = audioContext.createMediaStreamDestination()
          
          source.connect(destination)
          source.connect(audioContext.destination)

          onProgress({
            progress: 50,
            status: 'converting',
            message: 'Converting to audio format...'
          })

          // Create MediaRecorder to capture audio
          const mediaRecorder = new MediaRecorder(destination.stream, {
            mimeType: format === 'mp3' ? 'audio/webm' : 'audio/wav'
          })

          const audioChunks: Blob[] = []

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.push(event.data)
            }
          }

          mediaRecorder.onstop = () => {
            onProgress({
              progress: 90,
              status: 'converting',
              message: 'Finalizing audio file...'
            })

            const audioBlob = new Blob(audioChunks, { 
              type: format === 'mp3' ? 'audio/mp3' : 'audio/wav' 
            })
            const audioUrl = URL.createObjectURL(audioBlob)

            onProgress({
              progress: 100,
              status: 'complete',
              message: 'Audio conversion complete!'
            })

            resolve({
              audioUrl,
              audioBlob,
              duration: video.duration,
              size: audioBlob.size,
              format
            })
          }

          mediaRecorder.onerror = (error) => {
            reject(new Error(`Recording failed: ${error}`))
          }

          // Start recording
          mediaRecorder.start()
          video.play()

          // Stop recording when video ends
          video.onended = () => {
            mediaRecorder.stop()
            audioContext.close()
          }

          onProgress({
            progress: 70,
            status: 'converting',
            message: 'Processing audio stream...'
          })

        } catch (error) {
          reject(error)
        }
      }

      video.onerror = () => {
        reject(new Error('Failed to load video file'))
      }

      // Load video
      if (typeof videoFile === 'string') {
        video.src = videoFile
      } else {
        video.src = URL.createObjectURL(videoFile)
      }
    })
  }

  // Simulate audio conversion for demo mode
  private async simulateAudioConversion(
    _videoFile: File | string,
    onProgress: (progress: ConversionProgress) => void,
    format: 'mp3' | 'wav'
  ): Promise<AudioConversionResult> {
    return new Promise((resolve) => {
      let progress = 0
      // const _totalSteps = 100
      const stepSize = 2

      const simulateStep = () => {
        progress += stepSize + Math.random() * 3

        if (progress <= 20) {
          onProgress({
            progress: Math.min(progress, 20),
            status: 'initializing',
            message: 'Initializing audio extraction...'
          })
        } else if (progress <= 50) {
          onProgress({
            progress: Math.min(progress, 50),
            status: 'extracting',
            message: 'Extracting audio track from video...'
          })
        } else if (progress <= 90) {
          onProgress({
            progress: Math.min(progress, 90),
            status: 'converting',
            message: `Converting to ${format.toUpperCase()} format...`
          })
        } else {
          onProgress({
            progress: 100,
            status: 'complete',
            message: 'Audio conversion complete!'
          })

          // Create a mock audio blob and URL
          const mockAudioData = new Uint8Array(1024 * 100) // 100KB mock audio
          const audioBlob = new Blob([mockAudioData], { 
            type: format === 'mp3' ? 'audio/mp3' : 'audio/wav' 
          })
          const audioUrl = `https://demo-storage.supabase.co/audio/${Date.now()}_converted.${format}`

          resolve({
            audioUrl,
            audioBlob,
            duration: 900, // 15 minutes mock duration
            size: audioBlob.size,
            format
          })
          return
        }

        if (progress < 100) {
          setTimeout(simulateStep, 100 + Math.random() * 200)
        }
      }

      simulateStep()
    })
  }



  // Save converted audio to localStorage (demo mode)
  saveAudioToStorage(videoId: string, audioResult: AudioConversionResult): void {
    const audioData = {
      videoId,
      audioUrl: audioResult.audioUrl,
      duration: audioResult.duration,
      size: audioResult.size,
      format: audioResult.format,
      convertedAt: new Date().toISOString()
    }

    const existingAudios = JSON.parse(localStorage.getItem('converted_audios') || '[]')
    
    // Remove existing audio for this video
    const filteredAudios = existingAudios.filter((audio: any) => audio.videoId !== videoId)
    
    // Add new audio
    filteredAudios.push(audioData)
    
    localStorage.setItem('converted_audios', JSON.stringify(filteredAudios))
  }

  // Get converted audio for a video
  getConvertedAudio(videoId: string): any | null {
    const existingAudios = JSON.parse(localStorage.getItem('converted_audios') || '[]')
    return existingAudios.find((audio: any) => audio.videoId === videoId) || null
  }

  // Get all converted audios for user
  getUserConvertedAudios(userId: string): any[] {
    const existingAudios = JSON.parse(localStorage.getItem('converted_audios') || '[]')
    return existingAudios.filter((audio: any) => audio.userId === userId)
  }

  // Download audio file
  downloadAudio(audioBlob: Blob, filename: string, format: 'mp3' | 'wav'): void {
    const url = URL.createObjectURL(audioBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format duration
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}

// Export singleton instance
export const audioConversionService = AudioConversionService.getInstance()
