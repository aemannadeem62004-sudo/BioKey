import React, { useState, useEffect } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts'

const AccessGranted = ({ authResult, onLogout }) => {
  const [showContent, setShowContent] = useState(false)
  const [selectedTab, setSelectedTab] = useState('dashboard')
  
  useEffect(() => {
    // Animation for entrance
    setTimeout(() => setShowContent(true), 500)
  }, [])
  
  const prepareDwellData = () => {
    const live = authResult.comparison_data?.dwell_times?.live || {}
    const baseline = authResult.comparison_data?.dwell_times?.baseline || {}
    
    const allKeys = new Set([...Object.keys(live), ...Object.keys(baseline)])
    
    return Array.from(allKeys).slice(0, 15).map(key => ({
      key: key,
      live: live[key] || 0,
      baseline: baseline[key] || 0
    }))
  }
  
  const prepareFlightData = () => {
    const live = authResult.comparison_data?.flight_times?.live || {}
    const baseline = authResult.comparison_data?.flight_times?.baseline || {}
    
    const allPairs = new Set([...Object.keys(live), ...Object.keys(baseline)])
    
    return Array.from(allPairs).slice(0, 10).map(pair => ({
      pair: pair.length > 8 ? pair.substring(0, 8) + '...' : pair,
      fullPair: pair,
      live: live[pair] || 0,
      baseline: baseline[pair] || 0
    }))
  }
  
  const dwellData = prepareDwellData()
  const flightData = prepareFlightData()
  
  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-orange-600'
  }
  
  const getScoreMessage = (score) => {
    if (score >= 90) return 'Exceptional Match - Highly Secure'
    if (score >= 80) return 'Strong Match - Access Granted'
    if (score >= 70) return 'Good Match - Access Granted'
    return 'Marginal Match - Additional Verification Recommended'
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Confetti animation CSS */}
      <style jsx="true">{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti {
          position: fixed;
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          animation: confetti 3s ease-in-out forwards;
          pointer-events: none;
          z-index: 1000;
        }
      `}</style>
      
      {/* Hero Section - Access Granted */}
      <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative container mx-auto px-4 py-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">BioKey</h1>
                <p className="text-emerald-100 text-sm">Secure Access System</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Access Granted Banner */}
        <div className={`transform transition-all duration-700 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-1"></div>
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2">ACCESS GRANTED</h2>
              <p className="text-gray-600 mb-4">Welcome to your secure dashboard</p>
              
              {/* Match Score Card */}
              <div className="inline-block bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Biometric Match Score</p>
                  <div className="text-5xl font-bold mb-2">
                    <span className={getScoreColor(authResult.similarity_score)}>
                      {authResult.similarity_score}%
                    </span>
                  </div>
                  <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto mb-3">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${authResult.similarity_score}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-700 font-medium">
                    {getScoreMessage(authResult.similarity_score)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Verified via Dwell Time & Flight Time Analysis
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setSelectedTab('dashboard')}
              className={`px-6 py-3 font-semibold transition-all relative ${
                selectedTab === 'dashboard' 
                  ? 'text-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics Dashboard
              </span>
              {selectedTab === 'dashboard' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
              )}
            </button>
            <button
              onClick={() => setSelectedTab('security')}
              className={`px-6 py-3 font-semibold transition-all relative ${
                selectedTab === 'security' 
                  ? 'text-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Security Details
              </span>
              {selectedTab === 'security' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
              )}
            </button>
          </div>
          
          {/* Dashboard Tab Content */}
          {selectedTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Dwell Time Chart */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Dwell Time Analysis</h3>
                    <p className="text-sm text-gray-500">Key hold duration comparison (milliseconds)</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                      <span className="text-xs text-gray-600">Live Session</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Baseline Profile</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={dwellData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="key" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="live" stroke="#4F46E5" strokeWidth={2} dot={{ fill: '#4F46E5' }} />
                    <Line type="monotone" dataKey="baseline" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Flight Time Chart */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Flight Time Analysis</h3>
                    <p className="text-sm text-gray-500">Key-to-key transition timing (milliseconds)</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={flightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="pair" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      formatter={(value, name, props) => {
                        const fullPair = flightData.find(d => d.pair === props.payload.pair)?.fullPair || props.payload.pair
                        return [value, `${fullPair} - ${name}`]
                      }}
                    />
                    <Legend />
                    <Bar dataKey="live" fill="#4F46E5" name="Live Session" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="baseline" fill="#10B981" name="Baseline Profile" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {/* Security Details Tab */}
          {selectedTab === 'security' && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Session Security Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <h4 className="font-semibold text-gray-800">Authentication Method</h4>
                    </div>
                    <p className="text-sm text-gray-600">Dual-Factor: Password + Keystroke Dynamics</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <h4 className="font-semibold text-gray-800">Processing Time</h4>
                    </div>
                    <p className="text-sm text-gray-600">Biometric verification completed in &lt;250ms</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h4 className="font-semibold text-gray-800">Features Analyzed</h4>
                    </div>
                    <p className="text-sm text-gray-600">{dwellData.length} keys analyzed for Dwell Time</p>
                    <p className="text-sm text-gray-600">{flightData.length} transitions analyzed for Flight Time</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="font-semibold text-gray-800">Session Timestamp</h4>
                    </div>
                    <p className="text-sm text-gray-600">{new Date().toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccessGranted