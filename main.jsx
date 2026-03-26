import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './index.jsx'

// Polyfill window.storage (Claude.ai artifact API) with localStorage
window.storage = {
  get: async (key) => {
    const value = localStorage.getItem(key)
    return value !== null ? { value } : null
  },
  set: async (key, value) => {
    localStorage.setItem(key, value)
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
