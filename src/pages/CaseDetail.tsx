import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus
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

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 36) return 'bg-red-100 text-red-800';
    if (riskScore >= 16) return 'bg-orange-100 text-orange-800';
    if (riskScore >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cases
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{case_.primaryCaseId}</h1>
            <p className="text-muted-foreground">{case_.secondaryCaseId}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Case
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(case_.status)}>
              {case_.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getRiskColor(case_.riskScore)}>
              Risk Score: {case_.riskScore}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DOK</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {new Date(case_.dok).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.floor((Date.now() - new Date(case_.dok).getTime()) / (1000 * 60 * 60 * 24))} days ago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investigator</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{case_.investigatorId}</div>
            <p className="text-xs text-muted-foreground">{case_.baseLocation}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks?.length || 0})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({notes?.length || 0})</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="sla">SLA Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Case Details */}
            <Card>
              <CardHeader>
                <CardTitle>Case Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employee</label>
                    <p className="text-sm">{case_.employeeFirstName} {case_.employeeLastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                    <p className="text-sm">{case_.employeeId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Union Group</label>
                    <p className="text-sm">{case_.unionGroup}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Violation Type</label>
                    <p className="text-sm">{case_.violationType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Incident Date</label>
                    <p className="text-sm">{new Date(case_.incidentDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reported Date</label>
                    <p className="text-sm">{new Date(case_.reportedDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {case_.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm mt-1">{case_.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{case_.severity}</div>
                    <div className="text-sm text-muted-foreground">Severity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{case_.likelihood}</div>
                    <div className="text-sm text-muted-foreground">Likelihood</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{case_.riskScore}</div>
                    <div className="text-sm text-muted-foreground">Risk Score</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Risk Level</span>
                    <span>{case_.riskScore >= 36 ? 'Critical' : case_.riskScore >= 16 ? 'High' : case_.riskScore >= 6 ? 'Medium' : 'Low'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getRiskColor(case_.riskScore).replace('text-', 'bg-').replace('100', '500')}`}
                      style={{ width: `${Math.min(case_.riskScore, 50)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Case Timeline</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8 text-muted-foreground">
              Timeline view will be implemented in the next phase
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SLA Tracking</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8 text-muted-foreground">
              SLA tracking details will be implemented in the next phase
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
