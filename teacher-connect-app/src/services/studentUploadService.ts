export interface StudentUpload {
  id: string
  studentId: string
  title: string
  description: string
  subject: string
  gradeLevel: string
  videoUrl: string
  thumbnailUrl: string
  duration: string
  fileSize: number
  uploadDate: string
  status: 'pending' | 'approved' | 'rejected' | 'under_review'
  moderatorNotes?: string
  creditsEarned: number
  views: number
  likes: number
  qualityScore: number
  tags: string[]
  studentName: string
  studentAvatar: string
}

export interface CreditTransaction {
  id: string
  studentId: string
  type: 'upload' | 'approval' | 'quality_bonus' | 'view_bonus' | 'like_bonus'
  amount: number
  description: string
  uploadId?: string
  timestamp: string
}

export interface UploadGuidelines {
  maxFileSize: number // in MB
  allowedFormats: string[]
  minDuration: number // in seconds
  maxDuration: number // in seconds
  qualityCriteria: string[]
  creditRates: {
    baseUpload: number
    approval: number
    qualityBonus: number
    viewBonus: number // per 100 views
    likeBonus: number // per like
  }
}

class StudentUploadService {
  private static instance: StudentUploadService

  static getInstance(): StudentUploadService {
    if (!StudentUploadService.instance) {
      StudentUploadService.instance = new StudentUploadService()
    }
    return StudentUploadService.instance
  }

  // Get upload guidelines
  getUploadGuidelines(): UploadGuidelines {
    return {
      maxFileSize: 500, // 500MB
      allowedFormats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
      minDuration: 60, // 1 minute
      maxDuration: 3600, // 1 hour
      qualityCriteria: [
        'Clear audio quality',
        'Good video resolution (720p minimum)',
        'Educational content relevant to subject',
        'Proper explanation and structure',
        'No inappropriate content',
        'Original content (not copied)'
      ],
      creditRates: {
        baseUpload: 10,
        approval: 50,
        qualityBonus: 25,
        viewBonus: 5, // per 100 views
        likeBonus: 2 // per like
      }
    }
  }

  // Submit student upload
  async submitUpload(
    studentId: string,
    uploadData: Omit<StudentUpload, 'id' | 'studentId' | 'uploadDate' | 'status' | 'creditsEarned' | 'views' | 'likes' | 'qualityScore' | 'studentName' | 'studentAvatar'>,
    file: File,
    onProgress: (progress: number) => void
  ): Promise<StudentUpload> {
    // Check if we're in demo mode
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co'
    const isDemoMode = supabaseUrl.includes('demo')

    if (isDemoMode) {
      return await this.simulateUpload(studentId, uploadData, file, onProgress)
    } else {
      return await this.realUpload(studentId, uploadData, file, onProgress)
    }
  }

  // Simulate upload for demo mode
  private async simulateUpload(
    studentId: string,
    uploadData: Omit<StudentUpload, 'id' | 'studentId' | 'uploadDate' | 'status' | 'creditsEarned' | 'views' | 'likes' | 'qualityScore' | 'studentName' | 'studentAvatar'>,
    file: File,
    onProgress: (progress: number) => void
  ): Promise<StudentUpload> {
    return new Promise((resolve) => {
      let progress = 0
      const totalSteps = 100
      const stepSize = 5

      const simulateStep = () => {
        progress += stepSize + Math.random() * 5
        progress = Math.min(progress, 100)
        onProgress(progress)

        if (progress >= 100) {
          // Create the upload record
          const upload: StudentUpload = {
            id: `student-upload-${Date.now()}`,
            studentId,
            ...uploadData,
            videoUrl: `https://demo-storage.supabase.co/student-videos/${Date.now()}.mp4`,
            thumbnailUrl: this.generateThumbnail(),
            duration: this.getVideoDuration(file),
            fileSize: file.size,
            uploadDate: new Date().toISOString(),
            status: 'pending',
            creditsEarned: this.getUploadGuidelines().creditRates.baseUpload,
            views: 0,
            likes: 0,
            qualityScore: 0,
            studentName: this.getStudentName(studentId),
            studentAvatar: this.getStudentAvatar(studentId)
          }

          // Save to localStorage
          this.saveUploadToStorage(upload)
          
          // Award initial credits
          this.awardCredits(studentId, 'upload', this.getUploadGuidelines().creditRates.baseUpload, 'Video upload submitted', upload.id)

          resolve(upload)
        } else {
          setTimeout(simulateStep, 100 + Math.random() * 200)
        }
      }

      simulateStep()
    })
  }

  // Real upload implementation (placeholder)
  private async realUpload(
    studentId: string,
    uploadData: Omit<StudentUpload, 'id' | 'studentId' | 'uploadDate' | 'status' | 'creditsEarned' | 'views' | 'likes' | 'qualityScore' | 'studentName' | 'studentAvatar'>,
    file: File,
    onProgress: (progress: number) => void
  ): Promise<StudentUpload> {
    // This would integrate with real Supabase storage and database
    // For now, fall back to demo mode
    return this.simulateUpload(studentId, uploadData, file, onProgress)
  }

  // Get student uploads
  getStudentUploads(studentId: string): StudentUpload[] {
    const uploads = JSON.parse(localStorage.getItem('student_uploads') || '[]')
    return uploads.filter((upload: StudentUpload) => upload.studentId === studentId)
  }

  // Get all uploads for moderation
  getAllUploads(): StudentUpload[] {
    return JSON.parse(localStorage.getItem('student_uploads') || '[]')
  }

  // Get uploads by status
  getUploadsByStatus(status: StudentUpload['status']): StudentUpload[] {
    const uploads = this.getAllUploads()
    return uploads.filter(upload => upload.status === status)
  }

  // Moderate upload (approve/reject)
  moderateUpload(uploadId: string, status: 'approved' | 'rejected', moderatorNotes?: string): StudentUpload | null {
    const uploads = this.getAllUploads()
    const uploadIndex = uploads.findIndex((upload: StudentUpload) => upload.id === uploadId)
    
    if (uploadIndex === -1) return null

    const upload = uploads[uploadIndex]
    upload.status = status
    upload.moderatorNotes = moderatorNotes

    if (status === 'approved') {
      // Award approval credits
      const approvalCredits = this.getUploadGuidelines().creditRates.approval
      upload.creditsEarned += approvalCredits
      this.awardCredits(upload.studentId, 'approval', approvalCredits, 'Video approved by moderator', uploadId)
      
      // Calculate quality score and bonus
      const qualityScore = this.calculateQualityScore(upload)
      upload.qualityScore = qualityScore
      
      if (qualityScore >= 80) {
        const qualityBonus = this.getUploadGuidelines().creditRates.qualityBonus
        upload.creditsEarned += qualityBonus
        this.awardCredits(upload.studentId, 'quality_bonus', qualityBonus, 'High quality content bonus', uploadId)
      }
    }

    uploads[uploadIndex] = upload
    localStorage.setItem('student_uploads', JSON.stringify(uploads))
    
    return upload
  }

  // Award credits to student
  private awardCredits(studentId: string, type: CreditTransaction['type'], amount: number, description: string, uploadId?: string): void {
    // Update student credits
    const users = JSON.parse(localStorage.getItem('demo_users') || '[]')
    const userIndex = users.findIndex((user: any) => user.id === studentId)
    
    if (userIndex !== -1) {
      users[userIndex].credits = (users[userIndex].credits || 0) + amount
      localStorage.setItem('demo_users', JSON.stringify(users))
    }

    // Record transaction
    const transaction: CreditTransaction = {
      id: `credit-${Date.now()}`,
      studentId,
      type,
      amount,
      description,
      uploadId,
      timestamp: new Date().toISOString()
    }

    const transactions = JSON.parse(localStorage.getItem('credit_transactions') || '[]')
    transactions.push(transaction)
    localStorage.setItem('credit_transactions', JSON.stringify(transactions))
  }

  // Get student credit transactions
  getCreditTransactions(studentId: string): CreditTransaction[] {
    const transactions = JSON.parse(localStorage.getItem('credit_transactions') || '[]')
    return transactions.filter((transaction: CreditTransaction) => transaction.studentId === studentId)
  }

  // Calculate quality score based on various factors
  private calculateQualityScore(upload: StudentUpload): number {
    let score = 50 // Base score

    // Duration factor (optimal 5-20 minutes)
    const durationMinutes = this.parseDuration(upload.duration) / 60
    if (durationMinutes >= 5 && durationMinutes <= 20) {
      score += 20
    } else if (durationMinutes >= 3 && durationMinutes <= 30) {
      score += 10
    }

    // File size factor (indicates quality)
    const fileSizeMB = upload.fileSize / (1024 * 1024)
    if (fileSizeMB > 50) score += 15 // Good quality video
    if (fileSizeMB > 100) score += 10 // High quality video

    // Random factors for demo (in real app, this would be based on actual analysis)
    score += Math.random() * 20 - 10 // ±10 random variation

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  // Helper methods
  private generateThumbnail(): string {
    const thumbnails = [
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1574263867128-a3d5c1b1deaa?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop'
    ]
    return thumbnails[Math.floor(Math.random() * thumbnails.length)]
  }

  private getVideoDuration(file: File): string {
    // In demo mode, generate realistic duration based on file size
    const fileSizeMB = file.size / (1024 * 1024)
    const estimatedMinutes = Math.max(2, Math.min(30, fileSizeMB / 10))
    const minutes = Math.floor(estimatedMinutes)
    const seconds = Math.floor((estimatedMinutes - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  private parseDuration(duration: string): number {
    const [minutes, seconds] = duration.split(':').map(Number)
    return minutes * 60 + seconds
  }

  private getStudentName(studentId: string): string {
    const users = JSON.parse(localStorage.getItem('demo_users') || '[]')
    const user = users.find((u: any) => u.id === studentId)
    return user?.full_name || 'Student User'
  }

  private getStudentAvatar(studentId: string): string {
    const avatars = [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face'
    ]
    const hash = studentId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return avatars[hash % avatars.length]
  }

  private saveUploadToStorage(upload: StudentUpload): void {
    const uploads = JSON.parse(localStorage.getItem('student_uploads') || '[]')
    uploads.push(upload)
    localStorage.setItem('student_uploads', JSON.stringify(uploads))
  }
}

export const studentUploadService = StudentUploadService.getInstance()
