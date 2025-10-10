
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SupabaseProvider } from './contexts/SupabaseContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'
import VideoLibrary from './pages/VideoLibrary'
import AudioLibrary from './pages/AudioLibrary'
import StudentUploads from './pages/StudentUploads'
import ModerationDashboard from './pages/ModerationDashboard'
import CreditsDashboard from './pages/CreditsDashboard'
import Assessments from './pages/Assessments'
import TeacherAssessments from './pages/TeacherAssessments'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/teacher-dashboard" 
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student-dashboard" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/videos"
                element={
                  <ProtectedRoute>
                    <VideoLibrary />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audio"
                element={
                  <ProtectedRoute requiredRole="student">
                    <AudioLibrary />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student-uploads"
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentUploads />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/credits"
                element={
                  <ProtectedRoute requiredRole="student">
                    <CreditsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/moderation"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <ModerationDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assessments"
                element={
                  <ProtectedRoute requiredRole="student">
                    <Assessments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher-assessments"
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherAssessments />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </SupabaseProvider>
  )
}

export default App
