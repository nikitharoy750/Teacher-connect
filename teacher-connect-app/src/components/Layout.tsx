import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, BookOpen, Users, Video, Award, Volume2 } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-warm-light">
      <header className="bg-gradient-primary text-white shadow-xl backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 hover:-translate-y-1 transition-transform duration-300">
              <BookOpen className="h-10 w-10" />
              <h1 className="text-3xl font-bold font-heading tracking-tight">Teacher Connect</h1>
            </Link>
            
            <nav className="flex items-center space-x-8">
              {user ? (
                <>
                  <Link to="/videos" className="nav-link text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300">
                    <Video className="h-5 w-5" />
                    <span className="font-medium">Videos</span>
                  </Link>

                  {user.role === 'student' && (
                    <Link to="/audio" className="nav-link text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300">
                      <Volume2 className="h-5 w-5" />
                      <span className="font-medium">Audio</span>
                    </Link>
                  )}

                  {user.role === 'teacher' ? (
                    <Link to="/teacher-dashboard" className="nav-link text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300">
                      <Users className="h-5 w-5" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                  ) : (
                    <Link to="/student-dashboard" className="nav-link text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300">
                      <Award className="h-5 w-5" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                  )}

                  <div className="flex items-center space-x-6">
                    <div className="text-sm font-medium">
                      <span className="text-white opacity-90">Welcome, </span>
                      <span className="text-white font-semibold">{user.full_name}</span>
                      {user.role === 'student' && user.credits !== undefined && (
                        <span className="ml-3 badge badge-warning bg-gradient-warm text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                          ✨ {user.credits} credits
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="nav-link text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <Link to="/login" className="btn-secondary px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {children}
      </main>

      <footer className="bg-gradient-primary text-white py-12 mt-20">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BookOpen className="h-8 w-8" />
            <h3 className="text-xl font-bold font-heading">Teacher Connect</h3>
          </div>
          <p className="text-white opacity-90 font-medium">
            &copy; 2024 Teacher Connect - Bridging the education gap in rural areas
          </p>
          <p className="text-white opacity-75 text-sm mt-2">
            Made with ❤️ for rural education
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
