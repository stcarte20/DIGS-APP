import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  User, 
  FileText, 
  Upload, 
  Calendar, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Search,
  Plus,
  X,
  CheckCircle,
  Users,
  Shield,
  Loader2
} from 'lucide-react';
import { Office365Service, Office365User } from '../../services/SimpleOffice365Service';

// Current user interface for Office365 data
interface CurrentUser {
  id?: string;
  name: string;
  employeeNumber: string;
  jobTitle: string;
  email: string;
  department: string;
}

// Witness interface that can handle both Office365 users and external witnesses
interface Witness {
  id: string;
  name?: string; // For external witnesses
  displayName?: string; // For Office365 users
  mail?: string; // For Office365 users
  type: 'employee' | 'external';
  details?: string;
}

// Default current user (fallback if Office365 fails)
const DEFAULT_USER: CurrentUser = {
  id: 'user-1',
  name: 'Loading User...',
  employeeNumber: 'Loading...',
  jobTitle: 'Loading...',
  email: 'Loading...',
  department: 'Loading...'
};

// Updated concern categories with associated tags
const CONCERN_CATEGORIES = {
  'Performance Issues': [
    'Misuse of Time', 'Sitting in Passenger seats', 'Red Flags', 'Misuse of Authority',
    'Threatening, Intimidating, Discourteous Behavior', 'Call Avoidance', 'Refusal to fly',
    'NME - Failure to Follow Instructions', 'Insubordination after directive', 'Personal Electronic Device',
    'Sleeping on Job', 'Causes a delay', 'Failure of Covid Safety Compliance', 'Public Announcement',
    'Going off script', 'Safety - Ground Work Practices', 'Disconnects from a guest',
    'Use of InFlight Entertainment', 'Agent Release Does Not Self Report', 'Attendance Points',
    'Lying during an investigation', 'Not Meeting Expectations (Training not completed)', 'Poor conduct',
    'Dishonesty', 'No Call, No Show', 'Electronic Device usage', 'Rude to guest or yells',
    'IMD', 'TFP', 'NME - Work Quality/Compliance'
  ],
  'Financial Fraud': ['Sick Leave Abuse', 'Medical Leave', 'Fraud to Obtain Benefits'],
  'Workplace Environment': [
    'Hotel Behavior', 'Layover', 'Workplace Violence/Retaliation', 'Inappropriate Material in Workplace'
  ],
  'CBA Violation': ['Commuter Policy', 'Crew Hotel', 'Trip Trading'],
  'Non-rev Travel Privileges': ['Travel Violations'],
  'Violation of Policy': [
    'Inappropriate Conduct', 'Misuse of Guest/Empl. Personal Info.', 'Discrimination', 'Gambling',
    'Possession of Firearms/Weapons', 'Company Intellectual Property', 'Conflict of Interest',
    'Falsification of Records', 'Uniform Compliance', 'Failure to report for work as scheduled',
    'Certification Compliance', 'Crew Conflict/Behavior', 'Job Abandonment'
  ],
  'Harassment - Sexual': ['Sexual Harassment'],
  'Confidentiality': ['Inappropriate use of Social Media'],
  'Harassment - non-sexual': [
    'Fighting/Horseplay', 'Intimidation', 'Profanity directed at a supervisor', 'Uses profanity with a guest'
  ],
  'Theft': ['Theft of Guest/Company Property', 'Theft of Money', 'Theft of Time', 'Unauthorized LOA'],
  'Employment': [
    'Criminal Offense', 'Walks out of an investigation', 'Refuses to respond to investigative inquiries'
  ],
  'Fitness for Duty': [
    'Drug or Alcohol', 'Failed Drug Test', 'Appearance of sleeping', 'Failed test, Positive Random Test, DOT Testing'
  ],
  'PI - Safety': [
    'Negligence or damaging company property', 'Repeated Recklessness', 'Security',
    'Unauthorized/ Misuse of Company Property', 'Errors - Threat to Passenger Safety',
    'Working with Known Covid Exposure'
  ],
  'Contract Grievance': [
    'Overtime Bypass', 'Holiday Bid', 'Mandatory Overtime Violation', 'Late Lunch/No Lunch',
    'Supv Record of Discussion', 'Mgmt. Doing Union Work', 'Aircraft Safety', 'Flight Recorder Data',
    'Outsourcing of Work', 'Travel Restriction', 'CBT Violation', 'Paid Time', 'Restricted Trade', 'Other'
  ]
};

const CONCERN_TYPES = Object.keys(CONCERN_CATEGORIES);

interface FormData {
  subjectEmployee: Office365User | null;
  incidentDate: string;
  dateOfKnowledge: string;
  concernType: string;
  contextTags: string[];
  description: string;
  witnesses: Witness[];
  urgencyLevel: 'low' | 'medium' | 'high';
  isPrmCase: boolean;
}

export function NewCaseForm() {
  // Helper functions to safely extract user data
  const getUserDisplayName = (user: Office365User): string => {
    return user.displayName || 'Unknown User';
  };

  const getUserEmail = (user: Office365User): string => {
    return user.userPrincipalName || user.mail || 'No email';
  };

  const getUserJobTitle = (user: Office365User): string => {
    return user.jobTitle || 'No title';
  };

  const getUserId = (user: Office365User): string => {
    return user.id || user.userPrincipalName || `user-${Date.now()}`;
  };



  // Current user state
  const [currentUser, setCurrentUser] = useState<CurrentUser>(DEFAULT_USER);
  const [isLoadingCurrentUser, setIsLoadingCurrentUser] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    subjectEmployee: null,
    incidentDate: '',
    dateOfKnowledge: '',
    concernType: '',
    contextTags: [],
    description: '',
    witnesses: [],
    urgencyLevel: 'low',
    isPrmCase: false
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Office365User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Witness search state
  const [witnessSearchQuery, setWitnessSearchQuery] = useState('');
  const [showWitnessSearch, setShowWitnessSearch] = useState(false);
  const [witnessSearchResults, setWitnessSearchResults] = useState<Office365User[]>([]);
  const [isSearchingWitnesses, setIsSearchingWitnesses] = useState(false);
  
  // External witness state
  const [externalWitnessName, setExternalWitnessName] = useState('');
  const [externalWitnessDetails, setExternalWitnessDetails] = useState('');

  // Manager information state
  const [subjectManager, setSubjectManager] = useState<Office365User | null>(null);
  const [witnessManagers, setWitnessManagers] = useState<Map<string, Office365User>>(new Map());
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);

  // Load current user on component mount
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await Office365Service.getCurrentUser();
        if (user) {
          setCurrentUser({
            id: user.id || 'current-user',
            name: user.displayName || 'Unknown User',
            employeeNumber: user.employeeId|| 'Unknown',
            jobTitle: user.jobTitle || 'Unknown Title',
            email: user.userPrincipalName || 'unknown@company.com',
            department: 'Unknown Department' // Office365 doesn't always have department
          });
        } else {
          console.warn('Failed to load current user from Office365');
          setCurrentUser({
            id: 'fallback-user',
            name: 'Office365 User (Not Connected)',
            employeeNumber: 'N/A',
            jobTitle: 'N/A',
            email: 'N/A',
            department: 'N/A'
          });
        }
      } catch (error) {
        console.error('Error loading current user:', error);
        setCurrentUser({
          id: 'error-user',
          name: 'Error Loading User',
          employeeNumber: 'Error',
          jobTitle: 'Error',
          email: 'Error',
          department: 'Error'
        });
      } finally {
        setIsLoadingCurrentUser(false);
      }
    };

    loadCurrentUser();
  }, []);

  // Search for employees using Office365
  const handleEmployeeSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchResult = await Office365Service.searchUsers(query);
      
      if (searchResult.success && searchResult.processedUsers) {
        setSearchResults(searchResult.processedUsers);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching employees:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Search for witness employees using Office365
  const handleWitnessSearch = async (query: string) => {
    if (!query.trim()) {
      setWitnessSearchResults([]);
      return;
    }

    setIsSearchingWitnesses(true);
    try {
      const searchResult = await Office365Service.searchUsers(query);
      
      if (searchResult.success && searchResult.processedUsers) {
        setWitnessSearchResults(searchResult.processedUsers);
      } else {
        setWitnessSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching witnesses:', error);
      setWitnessSearchResults([]);
    } finally {
      setIsSearchingWitnesses(false);
    }
  };

  // Handle search input changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleEmployeeSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (witnessSearchQuery) {
        handleWitnessSearch(witnessSearchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [witnessSearchQuery]);

  const handleSubjectSelect = (user: Office365User) => {
    const selectedUser = {
      ...user,
      displayName: getUserDisplayName(user),
      userPrincipalName: getUserEmail(user),
      jobTitle: getUserJobTitle(user),
      id: getUserId(user)
    };
    
    setFormData({ ...formData, subjectEmployee: selectedUser });
    setShowUserSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    
    // Load manager information for the selected subject
    loadManagerForUser(selectedUser, 'subject');
  };

  const loadManagerForUser = async (user: Office365User, userType: 'subject' | 'witness') => {
    try {
      setIsLoadingManagers(true);
      console.log('🔍 Loading manager for user:', user.displayName, 'type:', userType);
      
      const manager = await Office365Service.getUserManager(user);
      
      if (manager) {
        console.log('✅ Found manager:', manager.displayName);
        if (userType === 'subject') {
          setSubjectManager(manager);
        } else if (userType === 'witness' && user.id) {
          setWitnessManagers(prev => new Map(prev.set(user.id!, manager)));
        }
      } else {
        console.log('ℹ️ No manager found for user:', user.displayName);
        if (userType === 'subject') {
          setSubjectManager(null);
        }
      }
    } catch (error) {
      console.error('❌ Error loading manager:', error);
    } finally {
      setIsLoadingManagers(false);
    }
  };

  const handleWitnessSelect = (user: Office365User) => {
    const newWitness: Witness = {
      id: getUserId(user),
      displayName: getUserDisplayName(user),
      mail: getUserEmail(user),
      type: 'employee' as const,
      details: `${getUserJobTitle(user)} - ${user.department || 'Unknown Department'}`
    };
    
    if (!formData.witnesses.find(w => w.id === newWitness.id)) {
      setFormData({
        ...formData,
        witnesses: [...formData.witnesses, newWitness]
      });
      
      // Load manager information for the witness
      loadManagerForUser(user, 'witness');
    }
    
    setShowWitnessSearch(false);
    setWitnessSearchQuery('');
    setWitnessSearchResults([]);
  };

  const handleAddExternalWitness = () => {
    if (externalWitnessName.trim()) {
      const newWitness: Witness = {
        id: `external-${Date.now()}`,
        name: externalWitnessName,
        type: 'external' as const,
        details: externalWitnessDetails
      };
      
      setFormData({
        ...formData,
        witnesses: [...formData.witnesses, newWitness]
      });
      
      setExternalWitnessName('');
      setExternalWitnessDetails('');
    }
  };

  const removeWitness = (witnessId: string) => {
    setFormData({
      ...formData,
      witnesses: formData.witnesses.filter(w => w.id !== witnessId)
    });
    
    // Remove manager information for this witness
    setWitnessManagers(prev => {
      const newMap = new Map(prev);
      newMap.delete(witnessId);
      return newMap;
    });
  };

  const handleSubmit = (saveAsDraft: boolean = false) => {
    // TODO: Implement form submission logic
    console.log('Form submitted:', { formData, saveAsDraft });
    alert(saveAsDraft ? 'Case saved as draft' : 'Case submitted successfully');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-blue-800">New Case Submission</CardTitle>
              <CardDescription className="text-blue-600">
                Report a new incident or concern
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border">
            <div>
              <p className="text-sm font-medium text-gray-600">Submitter Name</p>
              {isLoadingCurrentUser ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <p className="font-semibold">{currentUser.name}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Employee Number</p>
              {isLoadingCurrentUser ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <p className="font-semibold">{currentUser.employeeNumber}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Job Title</p>
              <p className="font-semibold">{currentUser.jobTitle}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Employee Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-[#01426a]">
            <User className="h-6 w-6" />
            Subject Employee
          </CardTitle>
          <CardDescription>
            Search and select the employee involved in the incident using Microsoft Graph
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Subject Employee *</p>
            <div className="relative">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search for the subject employee (try 'Anne' or 'Zach')"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowUserSearch(e.target.value.length > 0);
                    }}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              {showUserSearch && searchQuery && (
                <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-auto">
                  <CardContent className="p-2">
                    {isSearching ? (
                      <div className="flex items-center gap-2 p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Searching Office365 users...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-1">
                        {searchResults.map((user, index) => {
                          const displayName = getUserDisplayName(user);
                          const email = getUserEmail(user);
                          const jobTitle = getUserJobTitle(user);
                          const userId = getUserId(user);
                          
                          console.log(`🔍 [NewCaseForm] Rendering user ${index}:`, {
                            user,
                            userKeys: Object.keys(user),
                            extractedDisplayName: displayName,
                            extractedEmail: email,
                            extractedJobTitle: jobTitle,
                            extractedUserId: userId
                          });
                          
                          return (
                          <Button
                            key={userId}
                            variant="ghost"
                            className="w-full justify-start p-2 h-auto"
                            onClick={() => handleSubjectSelect(user)}
                          >
                            <div className="text-left">
                              <div className="font-medium">{displayName}</div>
                              <div className="text-sm text-gray-500">
                                {email} • {jobTitle}
                              </div>
                            </div>
                          </Button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-2">No employees found</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {formData.subjectEmployee && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Name</p>
                      <p className="font-semibold">{formData.subjectEmployee.displayName || 'Unknown User'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="font-semibold">{formData.subjectEmployee.userPrincipalName || formData.subjectEmployee.mail || 'No email'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Job Title</p>
                      <p className="font-semibold">{formData.subjectEmployee.jobTitle || 'Unknown Title'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Department</p>
                      <p className="font-semibold">{formData.subjectEmployee.department || 'Unknown Department'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Office Location</p>
                      <p className="font-semibold">{formData.subjectEmployee.officeLocation || 'Unknown Location'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Employee ID</p>
                      <p className="font-semibold text-xs">{formData.subjectEmployee.id || 'Unknown ID'}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData({ ...formData, subjectEmployee: null });
                      setSubjectManager(null); // Clear manager when clearing subject
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Manager Information Section */}
                {(subjectManager || isLoadingManagers) && (
                  <div className="mt-4 pt-4 border-t border-green-300">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-medium text-green-600">Direct Manager</p>
                    </div>
                    {isLoadingManagers ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading manager information...</span>
                      </div>
                    ) : subjectManager ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 rounded border border-green-200">
                        <div>
                          <p className="text-xs font-medium text-gray-600">Manager Name</p>
                          <p className="text-sm font-semibold">{subjectManager.displayName || 'Unknown Manager'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600">Manager Email</p>
                          <p className="text-sm font-semibold">{subjectManager.userPrincipalName || subjectManager.mail || 'No email'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600">Manager Title</p>
                          <p className="text-sm font-semibold">{subjectManager.jobTitle || 'Unknown Title'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600">Manager Department</p>
                          <p className="text-sm font-semibold">{subjectManager.department || 'Unknown Department'}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Incident Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl text-[#01426a]">
                <FileText className="h-6 w-6" />
                Incident Details
              </CardTitle>
              <CardDescription>
                Provide comprehensive details about the incident
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="prm-case"
                checked={formData.isPrmCase}
                onChange={(e) => setFormData({ ...formData, isPrmCase: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="prm-case" className="text-sm font-medium cursor-pointer">
                PRM
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Date of Incident *
              </p>
              <Input
                type="date"
                value={formData.incidentDate}
                onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Date of Knowledge *
              </p>
              <Input
                type="date"
                value={formData.dateOfKnowledge}
                onChange={(e) => setFormData({ ...formData, dateOfKnowledge: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">When the company was notified</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">
              <MapPin className="w-4 h-4 mr-1 inline" />
              Location *
            </p>
            <Input
              placeholder="Where did this incident occur?"
              className="w-full"
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Type of Violation/Concern *</p>
            <select 
              value={formData.concernType} 
              onChange={(e) => setFormData({ ...formData, concernType: e.target.value, contextTags: [] })}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select the type of concern</option>
              {CONCERN_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Context Tags Section - Conditional on category selection */}
          {formData.concernType && CONCERN_CATEGORIES[formData.concernType as keyof typeof CONCERN_CATEGORIES] && (
            <div>
              <p className="text-sm font-medium mb-2">Context Tags for {formData.concernType}</p>
              <p className="text-sm text-gray-500 mb-2">Select relevant tags that apply to this incident</p>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-3">
                {CONCERN_CATEGORIES[formData.concernType as keyof typeof CONCERN_CATEGORIES].map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`tag-${tag}`}
                      checked={formData.contextTags.includes(tag)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            contextTags: [...formData.contextTags, tag]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            contextTags: formData.contextTags.filter(t => t !== tag)
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer">
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
              {formData.contextTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {formData.contextTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <p className="text-sm font-medium mb-2">Detailed Description *</p>
            <textarea
              placeholder="Please provide a detailed description of what happened. Include specific dates, times, locations, and any witnesses if applicable"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Witnesses Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-[#01426a]">
            <Users className="h-6 w-6" />
            Witnesses
          </CardTitle>
          <CardDescription>
            Add any witnesses to the incident. You can search for employees or add external witnesses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Employee Witness Search */}
          <div>
            <p className="text-sm font-medium mb-2">Add Employee Witness</p>
            <div className="relative">
              <Input
                placeholder="Search for employee witnesses"
                value={witnessSearchQuery}
                onChange={(e) => {
                  setWitnessSearchQuery(e.target.value);
                  setShowWitnessSearch(e.target.value.length > 0);
                }}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              
              {showWitnessSearch && witnessSearchQuery && (
                <Card className="absolute z-10 w-full mt-1 max-h-48 overflow-auto">
                  <CardContent className="p-2">
                    {isSearchingWitnesses ? (
                      <div className="flex items-center gap-2 p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Searching witnesses...</span>
                      </div>
                    ) : witnessSearchResults.length > 0 ? (
                      <div className="space-y-1">
                        {witnessSearchResults.map((user) => {
                          const displayName = getUserDisplayName(user);
                          const email = getUserEmail(user);
                          const jobTitle = getUserJobTitle(user);
                          const userId = getUserId(user);
                          
                          return (
                          <Button
                            key={userId}
                            variant="ghost"
                            className="w-full justify-start p-2 h-auto"
                            onClick={() => handleWitnessSelect(user)}
                            disabled={formData.witnesses.find(w => w.id === userId) !== undefined}
                          >
                            <div className="text-left">
                              <div className="font-medium">{displayName}</div>
                              <div className="text-sm text-gray-500">
                                {email} • {jobTitle}
                              </div>
                            </div>
                          </Button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-2">No employees found</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* External Witness */}
          <div>
            <p className="text-sm font-medium mb-2">Add External Witness</p>
            <div className="flex space-x-2">
              <Input
                placeholder="External witness name"
                value={externalWitnessName}
                onChange={(e) => setExternalWitnessName(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Details (optional)"
                value={externalWitnessDetails}
                onChange={(e) => setExternalWitnessDetails(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddExternalWitness}
                disabled={!externalWitnessName.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Witnesses List */}
          {formData.witnesses.length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-sm font-medium">Added Witnesses:</p>
              {formData.witnesses.map((witness) => {
                const witnessManager = witness.type === 'employee' && witness.id ? witnessManagers.get(witness.id) : null;
                
                return (
                <div key={witness.id} className="border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between p-2">
                    <div>
                      <span className="font-medium">{witness.displayName || witness.name}</span>
                      {witness.mail && (
                        <span className="text-sm text-gray-500 ml-2">({witness.mail})</span>
                      )}
                      {witness.details && (
                        <span className="text-sm text-gray-500 ml-2">({witness.details})</span>
                      )}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {witness.type === 'employee' ? 'Employee' : 'External'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWitness(witness.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Manager Information for Employee Witnesses */}
                  {witness.type === 'employee' && witnessManager && (
                    <div className="px-2 pb-2">
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <div className="flex items-center gap-1 mb-1">
                          <User className="h-3 w-3 text-gray-500" />
                          <p className="text-xs font-medium text-gray-500">Direct Manager</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="font-medium">{witnessManager.displayName}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">{witnessManager.jobTitle}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Urgency Level Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-[#01426a]">
            <AlertTriangle className="h-6 w-6" />
            Urgency Level
          </CardTitle>
          <CardDescription>
            Select the appropriate urgency level based on the severity of the incident.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div 
              className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer ${
                formData.urgencyLevel === 'low' ? 'bg-green-50 border-green-200' : 'bg-gray-50'
              }`}
              onClick={() => setFormData({ ...formData, urgencyLevel: 'low' })}
            >
              <input
                type="radio"
                value="low"
                checked={formData.urgencyLevel === 'low'}
                onChange={() => setFormData({ ...formData, urgencyLevel: 'low' })}
                className="rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-green-700">Low Priority</p>
                <p className="text-sm text-gray-600">Standard processing time</p>
              </div>
            </div>
            
            <div 
              className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer ${
                formData.urgencyLevel === 'medium' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'
              }`}
              onClick={() => setFormData({ ...formData, urgencyLevel: 'medium' })}
            >
              <input
                type="radio"
                value="medium"
                checked={formData.urgencyLevel === 'medium'}
                onChange={() => setFormData({ ...formData, urgencyLevel: 'medium' })}
                className="rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-yellow-700">Medium Priority</p>
                <p className="text-sm text-gray-600">Expedited review needed</p>
              </div>
            </div>
            
            <div 
              className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer ${
                formData.urgencyLevel === 'high' ? 'bg-red-50 border-red-200' : 'bg-gray-50'
              }`}
              onClick={() => setFormData({ ...formData, urgencyLevel: 'high' })}
            >
              <input
                type="radio"
                value="high"
                checked={formData.urgencyLevel === 'high'}
                onChange={() => setFormData({ ...formData, urgencyLevel: 'high' })}
                className="rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-red-700">High Priority</p>
                <p className="text-sm text-gray-600">Immediate attention required</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supporting Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-[#01426a]">
            <Upload className="h-6 w-6" />
            Supporting Documentation
          </CardTitle>
          <CardDescription>
            Upload any relevant documents, photos, or evidence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop files here, or <button className="text-blue-600 hover:text-blue-500">browse</button>
            </p>
            <p className="text-xs text-gray-500">Supports: PDF, DOC, JPG, PNG (Max 10MB)</p>
          </div>
        </CardContent>
      </Card>

      {/* Confidentiality Notice */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Shield className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Confidentiality & Data Protection</h4>
                <p className="text-sm text-gray-600">
                  This report will be handled with strict confidentiality. Only authorized personnel 
                  will have access to the information provided. All data is encrypted and stored securely.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Shield className="w-4 h-4 text-green-500" />
          <span>Secure & Confidential</span>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => handleSubmit(true)}
            className="flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Save as Draft</span>
          </Button>
          <Button 
            onClick={() => handleSubmit(false)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Submit Case</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
