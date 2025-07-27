import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  User, 
  FileText, 
  AlertTriangle,
  Search,
  Plus,
  X,
  Users,
  Shield,
  Loader2,
  Edit,
  Building
} from 'lucide-react';
import { getCaseById, updateCase } from '../lib/cases';
import { Office365Service, Office365User } from '../services/SimpleOffice365Service';
import { Case } from '../types/index';

// Updated witness interface to match the main Case types
interface Witness {
  id: string;
  name?: string;
  displayName?: string;
  mail?: string;
  type: 'employee' | 'external';
  details?: string;
  department?: string;
  jobTitle?: string;
  manager?: {
    id: string;
    name: string;
    email: string;
    jobTitle: string;
    department: string;
  };
}

export function EditCase() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<Partial<Case>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Office365User[]>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [contextTags, setContextTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedWitnessType, setSelectedWitnessType] = useState<'employee' | 'external'>('employee');
  const [newExternalWitness, setNewExternalWitness] = useState({ name: '', details: '' });
  const [showInvestigatorSearch, setShowInvestigatorSearch] = useState(false);
  const [investigatorSearchTerm, setInvestigatorSearchTerm] = useState('');
  const [investigatorSearchResults, setInvestigatorSearchResults] = useState<Office365User[]>([]);
  const [isSearchingInvestigator, setIsSearchingInvestigator] = useState(false);

  // Fetch case data
  const { data: case_, isLoading: caseLoading, error: caseError } = useQuery({
    queryKey: ['case', id],
    queryFn: () => getCaseById(id!),
    enabled: !!id,
  });

  // Initialize form data when case loads
  useEffect(() => {
    if (case_) {
      setFormData({
        ...case_,
        dateOfKnowledge: case_.dateOfKnowledge || case_.dok,
      });
      setWitnesses(case_.witnesses || []);
      setContextTags(case_.contextTags || []);
    }
  }, [case_]);

  // Update case mutation
  const updateCaseMutation = useMutation({
    mutationFn: (updatedCase: Partial<Case>) => updateCase(id!, updatedCase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', id] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      navigate(`/cases/${id}`);
    },
    onError: (error) => {
      console.error('Failed to update case:', error);
    },
  });

  // Handle form input changes
  const handleInputChange = (field: keyof Case, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Search Office365 users for investigators
  const searchInvestigators = async (term: string) => {
    if (!term.trim()) {
      setInvestigatorSearchResults([]);
      return;
    }

    setIsSearchingInvestigator(true);
    try {
      const results = await Office365Service.searchUsers(term);
      setInvestigatorSearchResults(results.processedUsers || []);
    } catch (error) {
      console.error('Investigator search failed:', error);
      setInvestigatorSearchResults([]);
    } finally {
      setIsSearchingInvestigator(false);
    }
  };

  // Handle investigator search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (investigatorSearchTerm.trim()) {
        searchInvestigators(investigatorSearchTerm);
      } else {
        setInvestigatorSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [investigatorSearchTerm]);

  // Search Office365 users
  const searchUsers = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await Office365Service.searchUsers(term);
      if (results.success && results.processedUsers) {
        setSearchResults(results.processedUsers);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Office365 user search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.trim()) {
        searchUsers(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // Select investigator from search
  const selectInvestigator = (user: Office365User) => {
    setFormData(prev => ({
      ...prev,
      investigatorId: user.employeeId || user.id || '',
      assignedTo: user.displayName || user.mail || '',
      investigator: {
        id: user.id || '',
        name: user.displayName || '',
        email: user.mail || '',
        jobTitle: user.jobTitle || '',
        department: user.department || '',
        officeLocation: user.officeLocation
      }
    }));
    setShowInvestigatorSearch(false);
    setInvestigatorSearchTerm('');
    setInvestigatorSearchResults([]);
  };

  // Select subject employee from search
  const selectSubjectEmployee = (user: Office365User) => {
    setFormData(prev => ({
      ...prev,
      employeeFirstName: user.givenName || '',
      employeeLastName: user.surname || '',
      employeeId: user.employeeId || '',
      subjectEmployee: {
        id: user.id || '',
        name: user.displayName || '',
        email: user.mail || '',
        jobTitle: user.jobTitle || '',
        department: user.department || '',
        officeLocation: user.officeLocation,
        manager: user.manager ? {
          id: user.manager.id || '',
          name: user.manager.displayName || '',
          email: user.manager.mail || '',
          jobTitle: user.manager.jobTitle || '',
          department: user.manager.department || ''
        } : undefined
      }
    }));
    setShowUserSearch(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  // Add witness from Office365 search
  const addWitnessFromSearch = (user: Office365User) => {
    const newWitness: Witness = {
      id: user.id || `temp-${Date.now()}`,
      displayName: user.displayName,
      mail: user.mail,
      type: 'employee',
      department: user.department,
      jobTitle: user.jobTitle,
      manager: user.manager ? {
        id: user.manager.id || '',
        name: user.manager.displayName || '',
        email: user.manager.mail || '',
        jobTitle: user.manager.jobTitle || '',
        department: user.manager.department || ''
      } : undefined
    };

    setWitnesses(prev => [...prev, newWitness]);
    setSearchTerm('');
    setSearchResults([]);
  };

  // Add external witness
  const addExternalWitness = () => {
    if (!newExternalWitness.name.trim()) return;

    const newWitness: Witness = {
      id: `external-${Date.now()}`,
      name: newExternalWitness.name,
      type: 'external',
      details: newExternalWitness.details
    };

    setWitnesses(prev => [...prev, newWitness]);
    setNewExternalWitness({ name: '', details: '' });
  };

  // Remove witness
  const removeWitness = (witnessId: string) => {
    setWitnesses(prev => prev.filter(w => w.id !== witnessId));
  };

  // Add context tag
  const addContextTag = () => {
    if (newTag.trim() && !contextTags.includes(newTag.trim())) {
      setContextTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  // Remove context tag
  const removeContextTag = (tag: string) => {
    setContextTags(prev => prev.filter(t => t !== tag));
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedCase = {
      ...formData,
      witnesses,
      contextTags,
      modifiedOn: new Date(),
    };

    updateCaseMutation.mutate(updatedCase);
  };

  if (caseLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading case...</span>
      </div>
    );
  }

  if (caseError || !case_) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Case Not Found</h2>
        <p className="text-gray-600 mb-4">The case you're looking for could not be found.</p>
        <Button onClick={() => navigate('/cases')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cases
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate(`/cases/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Case Details
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Case</h1>
            <p className="text-gray-600">
              {formData.employeeFirstName} {formData.employeeLastName} • PRM Docket: AFA-{case_.id}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate(`/cases/${id}`)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={updateCaseMutation.isPending}
          >
            {updateCaseMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="subject">Subject Employee</TabsTrigger>
            <TabsTrigger value="details">Case Details</TabsTrigger>
            <TabsTrigger value="witnesses">Witnesses</TabsTrigger>
            <TabsTrigger value="settings">Case Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Basic Case Information
                </CardTitle>
                <CardDescription>
                  Update the fundamental details of this case
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Case Status *
                    </label>
                    <select
                      value={formData.status || ''}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="New">New</option>
                      <option value="InvestigationPending">Investigation Pending</option>
                      <option value="InvestigationInProgress">Investigation In Progress</option>
                      <option value="InvestigationComplete">Investigation Complete</option>
                      <option value="Closed">Closed</option>
                      <option value="OnHold">On Hold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority || 'Medium'}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Concern/Violation Type *
                    </label>
                    <select
                      value={formData.concernType || formData.violationType || ''}
                      onChange={(e) => {
                        handleInputChange('concernType', e.target.value);
                        handleInputChange('violationType', e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Attendance">Attendance</option>
                      <option value="Performance">Performance</option>
                      <option value="Conduct">Conduct</option>
                      <option value="Safety">Safety</option>
                      <option value="Policy Violation">Policy Violation</option>
                      <option value="Harassment">Harassment</option>
                      <option value="Discrimination">Discrimination</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Knowledge (DOK) *
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfKnowledge ? new Date(formData.dateOfKnowledge).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleInputChange('dateOfKnowledge', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Incident Location
                    </label>
                    <Input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Where did the incident occur?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned Investigator
                    </label>
                    
                    {/* Current Investigator Display */}
                    {formData.investigatorId && !showInvestigatorSearch ? (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-blue-900">
                              {formData.investigatorId}
                            </h3>
                            <p className="text-sm text-blue-700">
                              Employee ID: {formData.investigatorId}
                            </p>
                            <p className="text-xs text-blue-600">
                              Investigator
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowInvestigatorSearch(!showInvestigatorSearch)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Change Investigator
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Input
                          type="text"
                          value={formData.investigatorId || ''}
                          onChange={(e) => handleInputChange('investigatorId', e.target.value)}
                          placeholder="Enter investigator ID or use search"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2"
                          onClick={() => setShowInvestigatorSearch(!showInvestigatorSearch)}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          {showInvestigatorSearch ? 'Hide' : 'Search'} Directory
                        </Button>
                      </div>
                    )}

                    {/* Investigator Search */}
                    {showInvestigatorSearch && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Search Directory for Investigator</h4>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            type="text"
                            placeholder="Search by name, email, or employee ID..."
                            value={investigatorSearchTerm}
                            onChange={(e) => setInvestigatorSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                          {isSearchingInvestigator && (
                            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                          )}
                        </div>

                        {/* Investigator Search Results */}
                        {investigatorSearchResults.length > 0 && (
                          <div className="mt-4 max-h-64 overflow-y-auto border rounded-md">
                            {investigatorSearchResults.map((user) => (
                              <div
                                key={user.id}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                onClick={() => selectInvestigator(user)}
                              >
                                <div className="font-medium">{user.displayName}</div>
                                <div className="text-sm text-gray-600">
                                  {user.mail} • ID: {user.employeeId}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.jobTitle} • {user.department}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Location
                    </label>
                    <Input
                      type="text"
                      value={formData.baseLocation || ''}
                      onChange={(e) => handleInputChange('baseLocation', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Description *
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide a detailed description of the incident..."
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subject" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Subject Employee
                </CardTitle>
                <CardDescription>
                  Update information about the employee involved in this case
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Subject Employee */}
                {formData.subjectEmployee && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-blue-900">
                          {formData.subjectEmployee.name}
                        </h3>
                        <p className="text-sm text-blue-700">
                          Employee ID: {formData.employeeId} • {formData.subjectEmployee.email}
                        </p>
                        <p className="text-xs text-blue-600">
                          {formData.subjectEmployee.jobTitle} • {formData.subjectEmployee.department}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowUserSearch(!showUserSearch)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Change Employee
                      </Button>
                    </div>
                  </div>
                )}

                {/* Manual Employee Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.employeeFirstName || ''}
                      onChange={(e) => handleInputChange('employeeFirstName', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.employeeLastName || ''}
                      onChange={(e) => handleInputChange('employeeLastName', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID *
                    </label>
                    <Input
                      type="text"
                      value={formData.employeeId || ''}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Location
                    </label>
                    <Input
                      type="text"
                      value={formData.baseLocation || ''}
                      onChange={(e) => handleInputChange('baseLocation', e.target.value)}
                    />
                  </div>
                </div>

                {/* Employee Search */}
                {showUserSearch && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Search Directory</h4>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search by name, email, or employee ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                      )}
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="mt-4 max-h-64 overflow-y-auto border rounded-md">
                        {searchResults.map((user) => (
                          <div
                            key={user.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => selectSubjectEmployee(user)}
                          >
                            <div className="font-medium">{user.displayName}</div>
                            <div className="text-sm text-gray-600">
                              {user.mail} • ID: {user.employeeId}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.jobTitle} • {user.department}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Case Details & Context
                </CardTitle>
                <CardDescription>
                  Additional information and context tags for this case
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Context Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Context Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {contextTags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeContextTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Add a context tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addContextTag())}
                    />
                    <Button type="button" onClick={addContextTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Special Flags */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Special Flags</h4>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="foiNeeded"
                      checked={formData.foiNeeded || false}
                      onChange={(e) => handleInputChange('foiNeeded', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="foiNeeded" className="text-sm font-medium text-gray-700">
                      FOI (Freedom of Information) Required
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isPrmCase"
                      checked={formData.isPrmCase || false}
                      onChange={(e) => handleInputChange('isPrmCase', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPrmCase" className="text-sm font-medium text-gray-700">
                      Add to PRM Docket
                    </label>
                  </div>
                </div>

                {/* Submitter Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Submitter Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Submitter Name
                      </label>
                      <Input
                        type="text"
                        value={formData.submitterInfo?.name || ''}
                        onChange={(e) => handleInputChange('submitterInfo', {
                          ...formData.submitterInfo,
                          name: e.target.value
                        })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee Number
                      </label>
                      <Input
                        type="text"
                        value={formData.submitterInfo?.employeeNumber || ''}
                        onChange={(e) => handleInputChange('submitterInfo', {
                          ...formData.submitterInfo,
                          employeeNumber: e.target.value
                        })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="witnesses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Witnesses ({witnesses.length})
                </CardTitle>
                <CardDescription>
                  Manage witnesses and involved parties for this case
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Witness List */}
                {witnesses.length > 0 && (
                  <div className="space-y-3">
                    {witnesses.map((witness) => (
                      <div key={witness.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3 flex-1">
                          <Badge variant={witness.type === 'employee' ? 'default' : 'secondary'}>
                            {witness.type === 'employee' ? 'Employee' : 'External'}
                          </Badge>
                          <div className="flex-1">
                            <div className="font-medium">
                              {witness.displayName || witness.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {witness.mail && <span>{witness.mail}</span>}
                              {witness.details && <span className="ml-2">• {witness.details}</span>}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeWitness(witness.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Witness Section */}
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Add Witness</h4>
                  
                  {/* Witness Type Selection */}
                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      variant={selectedWitnessType === 'employee' ? 'default' : 'outline'}
                      onClick={() => setSelectedWitnessType('employee')}
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Employee
                    </Button>
                    <Button
                      type="button"
                      variant={selectedWitnessType === 'external' ? 'default' : 'outline'}
                      onClick={() => setSelectedWitnessType('external')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      External
                    </Button>
                  </div>

                  {/* Employee Search */}
                  {selectedWitnessType === 'employee' && (
                    <div>
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="text"
                          placeholder="Search employees..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                        {isSearching && (
                          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                        )}
                      </div>

                      {searchResults.length > 0 && (
                        <div className="max-h-64 overflow-y-auto border rounded-md">
                          {searchResults.map((user) => (
                            <div
                              key={user.id}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center justify-between"
                            >
                              <div>
                                <div className="font-medium">{user.displayName}</div>
                                <div className="text-sm text-gray-600">
                                  {user.mail} • {user.jobTitle}
                                </div>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => addWitnessFromSearch(user)}
                              >
                                Add
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* External Witness Form */}
                  {selectedWitnessType === 'external' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <Input
                            type="text"
                            value={newExternalWitness.name}
                            onChange={(e) => setNewExternalWitness(prev => ({
                              ...prev,
                              name: e.target.value
                            }))}
                            placeholder="External witness name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Details/Role
                          </label>
                          <Input
                            type="text"
                            value={newExternalWitness.details}
                            onChange={(e) => setNewExternalWitness(prev => ({
                              ...prev,
                              details: e.target.value
                            }))}
                            placeholder="Relationship to incident"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={addExternalWitness}
                        disabled={!newExternalWitness.name.trim()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add External Witness
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Case Settings & Administrative
                </CardTitle>
                <CardDescription>
                  Administrative settings and case metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Case Metadata</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Case ID:</span>
                        <span className="font-medium">{case_.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">
                          {new Date(case_.createdOn).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Modified:</span>
                        <span className="font-medium">
                          {case_.modifiedOn ? new Date(case_.modifiedOn).toLocaleDateString() : 'Never'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">PRM Docket:</span>
                        <span className="font-medium">AFA-{case_.id}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">SLA Information</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">DOK:</span>
                        <span className="font-medium">
                          {new Date(case_.dateOfKnowledge || case_.dok).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Days Elapsed:</span>
                        <span className="font-medium">
                          {Math.floor((Date.now() - new Date(case_.dateOfKnowledge || case_.dok).getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">AFA Deadline:</span>
                        <span className={`font-medium ${
                          (() => {
                            const dokDate = new Date(case_.dateOfKnowledge || case_.dok);
                            const today = new Date();
                            let businessDays = 0;
                            let currentDate = new Date(dokDate);
                            
                            while (currentDate <= today) {
                              const dayOfWeek = currentDate.getDay();
                              if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                                businessDays++;
                              }
                              currentDate.setDate(currentDate.getDate() + 1);
                            }
                            
                            const elapsed = businessDays - 1;
                            return elapsed > 12 ? 'text-red-600' : elapsed > 10 ? 'text-orange-600' : 'text-green-600';
                          })()
                        }`}>
                          {(() => {
                            const dokDate = new Date(case_.dateOfKnowledge || case_.dok);
                            let businessDays = 0;
                            let currentDate = new Date(dokDate);
                            
                            while (businessDays < 12) {
                              currentDate.setDate(currentDate.getDate() + 1);
                              const dayOfWeek = currentDate.getDay();
                              if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                                businessDays++;
                              }
                            }
                            
                            return currentDate.toLocaleDateString();
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t pt-6">
                  <h4 className="font-medium text-red-900 mb-3">Danger Zone</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700 mb-3">
                      Deleting a case is permanent and cannot be undone. All associated data will be lost.
                    </p>
                    <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Delete Case
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
