import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import PowerProvider from './PowerProvider.tsx'

// PowerApps environment detection
const isPowerPlatformEnv = window.location.hostname.includes('apps.powerapps.com') || 
                          window.location.hostname.includes('make.powerapps.com') ||
                          typeof (window as any).powerPlatformSDK !== 'undefined';

console.log('🔍 Environment Detection:', {
  hostname: window.location.hostname,
  isPowerPlatformEnv,
  hasPowerPlatformSDK: typeof (window as any).powerPlatformSDK !== 'undefined'
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PowerProvider>
      <App />
    </PowerProvider>
  </React.StrictMode>,
)
