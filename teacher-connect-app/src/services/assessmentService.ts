export interface Question {
  id: string
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  question: string
  options?: string[] // For multiple choice
  correctAnswer: string | number // Index for MC, text for others
  explanation?: string
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
  subject: string
  gradeLevel: string
  tags: string[]
}

export interface Assessment {
  id: string
  title: string
  description: string
  subject: string
  gradeLevel: string
  createdBy: string
  createdByName: string
  createdAt: string
  duration: number // in minutes
  totalPoints: number
  questions: Question[]
  isPublished: boolean
  attempts: number
  averageScore: number
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  instructions: string
}

export interface StudentAnswer {
  questionId: string
  answer: string | number
  timeSpent: number // in seconds
  isCorrect?: boolean
  pointsEarned?: number
}

export interface AssessmentAttempt {
  id: string
  assessmentId: string
  studentId: string
  studentName: string
  startTime: string
  endTime?: string
  status: 'in_progress' | 'completed' | 'abandoned'
  answers: StudentAnswer[]
  score: number
  percentage: number
  timeSpent: number // total time in seconds
  creditsEarned: number
  feedback?: string
}

export interface AssessmentStats {
  totalAssessments: number
  totalAttempts: number
  averageScore: number
  completionRate: number
  topPerformers: Array<{
    studentId: string
    studentName: string
    score: number
    percentage: number
  }>
}

class AssessmentService {
  private static instance: AssessmentService

  static getInstance(): AssessmentService {
    if (!AssessmentService.instance) {
      AssessmentService.instance = new AssessmentService()
    }
    return AssessmentService.instance
  }

  // Create new assessment
  createAssessment(assessmentData: Omit<Assessment, 'id' | 'createdAt' | 'attempts' | 'averageScore'>): Assessment {
    const assessment: Assessment = {
      id: `assessment-${Date.now()}`,
      createdAt: new Date().toISOString(),
      attempts: 0,
      averageScore: 0,
      ...assessmentData,
      totalPoints: assessmentData.questions.reduce((sum, q) => sum + q.points, 0)
    }

    this.saveAssessment(assessment)
    return assessment
  }

  // Get all assessments
  getAllAssessments(): Assessment[] {
    return JSON.parse(localStorage.getItem('assessments') || '[]')
  }

  // Get assessments by teacher
  getAssessmentsByTeacher(teacherId: string): Assessment[] {
    const assessments = this.getAllAssessments()
    return assessments.filter(assessment => assessment.createdBy === teacherId)
  }

  // Get published assessments for students
  getPublishedAssessments(): Assessment[] {
    const assessments = this.getAllAssessments()
    return assessments.filter(assessment => assessment.isPublished)
  }

  // Get assessment by ID
  getAssessmentById(id: string): Assessment | null {
    const assessments = this.getAllAssessments()
    return assessments.find(assessment => assessment.id === id) || null
  }

  // Start assessment attempt
  startAssessment(assessmentId: string, studentId: string, studentName: string): AssessmentAttempt {
    const attempt: AssessmentAttempt = {
      id: `attempt-${Date.now()}`,
      assessmentId,
      studentId,
      studentName,
      startTime: new Date().toISOString(),
      status: 'in_progress',
      answers: [],
      score: 0,
      percentage: 0,
      timeSpent: 0,
      creditsEarned: 0
    }

    this.saveAttempt(attempt)
    return attempt
  }

  // Submit assessment attempt
  submitAssessment(attemptId: string, answers: StudentAnswer[]): AssessmentAttempt {
    const attempts = this.getAllAttempts()
    const attemptIndex = attempts.findIndex(attempt => attempt.id === attemptId)
    
    if (attemptIndex === -1) {
      throw new Error('Attempt not found')
    }

    const attempt = attempts[attemptIndex]
    const assessment = this.getAssessmentById(attempt.assessmentId)
    
    if (!assessment) {
      throw new Error('Assessment not found')
    }

    // Calculate scores
    let totalScore = 0
    const gradedAnswers = answers.map(answer => {
      const question = assessment.questions.find(q => q.id === answer.questionId)
      if (!question) return answer

      const isCorrect = this.checkAnswer(question, answer.answer)
      const pointsEarned = isCorrect ? question.points : 0
      totalScore += pointsEarned

      return {
        ...answer,
        isCorrect,
        pointsEarned
      }
    })

    const percentage = (totalScore / assessment.totalPoints) * 100
    const creditsEarned = this.calculateCredits(percentage, assessment.difficulty)

    // Update attempt
    attempt.endTime = new Date().toISOString()
    attempt.status = 'completed'
    attempt.answers = gradedAnswers
    attempt.score = totalScore
    attempt.percentage = percentage
    attempt.timeSpent = Math.floor((new Date().getTime() - new Date(attempt.startTime).getTime()) / 1000)
    attempt.creditsEarned = creditsEarned

    attempts[attemptIndex] = attempt
    localStorage.setItem('assessment_attempts', JSON.stringify(attempts))

    // Update assessment stats
    this.updateAssessmentStats(assessment.id)

    // Award credits to student
    this.awardCredits(attempt.studentId, creditsEarned, `Assessment: ${assessment.title}`)

    return attempt
  }

  // Get student attempts
  getStudentAttempts(studentId: string): AssessmentAttempt[] {
    const attempts = this.getAllAttempts()
    return attempts.filter(attempt => attempt.studentId === studentId)
  }

  // Get attempts for assessment
  getAssessmentAttempts(assessmentId: string): AssessmentAttempt[] {
    const attempts = this.getAllAttempts()
    return attempts.filter(attempt => attempt.assessmentId === assessmentId)
  }

  // Get assessment statistics
  getAssessmentStats(): AssessmentStats {
    const assessments = this.getAllAssessments()
    const attempts = this.getAllAttempts().filter(a => a.status === 'completed')

    const totalAssessments = assessments.length
    const totalAttempts = attempts.length
    const averageScore = attempts.length > 0 
      ? attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length 
      : 0
    const completionRate = attempts.length > 0 
      ? (attempts.filter(a => a.percentage >= 60).length / attempts.length) * 100 
      : 0

    // Get top performers
    const studentScores = new Map<string, { name: string, scores: number[] }>()
    attempts.forEach(attempt => {
      if (!studentScores.has(attempt.studentId)) {
        studentScores.set(attempt.studentId, { name: attempt.studentName, scores: [] })
      }
      studentScores.get(attempt.studentId)!.scores.push(attempt.percentage)
    })

    const topPerformers = Array.from(studentScores.entries())
      .map(([studentId, data]) => ({
        studentId,
        studentName: data.name,
        score: Math.max(...data.scores),
        percentage: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5)

    return {
      totalAssessments,
      totalAttempts,
      averageScore,
      completionRate,
      topPerformers
    }
  }

  // Generate sample assessments for demo
  generateSampleAssessments(): void {
    const sampleAssessments = [
      {
        title: "Basic Algebra Quiz",
        description: "Test your understanding of basic algebraic concepts",
        subject: "Mathematics",
        gradeLevel: "9th Grade",
        createdBy: "teacher-demo",
        createdByName: "Demo Teacher",
        duration: 30,
        isPublished: true,
        difficulty: 'easy' as const,
        tags: ['algebra', 'equations', 'variables'],
        instructions: "Answer all questions to the best of your ability. You have 30 minutes to complete this quiz.",
        questions: [
          {
            id: 'q1',
            type: 'multiple_choice' as const,
            question: "What is the value of x in the equation 2x + 5 = 13?",
            options: ["3", "4", "5", "6"],
            correctAnswer: 1,
            explanation: "2x + 5 = 13, so 2x = 8, therefore x = 4",
            points: 10,
            difficulty: 'easy' as const,
            subject: "Mathematics",
            gradeLevel: "9th Grade",
            tags: ['algebra', 'equations']
          },
          {
            id: 'q2',
            type: 'true_false' as const,
            question: "The equation y = 2x + 3 represents a linear function.",
            correctAnswer: "true",
            explanation: "Yes, this is a linear function because it has the form y = mx + b",
            points: 5,
            difficulty: 'easy' as const,
            subject: "Mathematics",
            gradeLevel: "9th Grade",
            tags: ['linear', 'functions']
          }
        ]
      },
      {
        title: "Science Fundamentals",
        description: "Basic concepts in physics and chemistry",
        subject: "Science",
        gradeLevel: "10th Grade",
        createdBy: "teacher-demo",
        createdByName: "Demo Teacher",
        duration: 45,
        isPublished: true,
        difficulty: 'medium' as const,
        tags: ['physics', 'chemistry', 'fundamentals'],
        instructions: "This assessment covers basic physics and chemistry concepts. Read each question carefully.",
        questions: [
          {
            id: 'q3',
            type: 'multiple_choice' as const,
            question: "What is the chemical symbol for water?",
            options: ["H2O", "CO2", "NaCl", "O2"],
            correctAnswer: 0,
            explanation: "Water is composed of two hydrogen atoms and one oxygen atom: H2O",
            points: 5,
            difficulty: 'easy' as const,
            subject: "Science",
            gradeLevel: "10th Grade",
            tags: ['chemistry', 'molecules']
          }
        ]
      }
    ]

    sampleAssessments.forEach(assessmentData => {
      const totalPoints = assessmentData.questions.reduce((sum, q) => sum + q.points, 0)
      this.createAssessment({
        ...assessmentData,
        totalPoints
      })
    })
  }

  // Helper methods
  private checkAnswer(question: Question, answer: string | number): boolean {
    if (question.type === 'multiple_choice') {
      return answer === question.correctAnswer
    } else if (question.type === 'true_false') {
      return answer.toString().toLowerCase() === question.correctAnswer.toString().toLowerCase()
    } else {
      // For short answer and essay, we'll need more sophisticated checking
      // For demo purposes, we'll do simple string comparison
      return answer.toString().toLowerCase().trim() === question.correctAnswer.toString().toLowerCase().trim()
    }
  }

  private calculateCredits(percentage: number, difficulty: Assessment['difficulty']): number {
    let baseCredits = 0
    
    if (percentage >= 90) baseCredits = 50
    else if (percentage >= 80) baseCredits = 40
    else if (percentage >= 70) baseCredits = 30
    else if (percentage >= 60) baseCredits = 20
    else baseCredits = 10

    // Difficulty multiplier
    const multiplier = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.2 : 1.0
    
    return Math.round(baseCredits * multiplier)
  }

  private awardCredits(studentId: string, amount: number, description: string): void {
    // Update student credits
    const users = JSON.parse(localStorage.getItem('demo_users') || '[]')
    const userIndex = users.findIndex((user: any) => user.id === studentId)
    
    if (userIndex !== -1) {
      users[userIndex].credits = (users[userIndex].credits || 0) + amount
      localStorage.setItem('demo_users', JSON.stringify(users))
    }

    // Record transaction
    const transaction = {
      id: `credit-${Date.now()}`,
      studentId,
      type: 'assessment',
      amount,
      description,
      timestamp: new Date().toISOString()
    }

    const transactions = JSON.parse(localStorage.getItem('credit_transactions') || '[]')
    transactions.push(transaction)
    localStorage.setItem('credit_transactions', JSON.stringify(transactions))
  }

  private updateAssessmentStats(assessmentId: string): void {
    const assessments = this.getAllAssessments()
    const attempts = this.getAssessmentAttempts(assessmentId).filter(a => a.status === 'completed')
    
    const assessmentIndex = assessments.findIndex(a => a.id === assessmentId)
    if (assessmentIndex !== -1) {
      assessments[assessmentIndex].attempts = attempts.length
      assessments[assessmentIndex].averageScore = attempts.length > 0 
        ? attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length 
        : 0
      
      localStorage.setItem('assessments', JSON.stringify(assessments))
    }
  }

  private saveAssessment(assessment: Assessment): void {
    const assessments = this.getAllAssessments()
    assessments.push(assessment)
    localStorage.setItem('assessments', JSON.stringify(assessments))
  }

  private saveAttempt(attempt: AssessmentAttempt): void {
    const attempts = this.getAllAttempts()
    attempts.push(attempt)
    localStorage.setItem('assessment_attempts', JSON.stringify(attempts))
  }

  private getAllAttempts(): AssessmentAttempt[] {
    return JSON.parse(localStorage.getItem('assessment_attempts') || '[]')
  }
}

export const assessmentService = AssessmentService.getInstance()
