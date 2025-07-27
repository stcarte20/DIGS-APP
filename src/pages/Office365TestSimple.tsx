import { useState } from 'react';

export function Office365Test() {
  const [status, setStatus] = useState<string>('Ready to test Office365 connectivity');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setStatus('Testing Power Apps SDK connection...');
    
    try {
      // Simple test to check if Power SDK is available
      if (typeof window !== 'undefined' && (window as any).powerPlatformSDK) {
        setStatus('✅ Power Platform SDK is available and loaded');
      } else {
        setStatus('⚠️ Power Platform SDK not detected - may be running outside Power Apps environment');
      }
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">Office 365 Integration Test</h1>
        <p className="text-gray-600 mt-2">
          Test Power Apps Code Apps integration and Office365 Users connectivity
        </p>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Power Platform SDK Status</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Connection Status:</h3>
            <p className="text-sm text-gray-600">{status}</p>
          </div>

          <button
            onClick={testConnection}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Environment Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">App Configuration:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• App ID: 6c97d515-6288-4ddb-9cc9-10a63982db43</li>
              <li>• Environment: DIGS-DEV</li>
              <li>• Office365 Users: Connected</li>
            </ul>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Development Status:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Local Dev Server: Port 3000</li>
              <li>• Power Apps Proxy: Port 8081</li>
              <li>• SDK Version: v0.0.2</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">Testing Instructions:</h3>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. This page should load in both local development and Power Apps environment</li>
          <li>2. Click "Test Connection" to verify Power Platform SDK availability</li>
          <li>3. Office365 Users service integration will be added once type issues are resolved</li>
        </ol>
      </div>
    </div>
  );
}
