import React, { useState, useEffect } from 'react'
import Enrollment from './components/Enrollment'
import Login from './components/Login'
import AccessGranted from './components/AccessGranted'

function App() {
  const [mode, setMode] = useState('login') // 'login', 'enroll', 'granted'
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authResult, setAuthResult] = useState(null)
  
  useEffect(() => {
    document.title = 'BioKey - Next Gen Authentication'
  }, [])
  
  const handleLoginSuccess = (result) => {
    setAuthResult(result)
    setMode('granted')
    setIsLoggedIn(true)
  }
  
  const handleLogout = () => {
    setIsLoggedIn(false)
    setMode('login')
    setAuthResult(null)
  }
  
  const handleBackToLogin = () => {
    setMode('login')
  }
  
  if (mode === 'granted' && authResult) {
    return <AccessGranted authResult={authResult} onLogout={handleLogout} />
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center space-x-3 mb-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                  BioKey
                </h1>
                <p className="text-indigo-200 text-lg mt-2">Behavioral Biometric Authentication</p>
              </div>
            </div>
            <p className="text-indigo-100 max-w-2xl mx-auto">
              Your unique typing rhythm is your digital fingerprint. 
              Secure your accounts with the invisible layer of behavioral biometrics.
            </p>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 64L60 69.3C120 75 240 85 360 80C480 75 600 53 720 48C840 43 960 53 1080 58.7C1200 64 1320 64 1380 64L1440 64L1440 120L1380 120C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120L0 120Z" fill="currentColor" className="text-slate-50"/>
          </svg>
        </div>
      </div>
      
      {/* Mode Toggle */}
      <div className="relative container mx-auto px-4 -mt-8">
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setMode('login')}
            className={`relative px-10 py-3 rounded-xl font-semibold transition-all duration-300 ${
              mode === 'login' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl transform scale-105' 
                : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white shadow-lg'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login
            </span>
          </button>
          <button
            onClick={() => setMode('enroll')}
            className={`relative px-10 py-3 rounded-xl font-semibold transition-all duration-300 ${
              mode === 'enroll' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl transform scale-105' 
                : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white shadow-lg'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Enroll
            </span>
          </button>
        </div>
        
        {/* Main Content */}
        <div className="max-w-5xl mx-auto pb-16">
          {mode === 'login' ? (
            <Login onLoginSuccess={handleLoginSuccess} />
          ) : (
            <Enrollment onEnrollmentComplete={() => setMode('login')} />
          )}
        </div>
        
        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-200">
          <div className="flex justify-center space-x-6 mb-4">
            <span className="text-xs text-gray-500">🔒 AES-256 Encrypted</span>
            <span className="text-xs text-gray-500">⚡ Real-time Analysis</span>
            <span className="text-xs text-gray-500">🎯 99.9% Accuracy</span>
          </div>
          <p className="text-xs text-gray-400">
            © 2026 BioKey - Advanced Keystroke Dynamics Authentication System
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App