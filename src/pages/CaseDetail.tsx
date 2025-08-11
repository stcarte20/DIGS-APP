import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  MessageSquare, 
  Paperclip, 
  Clock, 
  User, 
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  Shield
} from 'lucide-react';
import { Task, Note } from '../types';
import { getCaseById, getTasksByCaseId, getNotesByCaseId } from '../data/mockCaseData';

export function CaseDetail() {
  const { id } = useParams<{ id: string }>();

  // Fetch case details
  const { data: case_, isLoading: caseLoading } = useQuery({
    queryKey: ['case', id],
    queryFn: () => getCaseById(id!),
    enabled: !!id,
  });

  // Fetch case tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['case-tasks', id],
    queryFn: () => getTasksByCaseId(id!),
    enabled: !!id,
  });

  // Fetch case notes
  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ['case-notes', id],
    queryFn: () => getNotesByCaseId(id!),
    enabled: !!id,
  });

  if (caseLoading) {
    return <div className="flex items-center justify-center h-64">Loading case details...</div>;
  }

  if (!case_) {
    return <div className="text-center py-8">Case not found</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Investigation': return 'bg-yellow-100 text-yellow-800';
      case 'Closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      {/* Header - Compact */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 lg:p-4 bg-gray-50 border border-gray-100 rounded-lg">
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => window.history.back()} className="h-8 lg:h-10 px-3 lg:px-4 text-xs lg:text-sm">
            <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" size="sm" className="h-8 lg:h-10 px-3 lg:px-4 text-xs lg:text-sm">
            <Edit className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
            Edit Case
          </Button>
          <Button size="sm" className="h-8 lg:h-10 px-3 lg:px-4 text-xs lg:text-sm">
            <FileText className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
            Report
          </Button>
        </div>
      </div>

      {/* Main Content Layout - Optimized for standard monitors */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
        {/* Main Content Tabs - Takes 3/4 of the space */}
        <div className="lg:col-span-3">
          {/* Enhanced Header Section - Compact */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {`${case_.employeeLastName}, ${case_.employeeFirstName} ${case_.employeeId}`}
                      </h1>
                      <Badge className="bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium">
                        {case_.concernType || case_.violationType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>PRM Docket: AFA-{case_.id}</span>
                      <span>•</span>
                      <span>DOK: {new Date(case_.dateOfKnowledge || case_.dok).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{Math.floor((Date.now() - new Date(case_.dateOfKnowledge || case_.dok).getTime()) / (1000 * 60 * 60 * 24))} days elapsed</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* PRM Docket Status */}
                    <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/50">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">On PRM Docket:</span>
                      </div>
                      <button 
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                          case_.isPrmCase ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          case_.isPrmCase ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Status Indicators - Improved styling */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mt-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-white/60 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</span>
                      <CheckCircle className="h-4 w-4 text-gray-400" />
                    </div>
                    <Badge className={`${getStatusColor(case_.status)} text-sm px-3 py-1`}>
                      {case_.status}
                    </Badge>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-white/60 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">SLA Status</span>
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-bold text-gray-900">
                        {(() => {
                          const dokDate = new Date(case_.dateOfKnowledge || case_.dok);
                          const today = new Date();
                          let businessDays = 0;
                          const currentDate = new Date(dokDate);
                          
                          while (currentDate <= today) {
                            const dayOfWeek = currentDate.getDay();
                            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                              businessDays++;
                            }
                            currentDate.setDate(currentDate.getDate() + 1);
                          }
                          
                          const elapsed = businessDays - 1;
                          const remaining = Math.max(0, 12 - elapsed);
                          
                          return `${remaining} days left`;
                        })()}
                      </div>
                      <Badge className={`text-xs px-2 py-1 ${(() => {
                        const dokDate = new Date(case_.dateOfKnowledge || case_.dok);
                        const today = new Date();
                        let businessDays = 0;
                        const currentDate = new Date(dokDate);
                        
                        while (currentDate <= today) {
                          const dayOfWeek = currentDate.getDay();
                          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                            businessDays++;
                          }
                          currentDate.setDate(currentDate.getDate() + 1);
                        }
                        
                        const elapsed = businessDays - 1;
                        return elapsed > 12 ? 'bg-red-100 text-red-800' : 
                               elapsed > 10 ? 'bg-orange-100 text-orange-800' : 
                               elapsed > 8 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
                      })()}`}>
                        {(() => {
                          const dokDate = new Date(case_.dateOfKnowledge || case_.dok);
                          const today = new Date();
                          let businessDays = 0;
                          const currentDate = new Date(dokDate);
                          
                          while (currentDate <= today) {
                            const dayOfWeek = currentDate.getDay();
                            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                              businessDays++;
                            }
                            currentDate.setDate(currentDate.getDate() + 1);
                          }
                          
                          const elapsed = businessDays - 1;
                          return elapsed > 12 ? 'Overdue' : 
                                 elapsed > 10 ? 'Critical' : 
                                 elapsed > 8 ? 'Warning' : 'On Track';
                        })()}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-white/60 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">DOK</span>
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {new Date(case_.dok).toLocaleDateString()}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {Math.floor((Date.now() - new Date(case_.dok).getTime()) / (1000 * 60 * 60 * 24))} days ago
                    </p>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-white/60 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Investigator</span>
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="text-sm font-bold text-gray-900">{case_.investigatorId}</div>
                    <p className="text-xs text-gray-600 mt-1">{case_.baseLocation}</p>
                  </div>
                </div>
                
                {/* Special Flags */}
                {(case_.foiNeeded || case_.contextTags?.length > 0) && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-blue-200">
                    {case_.foiNeeded && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                        <FileText className="h-3 w-3 mr-1" />
                        FOI Required
                      </Badge>
                    )}
                    {case_.contextTags?.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-50 text-gray-600 text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {case_.contextTags && case_.contextTags.length > 3 && (
                      <Badge variant="outline" className="bg-gray-50 text-gray-500 text-xs">
                        +{case_.contextTags.length - 3} more tags
                      </Badge>
                    )}
                  </div>
                )}
              </div>
          
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({tasks?.length || 0})</TabsTrigger>
              <TabsTrigger value="notes">Notes ({notes?.length || 0})</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
              <TabsTrigger value="sla">SLA Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Subject Employee - Left Column */}
                <Card className="xl:col-span-1 border-l-4 border-l-blue-500 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5 text-blue-600" />
                      Subject Employee
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Employee Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <div className="font-semibold text-blue-900 text-lg">
                        {case_.subjectEmployee?.name || `${case_.employeeFirstName} ${case_.employeeLastName}`}
                      </div>
                      <div className="text-sm text-blue-700 font-medium">
                        Employee ID: {case_.subjectEmployee?.id || case_.employeeId}
                      </div>
                    </div>
                    
                    {/* Employee Details */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-1 text-sm">
                        <span className="text-gray-500 font-medium">Email:</span>
                        <span className="col-span-2 font-medium break-all">{case_.subjectEmployee?.email || 'Not available'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-sm">
                        <span className="text-gray-500 font-medium">Title:</span>
                        <span className="col-span-2 font-medium">{case_.subjectEmployee?.jobTitle || 'Not available'}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-sm">
                        <span className="text-gray-500 font-medium">Department:</span>
                        <span className="col-span-2 font-medium">{case_.subjectEmployee?.department || 'Not available'}</span>
                      </div>
                      {case_.subjectEmployee?.officeLocation && (
                        <div className="grid grid-cols-3 gap-1 text-sm">
                          <span className="text-gray-500 font-medium">Location:</span>
                          <span className="col-span-2 font-medium">{case_.subjectEmployee.officeLocation}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Manager Information */}
                    {case_.subjectEmployee?.manager && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-1 mb-2">
                          <User className="h-3 w-3 text-gray-500" />
                          <span className="text-xs font-medium text-gray-600">Direct Manager</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-medium text-sm">{case_.subjectEmployee.manager.name}</div>
                          <div className="text-xs text-gray-600">{case_.subjectEmployee.manager.jobTitle}</div>
                          <div className="text-xs text-gray-500">{case_.subjectEmployee.manager.email}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Case Information - Center Column */}
                <Card className="xl:col-span-2 border-l-4 border-l-orange-500 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-orange-600" />
                      Case Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Description - Larger text area */}
                    {case_.description && (
                      <div className="border rounded-lg p-4">
                        <label className="text-sm font-medium text-gray-700 block mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Incident Description
                        </label>
                        <div className="bg-gray-50 p-4 rounded-lg border min-h-[200px]">
                          <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">{case_.description}</p>
                        </div>
                      </div>
                    )}

                    {/* Case Details Grid - Secondary information */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-gray-50 p-2 rounded">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Concern Type</label>
                        <p className="text-xs font-medium mt-1 text-gray-800">{case_.concernType || case_.violationType}</p>
                      </div>
                      
                      {case_.location && (
                        <div className="bg-gray-50 p-2 rounded">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</label>
                          <p className="text-xs font-medium mt-1 text-gray-800">{case_.location}</p>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 p-2 rounded">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Modified</label>
                        <p className="text-xs font-medium mt-1 text-gray-800">
                          {case_.modifiedOn ? new Date(case_.modifiedOn).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                      
                      {case_.submitterInfo && (
                        <div className="bg-gray-50 p-2 rounded">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Submitted By</label>
                          <p className="text-xs font-medium mt-1 text-gray-800">{case_.submitterInfo.name}</p>
                        </div>
                      )}
                    </div>

                    {/* Context Tags */}
                    {case_.contextTags && case_.contextTags.length > 0 && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Context Tags</label>
                        <div className="flex flex-wrap gap-1">
                          {case_.contextTags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Witnesses Section - Compact Design */}
              {case_.witnesses && case_.witnesses.length > 0 && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Witnesses ({case_.witnesses.length})
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {case_.witnesses.filter(w => w.type === 'employee').length} Employee • {case_.witnesses.filter(w => w.type === 'external').length} External
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Compact Witness List */}
                    <div className="space-y-3">
                      {case_.witnesses.map((witness) => (
                        <div key={witness.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              <Badge variant={witness.type === 'employee' ? 'default' : 'secondary'} className="text-xs">
                                {witness.type === 'employee' ? 'EMP' : 'EXT'}
                              </Badge>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm truncate">
                                {witness.displayName || witness.name}
                              </div>
                              <div className="text-xs text-gray-600 truncate">
                                {witness.mail && <span>{witness.mail}</span>}
                                {witness.details && <span className="ml-2">• {witness.details}</span>}
                              </div>
                            </div>
                          </div>
                          
                          {/* Manager info - compact */}
                          {witness.type === 'employee' && witness.manager && (
                            <div className="flex-shrink-0 text-right">
                              <div className="text-xs text-gray-500">Manager:</div>
                              <div className="text-xs font-medium">{witness.manager.name}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Show more if there are many witnesses */}
                    {case_.witnesses.length > 5 && (
                      <div className="mt-4 text-center">
                        <Button variant="outline" size="sm">
                          <Users className="h-3 w-3 mr-1" />
                          View All {case_.witnesses.length} Witnesses
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Case Tasks</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
              
              <Card>
                <CardContent>
                  {tasksLoading ? (
                    <div className="text-center py-8">Loading tasks...</div>
                  ) : tasks && tasks.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Task</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Assigned To</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tasks.map((task: Task) => (
                          <TableRow key={task.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{task.title}</div>
                                <div className="text-sm text-muted-foreground">{task.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={task.status === 'Completed' ? 'default' : 'secondary'}>
                                {task.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={task.priority === 'High' ? 'destructive' : 'outline'}>
                                {task.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>{task.ownerId}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">Edit</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No tasks found for this case
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Case Notes</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>

              <div className="space-y-4">
                {notesLoading ? (
                  <div className="text-center py-8">Loading notes...</div>
                ) : notes && notes.length > 0 ? (
                  notes.map((note: Note) => (
                    <Card key={note.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4" />
                            <CardTitle className="text-base">{note.subject}</CardTitle>
                            <Badge variant="outline">{note.noteCategory}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(note.createdOn).toLocaleString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{note.body}</p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          By: {note.authorId}
                          {note.followUpFlag && (
                            <span className="ml-2">
                              • Follow-up: {note.followUpDate ? new Date(note.followUpDate).toLocaleDateString() : 'Required'}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-8 text-muted-foreground">
                      No notes found for this case
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="evidence" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Evidence & Documents</h3>
                <Button>
                  <Paperclip className="h-4 w-4 mr-2" />
                  Upload Evidence
                </Button>
              </div>
              
              <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                  Evidence management will be implemented in the next phase
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sla" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>SLA Tracking (AFA Timeline)</CardTitle>
                  <CardDescription>
                    12 Business Day Rule - Investigation must be completed within 12 business days from DOK
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg bg-blue-50">
                        <div className="text-2xl font-bold text-blue-600">
                          {(() => {
                            const dokDate = new Date(case_.dateOfKnowledge || case_.dok);
                            const today = new Date();
                            const diffTime = today.getTime() - dokDate.getTime();
                            return Math.floor(diffTime / (1000 * 60 * 60 * 24));
                          })()}
                        </div>
                        <div className="text-sm text-muted-foreground">Calendar Days Since DOK</div>
                      </div>
                      
                      <div className="text-center p-4 border rounded-lg bg-yellow-50">
                        <div className="text-2xl font-bold text-yellow-600">
                          {(() => {
                            const dokDate = new Date(case_.dateOfKnowledge || case_.dok);
                            const today = new Date();
                            let businessDays = 0;
                            const currentDate = new Date(dokDate);
                            
                            while (currentDate <= today) {
                              const dayOfWeek = currentDate.getDay();
                              if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
                                businessDays++;
                              }
                              currentDate.setDate(currentDate.getDate() + 1);
                            }
                            
                            return businessDays - 1; // Don't count today if it's incomplete
                          })()}
                        </div>
                        <div className="text-sm text-muted-foreground">Business Days Elapsed</div>
                      </div>
                      
                      <div className="text-center p-4 border rounded-lg bg-green-50">
                        <div className="text-2xl font-bold text-green-600">12</div>
                        <div className="text-sm text-muted-foreground">AFA Required Days</div>
                      </div>
                      
                      <div className="text-center p-4 border rounded-lg">
                        <div className={`text-2xl font-bold ${
                          (() => {
                            const dokDate = new Date(case_.dateOfKnowledge || case_.dok);
                            const today = new Date();
                            let businessDays = 0;
                            const currentDate = new Date(dokDate);
                            
                            while (currentDate <= today) {
                              const dayOfWeek = currentDate.getDay();
                              if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                                businessDays++;
                              }
                              currentDate.setDate(currentDate.getDate() + 1);
                            }
                            
                            const remaining = 12 - (businessDays - 1);
                            return remaining < 0 ? 'text-red-600' : remaining <= 2 ? 'text-orange-600' : 'text-green-600';
                          })()
                        }`}>
                          {(() => {
                            const dokDate = new Date(case_.dateOfKnowledge || case_.dok);
                            const today = new Date();
                            let businessDays = 0;
                            const currentDate = new Date(dokDate);
                            
                            while (currentDate <= today) {
                              const dayOfWeek = currentDate.getDay();
                              if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                                businessDays++;
                              }
                              currentDate.setDate(currentDate.getDate() + 1);
                            }
                            
                            return Math.max(0, 12 - (businessDays - 1));
                          })()}
                        </div>
                        <div className="text-sm text-muted-foreground">Business Days Remaining</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Investigation Progress</span>
                        <span>
                          {(() => {
                            const dokDate = new Date(case_.dateOfKnowledge || case_.dok);
                            const today = new Date();
                            let businessDays = 0;
                            const currentDate = new Date(dokDate);
                            
                            while (currentDate <= today) {
                              const dayOfWeek = currentDate.getDay();
                              if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                                businessDays++;
                              }
                              currentDate.setDate(currentDate.getDate() + 1);
                            }
                            
                            const progress = Math.min(((businessDays - 1) / 12) * 100, 100);
                            return `${Math.round(progress)}%`;
                          })()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full transition-all duration-300 ${
                            (() => {
                              const dokDate = new Date(case_.dateOfKnowledge || case_.dok);
                              const today = new Date();
                              let businessDays = 0;
                              const currentDate = new Date(dokDate);
                              
                              while (currentDate <= today) {
                                const dayOfWeek = currentDate.getDay();
                                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                                  businessDays++;
                                }
                                currentDate.setDate(currentDate.getDate() + 1);
                              }
                              
                              const elapsed = businessDays - 1;
                              return elapsed > 12 ? 'bg-red-500' : 
                                     elapsed > 10 ? 'bg-orange-500' : 
                                     elapsed > 8 ? 'bg-yellow-500' : 'bg-green-500';
                            })()
                          }`}
                          style={{ 
                            width: `${Math.min((() => {
                              const dokDate = new Date(case_.dateOfKnowledge || case_.dok);
                              const today = new Date();
                              let businessDays = 0;
                              const currentDate = new Date(dokDate);
                              
                              while (currentDate <= today) {
                                const dayOfWeek = currentDate.getDay();
                                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                                  businessDays++;
                                }
                                currentDate.setDate(currentDate.getDate() + 1);
                              }
                              
                              return ((businessDays - 1) / 12) * 100;
                            })(), 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Deadline Calculator */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">AFA Deadline Calculator</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Date of Knowledge (DOK)</label>
                          <p className="text-sm font-semibold">
                            {new Date(case_.dateOfKnowledge || case_.dok).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">12 Business Day Deadline</label>
                          <p className="text-sm font-semibold">
                            {(() => {
                              const dokDate = new Date(case_.dateOfKnowledge || case_.dok);
                              let businessDays = 0;
                              const currentDate = new Date(dokDate);
                              
                              while (businessDays < 12) {
                                currentDate.setDate(currentDate.getDate() + 1);
                                const dayOfWeek = currentDate.getDay();
                                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                                  businessDays++;
                                }
                              }
                              
                              return currentDate.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              });
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* SLA Status Alert */}
                    {(() => {
                      const dokDate = new Date(case_.dateOfKnowledge || case_.dok);
                      const today = new Date();
                      let businessDays = 0;
                      const currentDate = new Date(dokDate);
                      
                      while (currentDate <= today) {
                        const dayOfWeek = currentDate.getDay();
                        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                          businessDays++;
                        }
                        currentDate.setDate(currentDate.getDate() + 1);
                      }
                      
                      const elapsed = businessDays - 1;
                      const remaining = 12 - elapsed;
                      
                      if (remaining < 0) {
                        return (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                              <div>
                                <h4 className="font-semibold text-red-800">SLA OVERDUE</h4>
                                <p className="text-sm text-red-700">
                                  This case is {Math.abs(remaining)} business days past the 12-day AFA deadline.
                                  Immediate action required.
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      } else if (remaining <= 2) {
                        return (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <Clock className="h-5 w-5 text-orange-600 mr-2" />
                              <div>
                                <h4 className="font-semibold text-orange-800">URGENT - SLA WARNING</h4>
                                <p className="text-sm text-orange-700">
                                  Only {remaining} business day{remaining === 1 ? '' : 's'} remaining to meet AFA deadline.
                                  Priority action needed.
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      } else if (remaining <= 4) {
                        return (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                              <div>
                                <h4 className="font-semibold text-yellow-800">SLA ATTENTION</h4>
                                <p className="text-sm text-yellow-700">
                                  {remaining} business days remaining until AFA deadline.
                                  Please ensure progress is on track.
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                              <div>
                                <h4 className="font-semibold text-green-800">SLA ON TRACK</h4>
                                <p className="text-sm text-green-700">
                                  {remaining} business days remaining until AFA deadline. 
                                  Investigation is progressing within timeline.
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Enhanced Timeline Sidebar - Takes 1/4 of the space */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Case Timeline
              </CardTitle>
              <CardDescription>
                Key events and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Timeline Items */}
                <div className="relative">
                  <div className="absolute left-2 top-2 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {/* Case Submitted */}
                  <div className="relative flex items-start space-x-3 pb-4">
                    <div className="flex-shrink-0">
                      <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">Case Submitted</div>
                      <div className="text-xs text-gray-500">
                        {new Date(case_.createdOn).toLocaleDateString()}
                      </div>
                      {case_.submitterInfo && (
                        <div className="text-xs text-gray-400">
                          By: {case_.submitterInfo.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Date of Knowledge */}
                  <div className="relative flex items-start space-x-3 pb-4">
                    <div className="flex-shrink-0">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">Investigation Started</div>
                      <div className="text-xs text-gray-500">
                        {new Date(case_.dateOfKnowledge || case_.dok).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        DOK Established
                      </div>
                    </div>
                  </div>
                  
                  {/* Investigator Assigned */}
                  {case_.investigatorId && (
                    <div className="relative flex items-start space-x-3 pb-4">
                      <div className="flex-shrink-0">
                        <div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900">Investigator Assigned</div>
                        <div className="text-xs text-gray-500">
                          {case_.investigatorId}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Status Updates */}
                  {case_.status !== 'New' && (
                    <div className="relative flex items-start space-x-3 pb-4">
                      <div className="flex-shrink-0">
                        <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900">Status Updated</div>
                        <div className="text-xs text-gray-500">
                          {case_.status.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {case_.modifiedOn ? new Date(case_.modifiedOn).toLocaleDateString() : 'Unknown date'}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Tasks Progress */}
                  {tasks && tasks.length > 0 && (
                    <div className="relative flex items-start space-x-3 pb-4">
                      <div className="flex-shrink-0">
                        <div className="w-4 h-4 bg-indigo-500 rounded-full border-2 border-white shadow"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900">Tasks Progress</div>
                        <div className="text-xs text-gray-500">
                          {tasks.filter(task => task.status === 'Completed').length} of {tasks.length} completed
                        </div>
                        <div className="text-xs text-gray-400">
                          {tasks.filter(task => task.status === 'Completed').length === tasks.length ? 'All tasks complete' : 'In progress'}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Latest Note */}
                  {notes && notes.length > 0 && (
                    <div className="relative flex items-start space-x-3 pb-4">
                      <div className="flex-shrink-0">
                        <div className="w-4 h-4 bg-teal-500 rounded-full border-2 border-white shadow"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900">Latest Note</div>
                        <div className="text-xs text-gray-500">
                          {notes[0]?.subject || 'Note added'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(Math.max(...notes.map(note => new Date(note.createdOn).getTime()))).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* SLA Milestone Markers */}
                  {(() => {
                    const dokDate = new Date(case_.dateOfKnowledge || case_.dok);
                    const today = new Date();
                    let businessDays = 0;
                    const currentDate = new Date(dokDate);
                    
                    while (currentDate <= today) {
                      const dayOfWeek = currentDate.getDay();
                      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                        businessDays++;
                      }
                      currentDate.setDate(currentDate.getDate() + 1);
                    }
                    
                    const elapsed = businessDays - 1;
                    
                    // 5-day milestone
                    if (elapsed >= 5) {
                      return (
                        <div className="relative flex items-start space-x-3 pb-4">
                          <div className="flex-shrink-0">
                            <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow"></div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900">5-Day Milestone</div>
                            <div className="text-xs text-gray-500">
                              Midpoint reached
                            </div>
                            <div className="text-xs text-gray-400">
                              7 days remaining
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    // 10-day warning
                    if (elapsed >= 10) {
                      return (
                        <div className="relative flex items-start space-x-3 pb-4">
                          <div className="flex-shrink-0">
                            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900">10-Day Warning</div>
                            <div className="text-xs text-gray-500">
                              Critical deadline approaching
                            </div>
                            <div className="text-xs text-gray-400">
                              {Math.max(0, 12 - elapsed)} days remaining
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    return null;
                  })()}
                  
                  {/* Future Deadline Marker */}
                  <div className="relative flex items-start space-x-3 pb-4">
                    <div className="flex-shrink-0">
                      <div className={`w-4 h-4 rounded-full border-2 border-white shadow ${
                        (() => {
                          const dokDate = new Date(case_.dateOfKnowledge || case_.dok);
                          const today = new Date();
                          let businessDays = 0;
                          const currentDate = new Date(dokDate);
                          
                          while (currentDate <= today) {
                            const dayOfWeek = currentDate.getDay();
                            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                              businessDays++;
                            }
                            currentDate.setDate(currentDate.getDate() + 1);
                          }
                          
                          const elapsed = businessDays - 1;
                          return elapsed >= 12 ? 'bg-red-600' : 'bg-gray-300';
                        })()
                      }`}></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">AFA Deadline</div>
                      <div className="text-xs text-gray-500">
                        {(() => {
                          const dokDate = new Date(case_.dateOfKnowledge || case_.dok);
                          let businessDays = 0;
                          const currentDate = new Date(dokDate);
                          
                          while (businessDays < 12) {
                            currentDate.setDate(currentDate.getDate() + 1);
                            const dayOfWeek = currentDate.getDay();
                            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                              businessDays++;
                            }
                          }
                          
                          return currentDate.toLocaleDateString();
                        })()}
                      </div>
                      <div className="text-xs text-gray-400">
                        12 business days from DOK
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Plus className="h-3 w-3 mr-2" />
                      Add Timeline Event
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Clock className="h-3 w-3 mr-2" />
                      Calculate SLA Extension
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
