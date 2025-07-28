import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Monitor,
  Smartphone,
  Globe,
  Zap
} from 'lucide-react';
import { Office365Service } from '../services/SimpleOffice365Service';

interface DiagnosticResult {
  category: string;
  test: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

export function PowerAppsDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // Environment Detection
    try {
      const isPowerApps = window.location.hostname.includes('apps.powerapps.com') || 
                         window.location.hostname.includes('make.powerapps.com');
      const hasPowerSDK = typeof (window as any).powerPlatformSDK !== 'undefined';
      
      results.push({
        category: 'Environment',
        test: 'PowerApps Detection',
        status: isPowerApps ? 'success' : 'warning',
        message: isPowerApps ? 'Running in PowerApps environment' : 'Running in development/other environment',
        details: {
          hostname: window.location.hostname,
          userAgent: navigator.userAgent,
          powerSDK: hasPowerSDK
        }
      });
    } catch (error) {
      results.push({
        category: 'Environment',
        test: 'PowerApps Detection',
        status: 'error',
        message: 'Failed to detect environment',
        details: error
      });
    }

    // Power Platform SDK Check
    try {
      const sdkAvailable = typeof (window as any).powerPlatformSDK !== 'undefined';
      results.push({
        category: 'SDK',
        test: 'Power Platform SDK',
        status: sdkAvailable ? 'success' : 'warning',
        message: sdkAvailable ? 'Power Platform SDK is available' : 'Power Platform SDK not detected',
        details: {
          sdkType: typeof (window as any).powerPlatformSDK,
          globalObject: Object.keys(window).filter(key => key.toLowerCase().includes('power'))
        }
      });
    } catch (error) {
      results.push({
        category: 'SDK',
        test: 'Power Platform SDK',
        status: 'error',
        message: 'Error checking Power Platform SDK',
        details: error
      });
    }

    // Office365 Connection Test
    try {
      const profileTest = await Office365Service.testMyProfile();
      results.push({
        category: 'Office365',
        test: 'Current User Profile',
        status: profileTest.success ? 'success' : 'error',
        message: profileTest.success ? 'Successfully retrieved current user' : `Failed: ${profileTest.error}`,
        details: profileTest
      });
    } catch (error) {
      results.push({
        category: 'Office365',
        test: 'Current User Profile',
        status: 'error',
        message: 'Office365 service error',
        details: error
      });
    }

    // Office365 Search Test
    try {
      const searchTest = await Office365Service.testSearch('test', 1);
      results.push({
        category: 'Office365',
        test: 'User Search',
        status: searchTest.success ? 'success' : 'warning',
        message: searchTest.success ? 'Search functionality working' : `Search issue: ${searchTest.error}`,
        details: searchTest
      });
    } catch (error) {
      results.push({
        category: 'Office365',
        test: 'User Search',
        status: 'error',
        message: 'Search test failed',
        details: error
      });
    }

    // Network and CORS Test
    try {
      const corsTest = await fetch(window.location.origin, { method: 'HEAD' });
      results.push({
        category: 'Network',
        test: 'CORS and Network',
        status: corsTest.ok ? 'success' : 'warning',
        message: corsTest.ok ? 'Network requests working' : 'Network issues detected',
        details: {
          status: corsTest.status,
          headers: Object.fromEntries(corsTest.headers.entries())
        }
      });
    } catch (error) {
      results.push({
        category: 'Network',
        test: 'CORS and Network',
        status: 'error',
        message: 'Network test failed',
        details: error
      });
    }

    // Browser Compatibility
    try {
      const browserInfo = {
        userAgent: navigator.userAgent,
        cookieEnabled: navigator.cookieEnabled,
        language: navigator.language,
        platform: navigator.platform,
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined'
      };
      
      results.push({
        category: 'Browser',
        test: 'Browser Compatibility',
        status: 'success',
        message: 'Browser features detected',
        details: browserInfo
      });
    } catch (error) {
      results.push({
        category: 'Browser',
        test: 'Browser Compatibility',
        status: 'error',
        message: 'Browser compatibility check failed',
        details: error
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      warning: 'secondary',
      error: 'destructive'
    };
    return variants[status as keyof typeof variants] || 'secondary';
  };

  const categorizedResults = diagnostics.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, DiagnosticResult[]>);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
                <Monitor className="h-6 w-6" />
                PowerApps Deployment Diagnostics
              </CardTitle>
              <CardDescription className="text-blue-600">
                Comprehensive testing of PowerApps environment and integrations
              </CardDescription>
            </div>
            <Button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Running...' : 'Run Tests'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Summary */}
      {diagnostics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {diagnostics.filter(d => d.status === 'success').length}
                </div>
                <div className="text-sm text-green-600">Passed</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {diagnostics.filter(d => d.status === 'warning').length}
                </div>
                <div className="text-sm text-yellow-600">Warnings</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {diagnostics.filter(d => d.status === 'error').length}
                </div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      {Object.entries(categorizedResults).map(([category, results]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {category} Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.test}</span>
                    </div>
                    <Badge variant={getStatusBadge(result.status) as any}>
                      {result.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                  {result.details && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        View Details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Troubleshooting Guide */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Troubleshooting Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-medium text-red-600">If you see Office365 errors:</h4>
            <ul className="text-sm text-gray-600 mt-1 ml-4 list-disc">
              <li>Check that the Office365 Users connector is properly configured</li>
              <li>Verify that the connection has the required permissions</li>
              <li>Ensure the environment has the correct Office365 tenant access</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-yellow-600">If running in development:</h4>
            <ul className="text-sm text-gray-600 mt-1 ml-4 list-disc">
              <li>Some PowerApps features will not work in development mode</li>
              <li>Office365 connectors require PowerApps environment to function</li>
              <li>Use the local development URL for testing basic UI functionality</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-green-600">If all tests pass:</h4>
            <ul className="text-sm text-gray-600 mt-1 ml-4 list-disc">
              <li>Your app is properly configured for PowerApps</li>
              <li>Office365 integration should work correctly</li>
              <li>You can proceed with user testing and deployment</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
