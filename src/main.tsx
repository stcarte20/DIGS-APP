import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import PowerProvider from './PowerProvider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PowerProvider>
      <App />
    </PowerProvider>
  </React.StrictMode>,
)
