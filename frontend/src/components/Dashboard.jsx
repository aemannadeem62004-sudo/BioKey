import React from 'react'
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
  Bar
} from 'recharts'

const Dashboard = ({ authResult, username, onLogout }) => {
  const prepareDwellData = () => {
    const live = authResult.comparison_data?.dwell_times?.live || {}
    const baseline = authResult.comparison_data?.dwell_times?.baseline || {}
    
    const allKeys = new Set([...Object.keys(live), ...Object.keys(baseline)])
    
    return Array.from(allKeys).map(key => ({
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
      pair: pair,
      live: live[pair] || 0,
      baseline: baseline[pair] || 0
    }))
  }
  
  const dwellData = prepareDwellData()
  const flightData = prepareFlightData()
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">Welcome back, {username}</p>
        </div>
        <button onClick={onLogout} className="btn-secondary">
          Logout
        </button>
      </div>
      
      {/* Match Score Badge */}
      <div className="card mb-6 text-center">
        <div className="inline-block">
          <div className={`badge text-2xl px-6 py-3 ${
            authResult.authenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            Match Score: {authResult.similarity_score}%
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            {authResult.authenticated ? '✓ Authentication Successful' : '✗ Authentication Failed'}
          </p>
        </div>
      </div>
      
      {/* Dwell Time Chart */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Dwell Time Analysis (ms)</h2>
        <p className="text-sm text-text-secondary mb-4">
          Key hold duration comparison - Live vs Baseline
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dwellData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="key" />
            <YAxis label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="live" stroke="#4F46E5" name="Live Session" strokeWidth={2} />
            <Line type="monotone" dataKey="baseline" stroke="#10B981" name="Baseline Profile" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Flight Time Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Flight Time Analysis (ms)</h2>
        <p className="text-sm text-text-secondary mb-4">
          Key-to-key transition timing comparison
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={flightData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="pair" />
            <YAxis label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="live" fill="#4F46E5" name="Live Session" />
            <Bar dataKey="baseline" fill="#10B981" name="Baseline Profile" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Statistics Summary */}
      <div className="card mt-6">
        <h3 className="font-semibold mb-2">Verification Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-text-secondary">Dwell Keys Analyzed</p>
            <p className="font-semibold">{dwellData.length}</p>
          </div>
          <div>
            <p className="text-text-secondary">Flight Transitions Analyzed</p>
            <p className="font-semibold">{flightData.length}</p>
          </div>
          <div>
            <p className="text-text-secondary">Authentication Threshold</p>
            <p className="font-semibold">70%</p>
          </div>
          <div>
            <p className="text-text-secondary">Decision</p>
            <p className={`font-semibold ${authResult.authenticated ? 'text-green-600' : 'text-red-600'}`}>
              {authResult.authenticated ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard