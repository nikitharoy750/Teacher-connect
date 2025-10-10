import React, { useState, useEffect } from 'react'
import { Award, TrendingUp, Calendar, Filter, Download, Star, Trophy, Target, Gift } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { studentUploadService } from '../services/studentUploadService'
import type { CreditTransaction } from '../services/studentUploadService'

const CreditsDashboard: React.FC = () => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [filterType, setFilterType] = useState<'all' | CreditTransaction['type']>('all')
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month' | 'year'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user])

  const loadTransactions = () => {
    if (!user) return
    
    setLoading(true)
    try {
      const userTransactions = studentUploadService.getCreditTransactions(user.id)
      setTransactions(userTransactions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ))
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === 'all' || transaction.type === filterType
    
    let matchesTime = true
    if (timeFilter !== 'all') {
      const transactionDate = new Date(transaction.timestamp)
      const now = new Date()
      const diffTime = now.getTime() - transactionDate.getTime()
      const diffDays = diffTime / (1000 * 3600 * 24)
      
      switch (timeFilter) {
        case 'week':
          matchesTime = diffDays <= 7
          break
        case 'month':
          matchesTime = diffDays <= 30
          break
        case 'year':
          matchesTime = diffDays <= 365
          break
      }
    }
    
    return matchesType && matchesTime
  })

  const totalCredits = user?.credits || 0
  const totalEarned = transactions.reduce((sum, t) => sum + t.amount, 0)
  const thisMonthEarned = transactions.filter(t => {
    const transactionDate = new Date(t.timestamp)
    const now = new Date()
    return transactionDate.getMonth() === now.getMonth() && 
           transactionDate.getFullYear() === now.getFullYear()
  }).reduce((sum, t) => sum + t.amount, 0)

  const getTransactionIcon = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'upload':
        return <Award className="h-5 w-5 text-blue-600" />
      case 'approval':
        return <Trophy className="h-5 w-5 text-green-600" />
      case 'quality_bonus':
        return <Star className="h-5 w-5 text-purple-600" />
      case 'view_bonus':
        return <TrendingUp className="h-5 w-5 text-orange-600" />
      case 'like_bonus':
        return <Gift className="h-5 w-5 text-pink-600" />
    }
  }

  const getTransactionColor = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'upload':
        return 'bg-blue-100 text-blue-800'
      case 'approval':
        return 'bg-green-100 text-green-800'
      case 'quality_bonus':
        return 'bg-purple-100 text-purple-800'
      case 'view_bonus':
        return 'bg-orange-100 text-orange-800'
      case 'like_bonus':
        return 'bg-pink-100 text-pink-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTransactionType = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'upload':
        return 'Video Upload'
      case 'approval':
        return 'Content Approved'
      case 'quality_bonus':
        return 'Quality Bonus'
      case 'view_bonus':
        return 'View Milestone'
      case 'like_bonus':
        return 'Like Reward'
    }
  }

  const creditMilestones = [
    { threshold: 100, title: 'First Steps', description: 'Earned your first 100 credits', achieved: totalCredits >= 100 },
    { threshold: 500, title: 'Content Creator', description: 'Reached 500 credits milestone', achieved: totalCredits >= 500 },
    { threshold: 1000, title: 'Knowledge Sharer', description: 'Accumulated 1,000 credits', achieved: totalCredits >= 1000 },
    { threshold: 2500, title: 'Education Champion', description: 'Earned 2,500 credits helping others', achieved: totalCredits >= 2500 },
    { threshold: 5000, title: 'Master Educator', description: 'Reached the prestigious 5,000 credits', achieved: totalCredits >= 5000 }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your credits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold font-heading text-gray-900 mb-2">💰 Credits Dashboard</h1>
        <p className="text-gray-600">Track your earnings and achievements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500 rounded-lg">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-700">Current Balance</p>
              <p className="text-3xl font-bold text-purple-900">{totalCredits}</p>
              <p className="text-xs text-purple-600">credits</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900">{totalEarned}</p>
              <p className="text-xs text-gray-500">all time</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{thisMonthEarned}</p>
              <p className="text-xs text-gray-500">credits earned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Achievement Milestones</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creditMilestones.map((milestone, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-all ${
                milestone.achieved
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  milestone.achieved ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className={`font-semibold ${
                    milestone.achieved ? 'text-green-900' : 'text-gray-700'
                  }`}>
                    {milestone.title}
                  </h4>
                  <p className="text-sm text-gray-600">{milestone.threshold} credits</p>
                </div>
              </div>
              <p className={`text-sm ${
                milestone.achieved ? 'text-green-700' : 'text-gray-600'
              }`}>
                {milestone.description}
              </p>
              {milestone.achieved && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Achieved
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Transaction Types</option>
              <option value="upload">Video Uploads</option>
              <option value="approval">Approvals</option>
              <option value="quality_bonus">Quality Bonuses</option>
              <option value="view_bonus">View Bonuses</option>
              <option value="like_bonus">Like Bonuses</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length > 0 ? (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>

          <div className="space-y-3">
            {filteredTransactions.map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white rounded-lg">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionColor(transaction.type)}`}>
                        {formatTransactionType(transaction.type)}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">+{transaction.amount}</p>
                  <p className="text-sm text-gray-500">credits</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Award className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No transactions found</h3>
          <p className="text-gray-500">
            {filterType !== 'all' || timeFilter !== 'all'
              ? 'Try adjusting your filter criteria'
              : 'Start uploading videos to earn your first credits!'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default CreditsDashboard
