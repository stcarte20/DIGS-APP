import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { User, Loader2, Users, UserCheck, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Office365UsersService } from '../services/Office365UsersService';
import { Office365Service } from '../services/SimpleOffice365Service';

export function Office365Test() {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [apiSteps, setApiSteps] = useState<any[]>([]);
  const [manualTestResult, setManualTestResult] = useState<any>(null);
  const [manualIdentifier, setManualIdentifier] = useState<string>('amy.wells@thedominion.tech');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCurrentUser = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current user profile
      const profileResult = await Office365UsersService.MyProfile_V2("id,displayName,jobTitle,mail,officeLocation,department");
      const profile = profileResult.data;
      setCurrentUser(profile);

      // Try to get user photo
      if (profile?.id) {
        try {
          const photoResult = await Office365UsersService.UserPhoto_V2(profile.id);
          if (photoResult.data) {
            setUserPhoto(`data:image/jpeg;base64,${photoResult.data}`);
          }
        } catch (photoError) {
          console.log('No photo available or error fetching photo:', photoError);
        }
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load user profile. Make sure you are connected to Office 365.');
    } finally {
      setLoading(false);
    }
  };

  const testSimpleManagerLookup = async (email: string) => {
    setLoading(true);
    setError(null);
    setManualTestResult(null);
    setApiSteps([]);
    
    const steps: any[] = [];
    
    try {
      console.log(`🧪 Starting Manager Test for: ${email}`);
      steps.push({
        step: 1,
        action: `Starting Manager Test for: ${email}`,
        timestamp: new Date().toLocaleString(),
        status: 'info'
      });

      // Step 1: Search for the user
      console.log(`🔍 Searching for user: ${email}`);
      steps.push({
        step: 2,
        action: `Searching for user: ${email}`,
        timestamp: new Date().toLocaleString(),
        status: 'loading'
      });
      
      const searchResult = await Office365Service.searchUsers(email, 1);
      console.log('🔍 Search result:', searchResult);
      
      if (!searchResult.success || !searchResult.processedUsers || searchResult.processedUsers.length === 0) {
        steps.push({
          step: 2,
          action: `Searching for user: ${email}`,
          timestamp: new Date().toLocaleString(),
          status: 'error',
          error: `User not found: ${searchResult.error || 'No users returned'}`,
          result: searchResult
        });
        setApiSteps([...steps]);
        return;
      }

      const user = searchResult.processedUsers[0];
      steps.push({
        step: 2,
        action: `Searching for user: ${email}`,
        timestamp: new Date().toLocaleString(),
        status: 'success',
        result: {
          found: true,
          user: user,
          userPrincipalName: user.userPrincipalName,
          mail: user.mail,
          displayName: user.displayName
        }
      });

      // Step 2: Try Manager API (current version)
      console.log(`🔍 Looking up manager using Manager API for: ${user.userPrincipalName || user.mail}`);
      steps.push({
        step: 3,
        action: `Looking up manager using Manager API`,
        timestamp: new Date().toLocaleString(),
        status: 'loading',
        identifier: user.userPrincipalName || user.mail
      });

      try {
        const identifier = user.userPrincipalName || user.mail || user.id;
        if (!identifier) {
          throw new Error('No valid identifier found for user');
        }
        const managerResult = await Office365UsersService.Manager(identifier);
        console.log('📋 Manager API result:', managerResult);
        
        if (managerResult && (managerResult.isSuccess === true || managerResult.success === true) && managerResult.data) {
          steps.push({
            step: 3,
            action: `Looking up manager using Manager API`,
            timestamp: new Date().toLocaleString(),
            status: 'success',
            result: {
              managerFound: true,
              manager: managerResult.data,
              apiUsed: 'Manager (V1)'
            }
          });
        } else {
          steps.push({
            step: 3,
            action: `Looking up manager using Manager API`,
            timestamp: new Date().toLocaleString(),
            status: 'error',
            error: managerResult?.error || 'No manager data returned',
            result: managerResult,
            apiUsed: 'Manager (V1)'
          });
        }
      } catch (managerError) {
        steps.push({
          step: 3,
          action: `Looking up manager using Manager API`,
          timestamp: new Date().toLocaleString(),
          status: 'error',
          error: managerError instanceof Error ? managerError.message : 'Unknown error',
          apiUsed: 'Manager (V1)'
        });
      }

      // Step 3: Try Manager_V2 API 
      console.log(`🔍 Looking up manager using Manager_V2 API for: ${user.userPrincipalName || user.mail}`);
      steps.push({
        step: 4,
        action: `Looking up manager using Manager_V2 API`,
        timestamp: new Date().toLocaleString(),
        status: 'loading',
        identifier: user.userPrincipalName || user.mail
      });

      try {
        const identifier = user.userPrincipalName || user.mail || user.id;
        if (!identifier) {
          throw new Error('No valid identifier found for user');
        }
        const managerV2Result = await Office365UsersService.Manager_V2(identifier);
        console.log('📋 Manager_V2 API result:', managerV2Result);
        
        if (managerV2Result && (managerV2Result.isSuccess === true || managerV2Result.success === true) && managerV2Result.data) {
          steps.push({
            step: 4,
            action: `Looking up manager using Manager_V2 API`,
            timestamp: new Date().toLocaleString(),
            status: 'success',
            result: {
              managerFound: true,
              manager: managerV2Result.data,
              apiUsed: 'Manager_V2'
            }
          });
        } else {
          steps.push({
            step: 4,
            action: `Looking up manager using Manager_V2 API`,
            timestamp: new Date().toLocaleString(),
            status: 'error',
            error: managerV2Result?.error || 'No manager data returned',
            result: managerV2Result,
            apiUsed: 'Manager_V2'
          });
        }
      } catch (managerV2Error) {
        steps.push({
          step: 4,
          action: `Looking up manager using Manager_V2 API`,
          timestamp: new Date().toLocaleString(),
          status: 'error',
          error: managerV2Error instanceof Error ? managerV2Error.message : 'Unknown error',
          apiUsed: 'Manager_V2'
        });
      }

      setApiSteps([...steps]);
      
    } catch (error) {
      console.error('❌ Test error:', error);
      steps.push({
        step: 'error',
        action: 'Test failed',
        timestamp: new Date().toLocaleString(),
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      setApiSteps([...steps]);
      setError(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testManualManagerApi = async () => {
    if (!manualIdentifier.trim()) {
      setError('Please enter an identifier to test');
      return;
    }

    setLoading(true);
    setError(null);
    setManualTestResult(null);

    try {
      console.log('🔧 Manual Manager API Test with identifier:', manualIdentifier);
      
      const startTime = Date.now();
      const result = await Office365UsersService.Manager(manualIdentifier);
      const endTime = Date.now();
      
      console.log('📋 Manual Manager API result:', result);
      
      const analysis: any = {
        identifier: manualIdentifier,
        callDuration: endTime - startTime,
        timestamp: new Date().toLocaleString(),
        rawResponse: result,
        success: !!(result && (result.isSuccess === true || result.success === true) && result.data),
        hasData: !!(result && result.data),
        hasError: !!(result && result.error)
      };

      if (result?.error) {
        analysis.errorDetails = {
          message: result.error.message,
          status: result.error.status,
          requestId: result.error.requestId,
          is404: result.error.status === 404,
          isUserNotFound: result.error.message && result.error.message.includes('No user found')
        };
      }

      if (result?.data) {
        analysis.managerData = result.data;
      }

      setManualTestResult(analysis);
      
    } catch (error) {
      console.error('❌ Manual Manager API test error:', error);
      
      const errorAnalysis = {
        identifier: manualIdentifier,
        timestamp: new Date().toLocaleString(),
        success: false,
        error: true,
        errorDetails: {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: typeof error
        }
      };
      
      setManualTestResult(errorAnalysis);
      setError(`Manual test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testManualManagerApiV2 = async () => {
    if (!manualIdentifier.trim()) {
      setError('Please enter an identifier to test');
      return;
    }

    setLoading(true);
    setError(null);
    setManualTestResult(null);

    try {
      console.log('🔧 Manual Manager_V2 API Test with identifier:', manualIdentifier);
      
      const startTime = Date.now();
      const result = await Office365UsersService.Manager_V2(manualIdentifier);
      const endTime = Date.now();
      
      console.log('📋 Manual Manager_V2 API result:', result);
      
      const analysis: any = {
        apiVersion: 'Manager_V2',
        identifier: manualIdentifier,
        callDuration: endTime - startTime,
        timestamp: new Date().toLocaleString(),
        rawResponse: result,
        success: !!(result && (result.isSuccess === true || result.success === true) && result.data),
        hasData: !!(result && result.data),
        hasError: !!(result && result.error)
      };

      if (result?.error) {
        analysis.errorDetails = {
          message: result.error.message,
          status: result.error.status,
          requestId: result.error.requestId,
          is404: result.error.status === 404,
          isUserNotFound: result.error.message && result.error.message.includes('No user found')
        };
      }

      if (result?.data) {
        analysis.managerData = result.data;
      }

      setManualTestResult(analysis);
      
    } catch (error) {
      console.error('❌ Manual Manager_V2 API test error:', error);
      
      const errorAnalysis = {
        apiVersion: 'Manager_V2',
        identifier: manualIdentifier,
        timestamp: new Date().toLocaleString(),
        success: false,
        error: true,
        errorDetails: {
          message: error instanceof Error ? error.message : 'Unknown error',
          type: typeof error
        }
      };
      
      setManualTestResult(errorAnalysis);
      setError(`Manual test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'loading':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'info':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Office 365 Manager Test</h1>
          <p className="text-muted-foreground">
            Simplified testing for Office 365 Manager API functionality
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Users className="w-4 h-4 mr-2" />
          Power Apps Connected
        </Badge>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Current User Profile
            </CardTitle>
            <CardDescription>Your Office 365 profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={loadCurrentUser} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading Profile...
                </>
              ) : (
                'Load My Profile'
              )}
            </Button>

            {currentUser && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  {userPhoto && (
                    <img 
                      src={userPhoto} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{currentUser.DisplayName || currentUser.displayName}</h3>
                    <p className="text-sm text-gray-600">{currentUser.JobTitle || currentUser.jobTitle}</p>
                    <p className="text-sm text-gray-500">{currentUser.Mail || currentUser.mail}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manager Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="w-5 h-5 mr-2" />
              Manager Lookup Test
            </CardTitle>
            <CardDescription>Test manager lookup with a specific email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email to test:</label>
              <input
                type="email"
                value={manualIdentifier}
                onChange={(e) => setManualIdentifier(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <Button 
              onClick={() => testSimpleManagerLookup(manualIdentifier)}
              disabled={loading || !manualIdentifier.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing Manager Lookup...
                </>
              ) : (
                'Test Manager Lookup'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* API Steps Display */}
      {apiSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>API Call Steps & Results</CardTitle>
            <CardDescription>Step-by-step breakdown of the API calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Step {step.step}</span>
                      <span className="text-sm text-gray-500">{step.timestamp}</span>
                    </div>
                    <p className="text-sm mt-1">{step.action}</p>
                    {step.identifier && (
                      <p className="text-xs text-gray-600 mt-1">
                        Using identifier: {step.identifier}
                      </p>
                    )}
                    {step.error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">Error: {step.error}</p>
                      </div>
                    )}
                    {step.result && step.status === 'success' && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                        {step.result.managerFound ? (
                          <div>
                            <p className="text-sm text-green-800 font-medium">✅ Manager Found!</p>
                            <p className="text-sm text-green-700">
                              Manager: {step.result.manager.DisplayName || step.result.manager.displayName}
                            </p>
                            <p className="text-xs text-green-600">
                              API Used: {step.result.apiUsed}
                            </p>
                          </div>
                        ) : step.result.found ? (
                          <div>
                            <p className="text-sm text-green-800 font-medium">✅ User Found!</p>
                            <p className="text-sm text-green-700">
                              {step.result.user.displayName} ({step.result.user.userPrincipalName || step.result.user.mail})
                            </p>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual API Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Manual API Testing</CardTitle>
          <CardDescription>Test Manager APIs directly with custom parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Identifier to test:</label>
            <input
              type="text"
              value={manualIdentifier}
              onChange={(e) => setManualIdentifier(e.target.value)}
              placeholder="user@example.com or userPrincipalName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              onClick={testManualManagerApi}
              disabled={loading || !manualIdentifier.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing Manager API...
                </>
              ) : (
                'Test Manager API Call'
              )}
            </Button>

            <Button 
              onClick={testManualManagerApiV2}
              disabled={loading || !manualIdentifier.trim()}
              className="w-full"
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing Manager_V2 API...
                </>
              ) : (
                'Test Manager_V2 API Call'
              )}
            </Button>
          </div>

          {manualTestResult && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">
                  Manual Test Results ({manualTestResult.timestamp})
                  {manualTestResult.apiVersion && (
                    <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {manualTestResult.apiVersion}
                    </span>
                  )}
                </h4>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Identifier:</strong> {manualTestResult.identifier}
                    </div>
                    <div>
                      <strong>Duration:</strong> {manualTestResult.callDuration}ms
                    </div>
                    <div>
                      <strong>Success:</strong> {manualTestResult.success ? '✅ Yes' : '❌ No'}
                    </div>
                    <div>
                      <strong>Has Data:</strong> {manualTestResult.hasData ? '✅ Yes' : '❌ No'}
                    </div>
                  </div>

                  {manualTestResult.errorDetails && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <h5 className="font-medium text-red-800 mb-2">Error Details:</h5>
                      <div className="text-sm space-y-1">
                        <p><strong>Status:</strong> {manualTestResult.errorDetails.status}</p>
                        <p><strong>Message:</strong> {manualTestResult.errorDetails.message}</p>
                        {manualTestResult.errorDetails.is404 && (
                          <p className="text-red-700 font-medium">🔍 This is a 404 error - User not found</p>
                        )}
                      </div>
                    </div>
                  )}

                  {manualTestResult.managerData && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <h5 className="font-medium text-green-800 mb-2">✅ Manager Found:</h5>
                      <div className="text-sm space-y-1">
                        <p><strong>Name:</strong> {manualTestResult.managerData.DisplayName || manualTestResult.managerData.displayName}</p>
                        <p><strong>Email:</strong> {manualTestResult.managerData.Mail || manualTestResult.managerData.mail}</p>
                        <p><strong>Title:</strong> {manualTestResult.managerData.JobTitle || manualTestResult.managerData.jobTitle}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
