import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
  Shield
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

// Mock current user - in production this would come from Office365 authentication
const CURRENT_USER = {
  id: 'user-1',
  name: 'John Investigator',
  employeeNumber: 'EMP001',
  jobTitle: 'Senior Investigator',
  email: 'john.investigator@company.com',
  department: 'Human Resources'
};

// Mock Office365 users for search - in production this would come from Office365 connector
const MOCK_USERS = [
  {
    id: 'user-2',
    name: 'Jane Smith',
    employeeNumber: 'EMP002',
    jobTitle: 'Bus Operator',
    email: 'jane.smith@company.com',
    department: 'Transportation',
    manager: 'Mike Johnson',
    phone: '(555) 123-4567'
  },
  {
    id: 'user-3',
    name: 'Robert Brown',
    employeeNumber: 'EMP003',
    jobTitle: 'Maintenance Technician',
    email: 'robert.brown@company.com',
    department: 'Maintenance',
    manager: 'Sarah Wilson',
    phone: '(555) 234-5678'
  },
  {
    id: 'user-4',
    name: 'Lisa Davis',
    employeeNumber: 'EMP004',
    jobTitle: 'Dispatcher',
    email: 'lisa.davis@company.com',
    department: 'Operations',
    manager: 'Tom Anderson',
    phone: '(555) 345-6789'
  }
];

const CONCERN_TYPES = [
  'Delay',
  'Commuter',
  'Misconduct (General)',
  'Sick Abuse',
  'EEO (Discrimination)',
  'Harassment',
  'Social Media',
  'Attendance (12 Points)',
  'Drug and Alcohol'
];

interface FormData {
  subjectEmployee: any | null;
  incidentDate: string;
  dateOfKnowledge: string;
  concernType: string;
  description: string;
  witnesses: Array<{ id: string; name: string; type: 'employee' | 'external'; details?: string }>;
  urgencyLevel: 'low' | 'medium' | 'high';
}

export function NewCaseForm() {
  const [formData, setFormData] = useState<FormData>({
    subjectEmployee: null,
    incidentDate: '',
    dateOfKnowledge: '',
    concernType: '',
    description: '',
    witnesses: [],
    urgencyLevel: 'low'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [witnessSearchQuery, setWitnessSearchQuery] = useState('');
  const [showWitnessSearch, setShowWitnessSearch] = useState(false);
  const [externalWitnessName, setExternalWitnessName] = useState('');
  const [externalWitnessDetails, setExternalWitnessDetails] = useState('');

  const filteredUsers = MOCK_USERS.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWitnessUsers = MOCK_USERS.filter(user =>
    user.name.toLowerCase().includes(witnessSearchQuery.toLowerCase()) ||
    user.employeeNumber.toLowerCase().includes(witnessSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(witnessSearchQuery.toLowerCase())
  );

  const handleSubjectSelect = (user: any) => {
    setFormData({ ...formData, subjectEmployee: user });
    setShowUserSearch(false);
    setSearchQuery('');
  };

  const handleWitnessSelect = (user: any) => {
    const newWitness = {
      id: user.id,
      name: user.name,
      type: 'employee' as const,
      details: `${user.jobTitle} - ${user.department}`
    };
    
    if (!formData.witnesses.find(w => w.id === user.id)) {
      setFormData({
        ...formData,
        witnesses: [...formData.witnesses, newWitness]
      });
    }
    
    setShowWitnessSearch(false);
    setWitnessSearchQuery('');
  };

  const handleAddExternalWitness = () => {
    if (externalWitnessName.trim()) {
      const newWitness = {
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
              <Label className="text-sm font-medium text-gray-600">Submitter Name</Label>
              <p className="font-semibold">{CURRENT_USER.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Employee Number</Label>
              <p className="font-semibold">{CURRENT_USER.employeeNumber}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Job Title</Label>
              <p className="font-semibold">{CURRENT_USER.jobTitle}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-500" />
            Subject Information
          </CardTitle>
          <CardDescription>
            Search and select the employee involved in the incident using Microsoft Graph
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="subject-search">Subject Employee *</Label>
            <div className="relative">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    id="subject-search"
                    placeholder="Search for the subject employee (try 'Anna' or 'Zach')"
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
                    {filteredUsers.length > 0 ? (
                      <div className="space-y-1">
                        {filteredUsers.map((user) => (
                          <Button
                            key={user.id}
                            variant="ghost"
                            className="w-full justify-start p-2 h-auto"
                            onClick={() => handleSubjectSelect(user)}
                          >
                            <div className="text-left">
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">
                                {user.employeeNumber} • {user.jobTitle}
                              </div>
                            </div>
                          </Button>
                        ))}
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
                      <Label className="text-sm font-medium text-gray-600">Name</Label>
                      <p className="font-semibold">{formData.subjectEmployee.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Employee Number</Label>
                      <p className="font-semibold">{formData.subjectEmployee.employeeNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Job Title</Label>
                      <p className="font-semibold">{formData.subjectEmployee.jobTitle}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Department</Label>
                      <p className="font-semibold">{formData.subjectEmployee.department}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Manager</Label>
                      <p className="font-semibold">{formData.subjectEmployee.manager}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Contact</Label>
                      <p className="font-semibold">{formData.subjectEmployee.phone}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, subjectEmployee: null })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <Label htmlFor="relationship">Your Relationship to Subject</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct-report">Direct Report</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="peer">Peer/Colleague</SelectItem>
                <SelectItem value="witness">Witness</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Incident Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2 text-green-500" />
            Incident Details
          </CardTitle>
          <CardDescription>
            Detailed information about what happened
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="incident-date" className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Incident Date *
              </Label>
              <Input
                id="incident-date"
                type="date"
                value={formData.incidentDate}
                onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="knowledge-date" className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Date of Knowledge *
              </Label>
              <Input
                id="knowledge-date"
                type="date"
                value={formData.dateOfKnowledge}
                onChange={(e) => setFormData({ ...formData, dateOfKnowledge: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">When the company was notified</p>
            </div>
          </div>

          <div>
            <Label htmlFor="location">
              <MapPin className="w-4 h-4 mr-1 inline" />
              Location *
            </Label>
            <Input
              id="location"
              placeholder="Where did this incident occur?"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="concern-type">Type of Violation/Concern *</Label>
            <Select value={formData.concernType} onValueChange={(value: string) => setFormData({ ...formData, concernType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select the type of concern" />
              </SelectTrigger>
              <SelectContent>
                {CONCERN_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide a detailed description of what happened. Include specific dates, times, locations, and any witnesses if applicable"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
            />
          </div>

          <div>
            <Label className="flex items-center mb-3">
              <Users className="w-4 h-4 mr-1" />
              Witnesses
            </Label>
            
            {/* Employee Witness Search */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm">Add Employee Witness</Label>
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
                        {filteredWitnessUsers.length > 0 ? (
                          <div className="space-y-1">
                            {filteredWitnessUsers.map((user) => (
                              <Button
                                key={user.id}
                                variant="ghost"
                                className="w-full justify-start p-2 h-auto"
                                onClick={() => handleWitnessSelect(user)}
                                disabled={formData.witnesses.find(w => w.id === user.id) !== undefined}
                              >
                                <div className="text-left">
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {user.employeeNumber} • {user.jobTitle}
                                  </div>
                                </div>
                              </Button>
                            ))}
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
              <div className="border-t pt-3">
                <Label className="text-sm">Add External Witness (passengers, etc.)</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    placeholder="Witness name"
                    value={externalWitnessName}
                    onChange={(e) => setExternalWitnessName(e.target.value)}
                  />
                  <Input
                    placeholder="Contact info/details (optional)"
                    value={externalWitnessDetails}
                    onChange={(e) => setExternalWitnessDetails(e.target.value)}
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
                  <Label className="text-sm font-medium">Added Witnesses:</Label>
                  {formData.witnesses.map((witness) => (
                    <div key={witness.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div>
                        <span className="font-medium">{witness.name}</span>
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
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label className="flex items-center mb-3">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Urgency Level *
            </Label>
            <RadioGroup 
              value={formData.urgencyLevel} 
              onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, urgencyLevel: value })}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg bg-green-50">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="flex-1 cursor-pointer">
                  <div className="font-medium text-green-800">Low - No immediate safety concerns</div>
                  <div className="text-sm text-green-600">Standard processing timeline</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg bg-yellow-50">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="flex-1 cursor-pointer">
                  <div className="font-medium text-yellow-800">Medium - Ongoing situation that needs attention</div>
                  <div className="text-sm text-yellow-600">Expedited review required</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg bg-red-50">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="flex-1 cursor-pointer">
                  <div className="font-medium text-red-800">High - Immediate safety or legal concern</div>
                  <div className="text-sm text-red-600">Urgent response required</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Supporting Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2 text-purple-500" />
            Supporting Documentation
          </CardTitle>
          <CardDescription>
            Upload any relevant files, emails, photos, or other evidence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <Button variant="outline">
                Choose Files
              </Button>
              <p className="text-sm text-gray-500">
                Drag and drop files here, or click to select files
              </p>
              <p className="text-xs text-gray-400">
                Supported formats: PDF, DOC, DOCX, JPG, PNG, MP3, MP4 (Max 10MB each)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confidentiality Notice */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <input type="checkbox" id="confidential" className="mt-1" />
              <Label htmlFor="confidential" className="text-sm">
                I understand that this information will be kept confidential to the extent possible and will only be shared with those who need to know for investigation purposes.
              </Label>
            </div>
            <div className="flex items-start space-x-2">
              <input type="checkbox" id="retaliation" className="mt-1" />
              <Label htmlFor="retaliation" className="text-sm">
                I understand that retaliation against anyone who reports concerns in good faith is prohibited and will not be tolerated.
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Shield className="w-4 h-4 text-green-500" />
          <span>Secure & Confidential</span>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => handleSubmit(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSubmit(false)}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Submit Report
          </Button>
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-blue-800">
            By submitting this report, you acknowledge that the information provided is accurate to the best of your knowledge. 
            You will receive a confirmation email with your case number within 24 hours.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
