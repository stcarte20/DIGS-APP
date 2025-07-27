import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Search, User, Database, AlertCircle, CheckCircle, XCircle, Loader2, UserCheck } from "lucide-react"
import { Office365Service } from "../services/SimpleOffice365Service"

interface TestResult {
  timestamp: string
  testType: 'myProfile' | 'searchUser'
  searchTerm?: string
  success: boolean
  error?: string
  rawResult?: any
  processedUsers?: any[]
  currentUser?: any
  environment: {
    isDevelopment: boolean
    isPowerPlatformEnv: boolean
    userAgent: string
  }
}

export function Office365Test() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])

  const handleMyProfileTest = async () => {
    setIsLoading(true)
    console.log('🧪 Starting MyProfile test...')
    
    try {
      const result = await Office365Service.testMyProfile()
      console.log('🧪 MyProfile test result:', result)
      setTestResults(prev => [result, ...prev])
    } catch (error) {
      console.error('MyProfile test failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchTest = async () => {
    if (!searchTerm.trim()) return

    setIsLoading(true)
    console.log('🧪 Starting Search test with term:', searchTerm)
    
    try {
      const result = await Office365Service.testSearch(searchTerm)
      console.log('🧪 Search test result:', result)
      setTestResults(prev => [result, ...prev])
    } catch (error) {
      console.error('Search test failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearResults = () => {
    setTestResults([])
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Database className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Office 365 Users Connector Test</h1>
            <p className="text-gray-600">Debug and test the Office 365 Users connector integration</p>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* My Profile Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Test Current User (MyProfile_V2)
            </CardTitle>
            <CardDescription>
              Test getting the current logged-in user's profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              type="button"
              onClick={handleMyProfileTest} 
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserCheck className="h-4 w-4" />
              )}
              Test My Profile
            </Button>
          </CardContent>
        </Card>

        {/* Search Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Test User Search
            </CardTitle>
            <CardDescription>
              Enter a search term to test the Office 365 Users connector search functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="search-term">Search Term</Label>
                <Input
                  id="search-term"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter name or email to search..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchTest()}
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="button"
                onClick={handleSearchTest} 
                disabled={isLoading || !searchTerm.trim()}
                className="w-full gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Test Search
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clear Results Button */}
      {testResults.length > 0 && (
        <div className="mb-6">
          <Button variant="outline" onClick={handleClearResults}>
            Clear All Results
          </Button>
        </div>
      )}

      {/* Test Results */}
      <div className="space-y-6">
        {testResults.map((result, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  {result.testType === 'myProfile' ? 'My Profile Test' : 'User Search Test'} #{testResults.length - index}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "Success" : "Failed"}
                  </Badge>
                  <span className="text-sm text-gray-500">{result.timestamp}</span>
                </div>
              </div>
              {result.searchTerm && (
                <CardDescription>
                  Search term: <code className="bg-gray-100 px-2 py-1 rounded">{result.searchTerm}</code>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Environment Info */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Environment Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <Label>Development Mode</Label>
                    <p className={result.environment.isDevelopment ? "text-orange-600" : "text-green-600"}>
                      {result.environment.isDevelopment ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <Label>Power Platform Context</Label>
                    <p className={result.environment.isPowerPlatformEnv ? "text-green-600" : "text-orange-600"}>
                      {result.environment.isPowerPlatformEnv ? "Detected" : "Not Detected"}
                    </p>
                  </div>
                  <div>
                    <Label>User Agent</Label>
                    <p className="text-xs text-gray-600 break-all">
                      {result.environment.userAgent.includes('PowerApps') ? "PowerApps Browser" : "Standard Browser"}
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Error Information */}
              {!result.success && result.error && (
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">Error Details</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <pre className="text-sm text-red-800 whitespace-pre-wrap">{result.error}</pre>
                  </div>
                </div>
              )}

              {/* Current User Information */}
              {result.currentUser && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Current User Profile
                  </h4>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="text-green-700">Display Name</Label>
                          <p className="font-medium">{result.currentUser.DisplayName || result.currentUser.displayName || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-green-700">Email</Label>
                          <p>{result.currentUser.Mail || result.currentUser.mail || result.currentUser.UserPrincipalName || result.currentUser.userPrincipalName || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-green-700">Job Title</Label>
                          <p>{result.currentUser.JobTitle || result.currentUser.jobTitle || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-green-700">Department</Label>
                          <p>{result.currentUser.Department || result.currentUser.department || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-green-700">Office Location</Label>
                          <p>{result.currentUser.OfficeLocation || result.currentUser.officeLocation || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-green-700">User ID</Label>
                          <p className="text-xs break-all">{result.currentUser.Id || result.currentUser.id || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <details className="mt-4">
                        <summary className="cursor-pointer text-green-600 hover:text-green-800">
                          Show all profile fields ({Object.keys(result.currentUser).length} properties)
                        </summary>
                        <div className="mt-2 bg-white border rounded p-3 max-h-48 overflow-auto">
                          <pre className="text-xs text-gray-700">
                            {JSON.stringify(result.currentUser, null, 2)}
                          </pre>
                        </div>
                      </details>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Search Results */}
              {result.processedUsers && result.processedUsers.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Found Users ({result.processedUsers.length})
                  </h4>
                  <div className="space-y-4">
                    {result.processedUsers.map((user, userIndex) => (
                      <Card key={userIndex} className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <Label className="text-blue-700">Display Name</Label>
                              <p className="font-medium">{user.DisplayName || user.displayName || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-blue-700">Email</Label>
                              <p>{user.Mail || user.mail || user.UserPrincipalName || user.userPrincipalName || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-blue-700">Job Title</Label>
                              <p>{user.JobTitle || user.jobTitle || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-blue-700">Department</Label>
                              <p>{user.Department || user.department || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-blue-700">Office Location</Label>
                              <p>{user.OfficeLocation || user.officeLocation || 'N/A'}</p>
                            </div>
                            <div>
                              <Label className="text-blue-700">User ID</Label>
                              <p className="text-xs break-all">{user.Id || user.id || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <details className="mt-4">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                              Show all fields ({Object.keys(user).length} properties)
                            </summary>
                            <div className="mt-2 bg-white border rounded p-3 max-h-48 overflow-auto">
                              <pre className="text-xs text-gray-700">
                                {JSON.stringify(user, null, 2)}
                              </pre>
                            </div>
                          </details>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* No Users Found */}
              {result.success && result.testType === 'searchUser' && (!result.processedUsers || result.processedUsers.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No users found for this search term</p>
                </div>
              )}

              {/* Raw Connector Result */}
              {result.rawResult && (
                <div>
                  <h4 className="font-semibold mb-2">Raw Connector Response</h4>
                  <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-auto">
                    <pre className="text-xs text-gray-800">
                      {JSON.stringify(result.rawResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results Message */}
      {testResults.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Database className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Tests Run Yet</h3>
            <p className="text-gray-500">Use the buttons above to test the Office 365 Users connector</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Office365Test
