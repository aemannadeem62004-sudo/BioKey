import React, { useState, useRef } from 'react'
import KeystrokeInput from './KeystrokeInput'
import { enrollUser } from '../api/client'

const Enrollment = ({ onEnrollmentComplete }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [repetitions, setRepetitions] = useState([])
  const [currentRep, setCurrentRep] = useState(1)
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showTypingSection, setShowTypingSection] = useState(false)
  
  const targetPhrase = 'biokey.sequence.2026'
  const REQUIRED_REPETITIONS = 7
  
  const handleUnlockTyping = () => {
    if (!username || !password) {
      setStatus('❌ Please enter both username and password')
      return
    }
    
    if (username.length < 3) {
      setStatus('❌ Username must be at least 3 characters')
      return
    }
    
    if (password.length < 4) {
      setStatus('❌ Password must be at least 4 characters')
      return
    }
    
    setIsUnlocked(true)
    setShowTypingSection(true)
    setStatus('✨ Account created! Now let\'s build your typing profile.')
  }
  
  const handleRepetitionComplete = (keystrokes) => {
    const newRepetitions = [...repetitions, keystrokes]
    setRepetitions(newRepetitions)
    
    if (currentRep < REQUIRED_REPETITIONS) {
      setCurrentRep(prev => prev + 1)
      setStatus(`🎯 Repetition ${currentRep} complete! ${REQUIRED_REPETITIONS - currentRep} more to go.`)
    } else {
      setStatus(`🎉 Amazing! All ${REQUIRED_REPETITIONS} repetitions captured! Click 'Complete Enrollment' to finish.`)
    }
  }
  
  const handleSubmit = async () => {
    if (repetitions.length !== REQUIRED_REPETITIONS) {
      setStatus(`❌ Please complete all ${REQUIRED_REPETITIONS} typing repetitions.`)
      return
    }
    
    setIsLoading(true)
    setStatus('🔐 Creating your secure biometric profile...')
    
    try {
      const result = await enrollUser(username, password, repetitions)
      setStatus('✅ Enrollment successful! Redirecting to login...')
      setTimeout(() => {
        onEnrollmentComplete()
      }, 2000)
    } catch (error) {
      setStatus(`❌ Enrollment failed: ${error.response?.data?.detail || error.message}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  const isComplete = repetitions.length === REQUIRED_REPETITIONS
  
  return (
    <div className="glass-card rounded-2xl p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Create Account
        </h2>
        <p className="text-gray-500 text-sm mt-1">Set up your biometric profile</p>
      </div>
      
      {/* Account Credentials Section */}
      <div className={`space-y-4 mb-8 transition-all duration-300 ${isUnlocked ? 'opacity-50' : ''}`}>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-modern"
            placeholder="Choose a username"
            disabled={isUnlocked}
            autoComplete="off"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 3 characters</p>
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
            placeholder="Choose a strong password"
            disabled={isUnlocked}
            autoComplete="off"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 4 characters</p>
        </div>
        
        {!isUnlocked && (
          <button
            onClick={handleUnlockTyping}
            className="btn-gradient w-full"
          >
            Continue to Biometric Setup →
          </button>
        )}
      </div>
      
      {/* Typing Repetitions Section */}
      {showTypingSection && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Biometric Profile Setup</h3>
              <p className="text-sm text-gray-500">Type the phrase naturally 7 times</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">{repetitions.length}/{REQUIRED_REPETITIONS}</div>
              <div className="text-xs text-gray-500">Repetitions</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="progress-bar mb-6">
            <div 
              className="progress-fill"
              style={{ width: `${(repetitions.length / REQUIRED_REPETITIONS) * 100}%` }}
            />
          </div>
          
          {!isComplete ? (
            <KeystrokeInput
              key={`rep-${currentRep}`}
              targetPhrase={targetPhrase}
              repetitionNumber={currentRep}
              onComplete={handleRepetitionComplete}
              disabled={false}
            />
          ) : (
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl text-center">
              <div className="inline-block p-3 bg-green-500 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-green-800 mb-2">Profile Complete!</h4>
              <p className="text-green-600">Your typing pattern has been successfully recorded.</p>
            </div>
          )}
        </div>
      )}
      
      {status && (
        <div className={`mt-6 p-4 rounded-xl ${
          status.includes('✅') ? 'bg-green-50 border border-green-200 text-green-800' :
          status.includes('❌') ? 'bg-red-50 border border-red-200 text-red-800' :
          status.includes('🎉') ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
          'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          <p className="text-sm">{status}</p>
        </div>
      )}
      
      {showTypingSection && (
        <button
          onClick={handleSubmit}
          disabled={!isComplete || isLoading}
          className="btn-gradient w-full mt-6 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </span>
          ) : (
            'Complete Enrollment'
          )}
        </button>
      )}
    </div>
  )
}

export default Enrollment