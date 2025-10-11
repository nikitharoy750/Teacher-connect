export interface Doubt {
  id: string
  question: string
  subject: string
  grade_level: string
  student_id: string
  student_name: string
  created_at: string
  status: 'pending' | 'answered' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  attachments?: string[]
}

export interface DoubtResponse {
  id: string
  doubt_id: string
  response: string
  response_type: 'ai' | 'teacher' | 'peer'
  responder_id?: string
  responder_name?: string
  created_at: string
  helpful_votes: number
  confidence_score?: number
  sources?: string[]
}

export interface AIAnalysis {
  subject_detected: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  key_concepts: string[]
  suggested_resources: string[]
  confidence_score: number
}

export class AIDoubtService {
  private static readonly DOUBTS_KEY = 'student_doubts'
  private static readonly RESPONSES_KEY = 'doubt_responses'

  // Submit a new doubt
  static async submitDoubt(doubtData: {
    question: string
    subject: string
    grade_level: string
    student_id: string
    student_name: string
    tags?: string[]
    attachments?: string[]
  }): Promise<Doubt> {
    try {
      const doubt: Doubt = {
        id: `doubt-${Date.now()}`,
        question: doubtData.question,
        subject: doubtData.subject,
        grade_level: doubtData.grade_level,
        student_id: doubtData.student_id,
        student_name: doubtData.student_name,
        created_at: new Date().toISOString(),
        status: 'pending',
        priority: this.calculatePriority(doubtData.question),
        tags: doubtData.tags || [],
        attachments: doubtData.attachments || []
      }

      // Save doubt
      const existingDoubts = this.getDoubts()
      existingDoubts.push(doubt)
      localStorage.setItem(this.DOUBTS_KEY, JSON.stringify(existingDoubts))

      // Generate AI response
      await this.generateAIResponse(doubt)

      return doubt
    } catch (error) {
      console.error('Error submitting doubt:', error)
      throw error
    }
  }

  // Generate AI response to a doubt
  static async generateAIResponse(doubt: Doubt): Promise<DoubtResponse> {
    try {
      // Analyze the question
      const analysis = await this.analyzeQuestion(doubt.question, doubt.subject)
      
      // Generate response based on analysis
      const aiResponse = await this.generateResponse(doubt, analysis)

      const response: DoubtResponse = {
        id: `response-${Date.now()}`,
        doubt_id: doubt.id,
        response: aiResponse,
        response_type: 'ai',
        created_at: new Date().toISOString(),
        helpful_votes: 0,
        confidence_score: analysis.confidence_score,
        sources: analysis.suggested_resources
      }

      // Save response
      const existingResponses = this.getDoubtResponses(doubt.id)
      existingResponses.push(response)
      localStorage.setItem(this.RESPONSES_KEY, JSON.stringify(existingResponses))

      // Update doubt status
      this.updateDoubtStatus(doubt.id, 'answered')

      return response
    } catch (error) {
      console.error('Error generating AI response:', error)
      throw error
    }
  }

  // Analyze question using AI (mock implementation)
  private static async analyzeQuestion(question: string, subject: string): Promise<AIAnalysis> {
    // In a real implementation, this would call OpenAI API
    // For demo purposes, we'll create a mock analysis
    
    const keyWords = question.toLowerCase().split(' ')
    const mathKeywords = ['equation', 'solve', 'calculate', 'formula', 'algebra', 'geometry', 'trigonometry']
    const scienceKeywords = ['experiment', 'reaction', 'molecule', 'force', 'energy', 'photosynthesis']
    const englishKeywords = ['grammar', 'essay', 'literature', 'poem', 'sentence', 'paragraph']

    let detectedSubject = subject
    let difficultyLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
    let keyConcepts: string[] = []

    // Simple keyword-based analysis
    if (mathKeywords.some(keyword => keyWords.includes(keyword))) {
      detectedSubject = 'Mathematics'
      keyConcepts = ['Problem solving', 'Mathematical reasoning', 'Calculations']
    } else if (scienceKeywords.some(keyword => keyWords.includes(keyword))) {
      detectedSubject = 'Science'
      keyConcepts = ['Scientific method', 'Observation', 'Analysis']
    } else if (englishKeywords.some(keyword => keyWords.includes(keyword))) {
      detectedSubject = 'English'
      keyConcepts = ['Language skills', 'Communication', 'Writing']
    }

    // Determine difficulty based on question complexity
    if (question.length > 200 || keyWords.includes('complex') || keyWords.includes('advanced')) {
      difficultyLevel = 'advanced'
    } else if (question.length < 50 || keyWords.includes('basic') || keyWords.includes('simple')) {
      difficultyLevel = 'beginner'
    }

    return {
      subject_detected: detectedSubject,
      difficulty_level: difficultyLevel,
      key_concepts: keyConcepts,
      suggested_resources: this.getSuggestedResources(detectedSubject, difficultyLevel),
      confidence_score: Math.random() * 0.3 + 0.7 // 70-100% confidence
    }
  }

  // Generate AI response based on analysis
  private static async generateResponse(doubt: Doubt, analysis: AIAnalysis): Promise<string> {
    // In a real implementation, this would use OpenAI API
    // For demo purposes, we'll generate contextual responses
    
    const responseTemplates = {
      Mathematics: [
        `To solve this ${analysis.difficulty_level} mathematics problem, let's break it down step by step:

1. First, identify what we're looking for
2. List the given information
3. Choose the appropriate formula or method
4. Solve systematically
5. Check your answer

For ${doubt.subject} problems like this, remember to:
- Show all your work clearly
- Double-check your calculations
- Consider if your answer makes sense in context

Would you like me to walk through a similar example?`,

        `This is a great ${analysis.difficulty_level} question about ${doubt.subject}! Here's how to approach it:

The key concepts involved are: ${analysis.key_concepts.join(', ')}.

Step-by-step approach:
1. Understand what the problem is asking
2. Identify the relevant formulas or theorems
3. Apply the method systematically
4. Verify your solution

Remember: Practice makes perfect in mathematics!`
      ],
      Science: [
        `Excellent question about ${doubt.subject}! Let me help you understand this ${analysis.difficulty_level} concept.

Key points to remember:
- ${analysis.key_concepts.join('\n- ')}

Scientific approach:
1. Observe the phenomenon
2. Form a hypothesis
3. Test through experimentation or research
4. Analyze the results
5. Draw conclusions

For better understanding, I recommend reviewing the fundamental principles and practicing with similar examples.`,

        `This is an interesting ${analysis.difficulty_level} science question! Here's how to think about it:

The main concepts involved are: ${analysis.key_concepts.join(', ')}.

To understand this better:
1. Start with the basic principles
2. Connect to real-world examples
3. Practice with similar problems
4. Ask follow-up questions if needed

Science is all about curiosity and systematic thinking!`
      ],
      default: [
        `Thank you for your ${analysis.difficulty_level} question about ${doubt.subject}!

To help you better understand this topic:

1. Let's identify the main concepts: ${analysis.key_concepts.join(', ')}
2. Break down the problem into smaller parts
3. Connect to what you already know
4. Practice with similar examples

Key learning strategies:
- Take notes while studying
- Discuss with classmates or teachers
- Use multiple resources for different perspectives
- Practice regularly

Don't hesitate to ask follow-up questions!`
      ]
    }

    const templates = responseTemplates[doubt.subject as keyof typeof responseTemplates] || responseTemplates.default
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)]

    return selectedTemplate
  }

  // Get suggested resources based on subject and difficulty
  private static getSuggestedResources(subject: string, _difficulty: string): string[] {
    const resources = {
      Mathematics: [
        'Khan Academy - Mathematics',
        'Wolfram Alpha for calculations',
        'Math textbook chapters',
        'Practice problem sets'
      ],
      Science: [
        'Science textbook references',
        'Educational videos',
        'Laboratory experiments',
        'Scientific journals (simplified)'
      ],
      English: [
        'Grammar guides',
        'Literature analysis resources',
        'Writing style guides',
        'Vocabulary building tools'
      ]
    }

    return resources[subject as keyof typeof resources] || [
      'Educational videos',
      'Textbook references',
      'Online tutorials',
      'Practice exercises'
    ]
  }

  // Calculate priority based on question content
  private static calculatePriority(question: string): 'low' | 'medium' | 'high' {
    const urgentKeywords = ['exam', 'test', 'urgent', 'tomorrow', 'help', 'confused', 'stuck']
    const questionLower = question.toLowerCase()

    if (urgentKeywords.some(keyword => questionLower.includes(keyword))) {
      return 'high'
    }

    if (question.length > 100) {
      return 'medium'
    }

    return 'low'
  }

  // Get all doubts
  static getDoubts(filters?: {
    student_id?: string
    subject?: string
    status?: string
  }): Doubt[] {
    try {
      let doubts = JSON.parse(localStorage.getItem(this.DOUBTS_KEY) || '[]')

      if (filters) {
        if (filters.student_id) {
          doubts = doubts.filter((doubt: Doubt) => doubt.student_id === filters.student_id)
        }
        if (filters.subject) {
          doubts = doubts.filter((doubt: Doubt) => doubt.subject === filters.subject)
        }
        if (filters.status) {
          doubts = doubts.filter((doubt: Doubt) => doubt.status === filters.status)
        }
      }

      return doubts.sort((a: Doubt, b: Doubt) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    } catch (error) {
      console.error('Error getting doubts:', error)
      return []
    }
  }

  // Get responses for a doubt
  static getDoubtResponses(doubtId: string): DoubtResponse[] {
    try {
      const responses = JSON.parse(localStorage.getItem(this.RESPONSES_KEY) || '[]')
      return responses
        .filter((response: DoubtResponse) => response.doubt_id === doubtId)
        .sort((a: DoubtResponse, b: DoubtResponse) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
    } catch (error) {
      console.error('Error getting doubt responses:', error)
      return []
    }
  }

  // Update doubt status
  static updateDoubtStatus(doubtId: string, status: 'pending' | 'answered' | 'resolved'): void {
    try {
      const doubts = this.getDoubts()
      const doubtIndex = doubts.findIndex(doubt => doubt.id === doubtId)
      
      if (doubtIndex !== -1) {
        doubts[doubtIndex].status = status
        localStorage.setItem(this.DOUBTS_KEY, JSON.stringify(doubts))
      }
    } catch (error) {
      console.error('Error updating doubt status:', error)
    }
  }

  // Vote on response helpfulness
  static voteOnResponse(responseId: string, helpful: boolean): void {
    try {
      const responses = JSON.parse(localStorage.getItem(this.RESPONSES_KEY) || '[]')
      const responseIndex = responses.findIndex((response: DoubtResponse) => response.id === responseId)
      
      if (responseIndex !== -1) {
        if (helpful) {
          responses[responseIndex].helpful_votes += 1
        } else {
          responses[responseIndex].helpful_votes = Math.max(0, responses[responseIndex].helpful_votes - 1)
        }
        localStorage.setItem(this.RESPONSES_KEY, JSON.stringify(responses))
      }
    } catch (error) {
      console.error('Error voting on response:', error)
    }
  }
}
