export interface TeacherRating {
  id: string
  teacher_id: string
  student_id: string
  student_name: string
  rating: number // 1-5 stars
  comment?: string
  content_id: string // video, note, or assessment ID
  content_type: 'video' | 'note' | 'assessment'
  created_at: string
}

export interface TeacherStats {
  teacher_id: string
  teacher_name: string
  avatar?: string
  total_ratings: number
  average_rating: number
  total_content: number
  total_views: number
  total_downloads: number
  subjects: string[]
  grade_levels: string[]
  badges: string[]
  rank: number
  points: number
}

export interface StudentStats {
  student_id: string
  student_name: string
  avatar?: string
  total_credits: number
  content_uploaded: number
  assessments_completed: number
  doubts_resolved: number
  helpful_votes_received: number
  rank: number
  level: string
  badges: string[]
  points: number
}

export interface LeaderboardEntry {
  id: string
  name: string
  avatar?: string
  score: number
  rank: number
  change: number // +1, -1, 0 for rank change
  badges: string[]
  category: string
}

export class LeaderboardService {
  private static readonly TEACHER_RATINGS_KEY = 'teacher_ratings'
  private static readonly TEACHER_STATS_KEY = 'teacher_stats'
  private static readonly STUDENT_STATS_KEY = 'student_stats'

  // Submit teacher rating
  static async rateTeacher(ratingData: {
    teacher_id: string
    student_id: string
    student_name: string
    rating: number
    comment?: string
    content_id: string
    content_type: 'video' | 'note' | 'assessment'
  }): Promise<TeacherRating> {
    try {
      const rating: TeacherRating = {
        id: `rating-${Date.now()}`,
        teacher_id: ratingData.teacher_id,
        student_id: ratingData.student_id,
        student_name: ratingData.student_name,
        rating: ratingData.rating,
        comment: ratingData.comment,
        content_id: ratingData.content_id,
        content_type: ratingData.content_type,
        created_at: new Date().toISOString()
      }

      // Save rating
      const existingRatings = this.getTeacherRatings()
      existingRatings.push(rating)
      localStorage.setItem(this.TEACHER_RATINGS_KEY, JSON.stringify(existingRatings))

      // Update teacher stats
      this.updateTeacherStats(ratingData.teacher_id)

      return rating
    } catch (error) {
      console.error('Error rating teacher:', error)
      throw error
    }
  }

  // Get teacher ratings
  static getTeacherRatings(teacherId?: string): TeacherRating[] {
    try {
      let ratings = JSON.parse(localStorage.getItem(this.TEACHER_RATINGS_KEY) || '[]')
      
      if (teacherId) {
        ratings = ratings.filter((rating: TeacherRating) => rating.teacher_id === teacherId)
      }

      return ratings.sort((a: TeacherRating, b: TeacherRating) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    } catch (error) {
      console.error('Error getting teacher ratings:', error)
      return []
    }
  }

  // Update teacher statistics
  private static updateTeacherStats(teacherId: string): void {
    try {
      const ratings = this.getTeacherRatings(teacherId)
      const totalRatings = ratings.length
      const averageRating = totalRatings > 0 
        ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
        : 0

      // Calculate points based on ratings and content
      const points = this.calculateTeacherPoints(teacherId, averageRating, totalRatings)
      
      // Determine badges
      const badges = this.calculateTeacherBadges(averageRating, totalRatings, points)

      const stats: TeacherStats = {
        teacher_id: teacherId,
        teacher_name: `Teacher ${teacherId.slice(-4)}`, // Mock name
        total_ratings: totalRatings,
        average_rating: averageRating,
        total_content: this.getTeacherContentCount(teacherId),
        total_views: this.getTeacherViews(teacherId),
        total_downloads: this.getTeacherDownloads(teacherId),
        subjects: this.getTeacherSubjects(teacherId),
        grade_levels: this.getTeacherGradeLevels(teacherId),
        badges,
        rank: 0, // Will be calculated in leaderboard
        points
      }

      // Save stats
      const existingStats = JSON.parse(localStorage.getItem(this.TEACHER_STATS_KEY) || '[]')
      const statIndex = existingStats.findIndex((s: TeacherStats) => s.teacher_id === teacherId)
      
      if (statIndex !== -1) {
        existingStats[statIndex] = stats
      } else {
        existingStats.push(stats)
      }
      
      localStorage.setItem(this.TEACHER_STATS_KEY, JSON.stringify(existingStats))
    } catch (error) {
      console.error('Error updating teacher stats:', error)
    }
  }

  // Calculate teacher points
  private static calculateTeacherPoints(teacherId: string, averageRating: number, totalRatings: number): number {
    let points = 0
    
    // Base points from ratings
    points += totalRatings * 10
    points += averageRating * totalRatings * 5
    
    // Bonus points for high ratings
    if (averageRating >= 4.5) points += 100
    else if (averageRating >= 4.0) points += 50
    else if (averageRating >= 3.5) points += 25

    // Points from content engagement
    points += this.getTeacherViews(teacherId) * 0.1
    points += this.getTeacherDownloads(teacherId) * 2

    return Math.round(points)
  }

  // Calculate teacher badges
  private static calculateTeacherBadges(averageRating: number, totalRatings: number, points: number): string[] {
    const badges: string[] = []

    // Rating-based badges
    if (averageRating >= 4.8) badges.push('⭐ Superstar Teacher')
    else if (averageRating >= 4.5) badges.push('🌟 Excellent Teacher')
    else if (averageRating >= 4.0) badges.push('👍 Great Teacher')

    // Volume-based badges
    if (totalRatings >= 100) badges.push('🏆 Popular Educator')
    else if (totalRatings >= 50) badges.push('📈 Rising Star')
    else if (totalRatings >= 10) badges.push('🎯 Engaged Teacher')

    // Points-based badges
    if (points >= 1000) badges.push('💎 Elite Educator')
    else if (points >= 500) badges.push('🥇 Top Performer')
    else if (points >= 250) badges.push('🥈 High Achiever')

    return badges
  }

  // Mock functions for teacher content metrics
  private static getTeacherContentCount(_teacherId: string): number {
    return Math.floor(Math.random() * 20) + 5 // 5-25 content items
  }

  private static getTeacherViews(_teacherId: string): number {
    return Math.floor(Math.random() * 1000) + 100 // 100-1100 views
  }

  private static getTeacherDownloads(_teacherId: string): number {
    return Math.floor(Math.random() * 200) + 20 // 20-220 downloads
  }

  private static getTeacherSubjects(_teacherId: string): string[] {
    const allSubjects = ['Mathematics', 'Science', 'English', 'History', 'Geography']
    const count = Math.floor(Math.random() * 3) + 1
    return allSubjects.slice(0, count)
  }

  private static getTeacherGradeLevels(_teacherId: string): string[] {
    const allGrades = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']
    const count = Math.floor(Math.random() * 3) + 1
    return allGrades.slice(0, count)
  }

  // Get teacher leaderboard
  static getTeacherLeaderboard(): LeaderboardEntry[] {
    try {
      const stats = JSON.parse(localStorage.getItem(this.TEACHER_STATS_KEY) || '[]')
      
      // Sort by points descending
      const sortedStats = stats.sort((a: TeacherStats, b: TeacherStats) => b.points - a.points)
      
      // Add ranks and convert to leaderboard entries
      return sortedStats.map((stat: TeacherStats, index: number) => ({
        id: stat.teacher_id,
        name: stat.teacher_name,
        avatar: stat.avatar,
        score: stat.points,
        rank: index + 1,
        change: 0, // Would track from previous rankings
        badges: stat.badges,
        category: 'teacher'
      }))
    } catch (error) {
      console.error('Error getting teacher leaderboard:', error)
      return []
    }
  }

  // Update student statistics
  static updateStudentStats(studentId: string, action: 'upload' | 'assessment' | 'doubt' | 'vote', points: number = 0): void {
    try {
      const existingStats = JSON.parse(localStorage.getItem(this.STUDENT_STATS_KEY) || '[]')
      let studentStats = existingStats.find((s: StudentStats) => s.student_id === studentId)

      if (!studentStats) {
        studentStats = {
          student_id: studentId,
          student_name: `Student ${studentId.slice(-4)}`,
          total_credits: 0,
          content_uploaded: 0,
          assessments_completed: 0,
          doubts_resolved: 0,
          helpful_votes_received: 0,
          rank: 0,
          level: 'Beginner',
          badges: [],
          points: 0
        }
        existingStats.push(studentStats)
      }

      // Update based on action
      switch (action) {
        case 'upload':
          studentStats.content_uploaded += 1
          studentStats.points += 50
          break
        case 'assessment':
          studentStats.assessments_completed += 1
          studentStats.points += points
          break
        case 'doubt':
          studentStats.doubts_resolved += 1
          studentStats.points += 20
          break
        case 'vote':
          studentStats.helpful_votes_received += 1
          studentStats.points += 5
          break
      }

      // Update level and badges
      studentStats.level = this.calculateStudentLevel(studentStats.points)
      studentStats.badges = this.calculateStudentBadges(studentStats)

      localStorage.setItem(this.STUDENT_STATS_KEY, JSON.stringify(existingStats))
    } catch (error) {
      console.error('Error updating student stats:', error)
    }
  }

  // Calculate student level
  private static calculateStudentLevel(points: number): string {
    if (points >= 1000) return 'Expert'
    if (points >= 500) return 'Advanced'
    if (points >= 250) return 'Intermediate'
    if (points >= 100) return 'Novice'
    return 'Beginner'
  }

  // Calculate student badges
  private static calculateStudentBadges(stats: StudentStats): string[] {
    const badges: string[] = []

    // Content creation badges
    if (stats.content_uploaded >= 10) badges.push('📚 Content Creator')
    else if (stats.content_uploaded >= 5) badges.push('✍️ Contributor')

    // Assessment badges
    if (stats.assessments_completed >= 20) badges.push('🎓 Test Master')
    else if (stats.assessments_completed >= 10) badges.push('📝 Quiz Champion')

    // Engagement badges
    if (stats.doubts_resolved >= 10) badges.push('🤔 Curious Learner')
    if (stats.helpful_votes_received >= 20) badges.push('👥 Community Helper')

    // Level badges
    if (stats.level === 'Expert') badges.push('🏆 Learning Expert')
    else if (stats.level === 'Advanced') badges.push('🌟 Advanced Learner')

    return badges
  }

  // Get student leaderboard
  static getStudentLeaderboard(): LeaderboardEntry[] {
    try {
      const stats = JSON.parse(localStorage.getItem(this.STUDENT_STATS_KEY) || '[]')
      
      // Sort by points descending
      const sortedStats = stats.sort((a: StudentStats, b: StudentStats) => b.points - a.points)
      
      // Add ranks and convert to leaderboard entries
      return sortedStats.map((stat: StudentStats, index: number) => ({
        id: stat.student_id,
        name: stat.student_name,
        avatar: stat.avatar,
        score: stat.points,
        rank: index + 1,
        change: 0, // Would track from previous rankings
        badges: stat.badges,
        category: 'student'
      }))
    } catch (error) {
      console.error('Error getting student leaderboard:', error)
      return []
    }
  }

  // Get teacher statistics
  static getTeacherStats(teacherId: string): TeacherStats | null {
    try {
      const stats = JSON.parse(localStorage.getItem(this.TEACHER_STATS_KEY) || '[]')
      return stats.find((s: TeacherStats) => s.teacher_id === teacherId) || null
    } catch (error) {
      console.error('Error getting teacher stats:', error)
      return null
    }
  }

  // Get student statistics
  static getStudentStats(studentId: string): StudentStats | null {
    try {
      const stats = JSON.parse(localStorage.getItem(this.STUDENT_STATS_KEY) || '[]')
      return stats.find((s: StudentStats) => s.student_id === studentId) || null
    } catch (error) {
      console.error('Error getting student stats:', error)
      return null
    }
  }
}
