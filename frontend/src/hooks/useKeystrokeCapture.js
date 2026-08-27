import { useState, useCallback, useRef } from 'react'

export const useKeystrokeCapture = (targetPhrase, onComplete) => {
  const [currentInput, setCurrentInput] = useState('')
  const [keystrokes, setKeystrokes] = useState([])
  const [isComplete, setIsComplete] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const startTimeRef = useRef(null)
  
  const resetCapture = useCallback(() => {
    setCurrentInput('')
    setKeystrokes([])
    setIsComplete(false)
    setHasError(false)
    setErrorMessage('')
    startTimeRef.current = null
  }, [])
  
  const handleKeyDown = useCallback((event) => {
    const key = event.key
    
    // Prevent backspace, delete, arrow keys, clipboard shortcuts
    if (key === 'Backspace' || key === 'Delete' || 
        key.startsWith('Arrow') || (event.ctrlKey && key === 'v') ||
        (event.metaKey && key === 'v')) {
      event.preventDefault()
      setHasError(true)
      setErrorMessage('Backspaces, deletions, and pastes are not allowed')
      return
    }
    
    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now()
    }
    
    const timestamp = performance.now() - startTimeRef.current
    
    setKeystrokes(prev => [...prev, {
      key: key,
      event_type: 'down',
      timestamp: timestamp
    }])
  }, [])
  
  const handleKeyUp = useCallback((event) => {
    const key = event.key
    
    if (key === 'Backspace' || key === 'Delete' || 
        key.startsWith('Arrow') || (event.ctrlKey && key === 'v')) {
      return
    }
    
    const timestamp = performance.now() - startTimeRef.current
    
    setKeystrokes(prev => [...prev, {
      key: key,
      event_type: 'up',
      timestamp: timestamp
    }])
    
    // Update current input text
    if (key === 'Enter') {
      if (currentInput === targetPhrase) {
        setIsComplete(true)
        if (onComplete) {
          onComplete(keystrokes)
        }
      } else {
        setHasError(true)
        setErrorMessage(`Phrase doesn't match. Please type exactly: ${targetPhrase}`)
      }
    } else if (key.length === 1) {
      setCurrentInput(prev => prev + key)
    }
  }, [currentInput, targetPhrase, keystrokes, onComplete])
  
  const startCapture = useCallback(() => {
    resetCapture()
    return { handleKeyDown, handleKeyUp }
  }, [handleKeyDown, handleKeyUp, resetCapture])
  
  return {
    currentInput,
    keystrokes,
    isComplete,
    hasError,
    errorMessage,
    resetCapture,
    startCapture,
    handleKeyDown,
    handleKeyUp
  }
}