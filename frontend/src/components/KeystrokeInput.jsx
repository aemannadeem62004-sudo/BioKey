import React, { useState, useEffect, useRef } from 'react'

const KeystrokeInput = ({ targetPhrase, repetitionNumber, onComplete, disabled }) => {
  const [input, setInput] = useState('')
  const [keystrokes, setKeystrokes] = useState([])
  const [error, setError] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const startTimeRef = useRef(null)
  const inputRef = useRef(null)
  
  useEffect(() => {
    if (inputRef.current && !disabled && !isComplete) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [disabled, isComplete, repetitionNumber])
  
  const resetInput = () => {
    setInput('')
    setKeystrokes([])
    setError('')
    setIsComplete(false)
    setIsTyping(false)
    startTimeRef.current = null
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }
  
  const handleKeyDown = (e) => {
    if (document.activeElement !== inputRef.current) {
      return
    }
    
    const key = e.key
    
    if (key === 'Backspace' || key === 'Delete' || 
        key.startsWith('Arrow') || (e.ctrlKey && key === 'v') ||
        (e.metaKey && key === 'v')) {
      e.preventDefault()
      setError('⛔ Backspace, delete, arrow keys, and paste are not allowed')
      return
    }
    
    if (startTimeRef.current === null && key !== 'Enter') {
      startTimeRef.current = performance.now()
      setIsTyping(true)
    }
    
    if (key !== 'Enter') {
      const timestamp = performance.now() - startTimeRef.current
      
      setKeystrokes(prev => [...prev, {
        key: key,
        event_type: 'keydown',
        timestamp: timestamp
      }])
    }
  }
  
  const handleKeyUp = (e) => {
    if (document.activeElement !== inputRef.current) {
      return
    }
    
    const key = e.key
    
    if (key === 'Backspace' || key === 'Delete' || 
        key.startsWith('Arrow') || (e.ctrlKey && key === 'v')) {
      return
    }
    
    if (key !== 'Enter') {
      const timestamp = performance.now() - startTimeRef.current
      
      setKeystrokes(prev => [...prev, {
        key: key,
        event_type: 'keyup',
        timestamp: timestamp
      }])
    }
    
    if (key === 'Enter') {
      const currentValue = e.target.value
      if (currentValue === targetPhrase) {
        if (keystrokes.length > 0) {
          setIsTyping(false)
          setIsComplete(true)
          onComplete([...keystrokes])
        } else {
          setError('⚠️ No keystrokes detected. Please type the phrase naturally.')
        }
      } else {
        setError(`❌ Phrase mismatch. Expected: "${targetPhrase}"`)
        setTimeout(() => {
          resetInput()
          if (inputRef.current) {
            inputRef.current.focus()
          }
        }, 2000)
      }
    }
  }
  
  const handleChange = (e) => {
    setInput(e.target.value)
    setError('')
  }
  
  const handleFocus = () => {
    if (!isComplete && !disabled) {
      resetInput()
    }
  }
  
  if (isComplete) {
    return (
      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-green-800 font-semibold text-lg">
              ✓ Repetition {repetitionNumber} Captured!
            </p>
            <p className="text-green-600 text-sm">
              {repetitionNumber === 7 ? '🎉 All repetitions complete!' : '✨ Ready for next repetition'}
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isTyping ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <label className="text-sm font-medium text-gray-700">
            Repetition {repetitionNumber} of 7
          </label>
        </div>
        <span className="text-xs text-gray-500 font-mono">
          ⏎ Press Enter when done
        </span>
      </div>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="input-modern font-mono text-lg tracking-wide"
          placeholder={`Type: ${targetPhrase}`}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onChange={handleChange}
          onFocus={handleFocus}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
        />
        {isTyping && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
        <p className="text-xs font-semibold text-gray-700 mb-2">📝 Tips for best results:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Type naturally - don't try to be artificially consistent</li>
          <li>• Prohibited: Backspace, Delete, Arrow keys, Paste</li>
          <li>• Press <kbd className="px-1 bg-white rounded">Enter</kbd> only after completing the phrase</li>
        </ul>
      </div>
    </div>
  )
}

export default KeystrokeInput