import React from 'react'
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
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </SupabaseProvider>
  )
}

export default App
