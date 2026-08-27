import React, { useState } from 'react'
import KeystrokeInput from './KeystrokeInput'
import { loginUser } from '../api/client'

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [keystrokes, setKeystrokes] = useState(null)
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const targetPhrase = 'biokey.sequence.2026'
  
  const handleTypingComplete = (strokes) => {
    setKeystrokes(strokes)
    setStatus('✓ Phrase captured. Click Login to verify.')
  }
  
  const handleSubmit = async () => {
    if (!username || !password) {
      setStatus('❌ Please enter username and password')
      return
    }
    
    if (!keystrokes) {
      setStatus('❌ Please type the verification phrase first')
      return
    }
    
    setIsLoading(true)
    setStatus('🔍 Verifying credentials and typing pattern...')
    
    try {
      const result = await loginUser(username, password, targetPhrase, keystrokes)
      
      if (result.authenticated) {
        setStatus(`✅ Authentication successful! Match: ${result.similarity_score}%`)
        setTimeout(() => {
          onLoginSuccess(result)
        }, 1500)
      } else {
        setStatus(`❌ Authentication failed. Match: ${result.similarity_score}% - Access denied`)
      }
    } catch (error) {
      setStatus(`❌ Login failed: ${error.response?.data?.detail || error.message}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="glass-card rounded-2xl p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Secure Login
        </h2>
        <p className="text-gray-500 text-sm mt-1">Verify your identity with password + typing rhythm</p>
      </div>
      
      <div className="space-y-5 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-modern"
            placeholder="Enter your username"
            autoComplete="off"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-modern"
            placeholder="Enter your password"
            autoComplete="off"
          />
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-semibold text-gray-700">Biometric Verification</h3>
          <span className="text-xs text-gray-500">Required for access</span>
        </div>
        <KeystrokeInput
          targetPhrase={targetPhrase}
          repetitionNumber={1}
          onComplete={handleTypingComplete}
          disabled={false}
        />
      </div>
      
      {status && (
        <div className={`mb-6 p-4 rounded-xl ${
          status.includes('✅') ? 'bg-green-50 border border-green-200 text-green-800' :
          status.includes('❌') ? 'bg-red-50 border border-red-200 text-red-800' :
          'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          <p className="text-sm">{status}</p>
        </div>
      )}
      
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="btn-gradient w-full disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying...
          </span>
        ) : (
          'Access Secure Area'
        )}
      </button>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          🔐 End-to-end encrypted | Behavioral biometrics active
        </p>
      </div>
    </div>
  )
}

export default Login