import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Video, Users, Award, Download, MessageCircle } from 'lucide-react'

const Home: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-primary text-white rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <h1 className="text-6xl font-bold font-heading mb-8 gradient-text-secondary">Teacher Connect</h1>
          <p className="text-xl mb-10 max-w-4xl mx-auto leading-relaxed font-medium opacity-95">
            Bridging the education gap in rural areas through technology.
            Connect teachers and students, share knowledge, and build a stronger educational community.
          </p>
          {!user && (
            <Link
              to="/login"
              className="btn-secondary px-10 py-4 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              🚀 Get Started
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="card hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
          <div className="bg-gradient-primary p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
            <Video className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold font-heading mb-4 text-gray-900">📚 Video Library</h3>
          <p className="text-gray-600 leading-relaxed">
            Access educational videos from expert teachers. Download for offline viewing in areas with poor connectivity.
          </p>
        </div>

        <div className="card hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
          <div className="bg-gradient-accent p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
            <Download className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold font-heading mb-4 text-gray-900">🎵 Video to Audio</h3>
          <p className="text-gray-600 leading-relaxed">
            Convert videos to audio format for students with limited bandwidth or data constraints.
          </p>
        </div>

        <div className="card hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
          <div className="bg-gradient-warm p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
            <Award className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold font-heading mb-4 text-gray-900">⭐ Credit System</h3>
          <p className="text-gray-600 leading-relaxed">
            Students earn credits by uploading educational content and taking tests. Gamify learning!
          </p>
        </div>

        <div className="card hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
          <div className="bg-gradient-secondary p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold font-heading mb-4 text-gray-900">📖 Notes & Modules</h3>
          <p className="text-gray-600 leading-relaxed">
            Access comprehensive study materials, lecture notes, and educational modules.
          </p>
        </div>

        <div className="card hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
          <div className="bg-gradient-primary p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold font-heading mb-4 text-gray-900">🤖 AI Doubt Resolution</h3>
          <p className="text-gray-600 leading-relaxed">
            Get instant answers to your questions with our AI-powered doubt resolution system.
          </p>
        </div>

        <div className="card hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
          <div className="bg-gradient-accent p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold font-heading mb-4 text-gray-900">🤝 Teacher-Student Connect</h3>
          <p className="text-gray-600 leading-relaxed">
            Improve teacher-student relationships through upvoting, scoring, and leaderboards.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100 py-16 rounded-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-12">Making Education Accessible</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Educational Videos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Active Teachers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">5000+</div>
              <div className="text-gray-600">Students Reached</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="text-center py-16">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Education?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our community of educators and learners making a difference in rural education.
          </p>
          <div className="space-x-4">
            <Link 
              to="/login" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Join as Teacher
            </Link>
            <Link 
              to="/login" 
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Join as Student
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home
