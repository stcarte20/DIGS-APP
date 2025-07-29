import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
  details?: string;
}

export function PowerAppsDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: DiagnosticResult[] = [];

      // 1. Environment Detection
      const isPowerAppsEnv = window.location.hostname.includes('apps.powerapps.com') || 
                            window.location.hostname.includes('make.powerapps.com');
      
      results.push({
        name: 'Environment Detection',
        status: isPowerAppsEnv ? 'success' : 'warning',
        message: isPowerAppsEnv ? 'Running in Power Apps environment' : 'Running in local/development environment',
        details: `Hostname: ${window.location.hostname}`
      });

      // 2. Power Platform SDK Check
      const hasPowerSDK = typeof (window as any).powerPlatformSDK !== 'undefined';
      results.push({
        name: 'Power Platform SDK',
        status: hasPowerSDK ? 'success' : 'warning',
        message: hasPowerSDK ? 'Power Platform SDK detected' : 'Power Platform SDK not detected',
        details: `Type: ${typeof (window as any).powerPlatformSDK}`
      });

      // 3. Power Code SDK Import Check
      try {
        const { getPowerSdkInstance } = await import('@pa-client/power-code-sdk/lib/');
        results.push({
          name: 'Power Code SDK Import',
          status: 'success',
          message: 'Power Code SDK imported successfully',
          details: `Function available: ${typeof getPowerSdkInstance === 'function'}`
        });
      } catch (error) {
        results.push({
          name: 'Power Code SDK Import',
          status: 'error',
          message: 'Failed to import Power Code SDK',
          details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // 4. Data Sources Info Check
      try {
        const dsInfo = await import('../../.power/appschemas/dataSourcesInfo');
        const hasOffice365 = dsInfo.dataSourcesInfo && dsInfo.dataSourcesInfo.office365users;
        results.push({
          name: 'Data Sources Configuration',
          status: hasOffice365 ? 'success' : 'warning',
          message: hasOffice365 ? 'Office365 data source configured' : 'Office365 data source not found',
          details: `Available sources: ${Object.keys(dsInfo.dataSourcesInfo || {}).join(', ')}`
        });
      } catch (error) {
        results.push({
          name: 'Data Sources Configuration',
          status: 'error',
          message: 'Failed to load data sources configuration',
          details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // 5. Power Platform Lifecycle Check
      try {
        const { initialize } = await import('@pa-client/power-code-sdk/lib/Lifecycle');
        results.push({
          name: 'Lifecycle SDK',
          status: 'success',
          message: 'Lifecycle SDK imported successfully',
          details: `Initialize function: ${typeof initialize === 'function'}`
        });
      } catch (error) {
        results.push({
          name: 'Lifecycle SDK',
          status: 'error',
          message: 'Failed to import Lifecycle SDK',
          details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // 6. User Agent Check (for Power Apps context)
      const userAgent = navigator.userAgent;
      const isPowerAppsUA = userAgent.includes('PowerApps') || userAgent.includes('PowerPlatform');
      results.push({
        name: 'User Agent Detection',
        status: isPowerAppsUA ? 'success' : 'info',
        message: isPowerAppsUA ? 'Power Apps user agent detected' : 'Standard browser user agent',
        details: userAgent.substring(0, 100) + '...'
      });

      // 7. Window Context Check
      const windowKeys = Object.keys(window).filter(key => 
        key.toLowerCase().includes('power') || 
        key.toLowerCase().includes('dynamics') ||
        key.toLowerCase().includes('xrm')
      );
      
      results.push({
        name: 'Window Context',
        status: windowKeys.length > 0 ? 'success' : 'info',
        message: `Found ${windowKeys.length} Power Platform-related window properties`,
        details: windowKeys.join(', ') || 'None found'
      });

      setDiagnostics(results);
      setIsRunning(false);
    };

    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadgeVariant = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      case 'info':
        return 'outline';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Power Platform Diagnostics
        </CardTitle>
        <CardDescription>
          Diagnostic information for Power Platform Code Apps integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isRunning ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Running diagnostics...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {diagnostics.map((diagnostic, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnostic.status)}
                    <h3 className="font-medium">{diagnostic.name}</h3>
                  </div>
                  <Badge variant={getStatusBadgeVariant(diagnostic.status)}>
                    {diagnostic.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{diagnostic.message}</p>
                {diagnostic.details && (
                  <details className="text-xs text-gray-500">
                    <summary className="cursor-pointer hover:text-gray-700">Details</summary>
                    <pre className="mt-2 bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                      {diagnostic.details}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
