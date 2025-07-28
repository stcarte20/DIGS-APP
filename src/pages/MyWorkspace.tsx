import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Users, 
  Bell,
  Plus,
  ChevronRight,
  Target,
  CalendarDays,
  Briefcase
} from 'lucide-react';
import { Task, CaseStatus, Case } from '../types';
import { getCases, getTasks } from '../data/mockCaseData';
import { getGrievancesForWorkspace } from '../data/mockGrievanceData';

// Mock current user - in production this would come from authentication
const CURRENT_USER = {
  id: 'user-1',
  name: 'John Investigator',
  role: 'Investigator',
  email: 'john.investigator@company.com'
};

export function MyWorkspace() {
  const navigate = useNavigate();
  
  // Fetch my assigned cases
  const { data: myCases, isLoading: casesLoading } = useQuery({
    queryKey: ['my-cases'],
    queryFn: () => getCases({ assignedTo: CURRENT_USER.id }),
  });

  // Fetch my tasks
  const { data: myTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => getTasks({ assignedTo: CURRENT_USER.id }),
  });

  // Fetch my grievances (if applicable to role)
  const { data: _myGrievances, isLoading: grievancesLoading } = useQuery({
    queryKey: ['my-grievances'],
    queryFn: () => getGrievancesForWorkspace(),
  });

  if (casesLoading || tasksLoading || grievancesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading your workspace...</div>
      </div>
    );
  }

  const activeCases = myCases?.data || [];
  const pendingTasks = myTasks?.data?.filter((task: Task) => task.status === 'Pending') || [];
  const overdueTasks = myTasks?.data?.filter((task: Task) => 
    task.status === 'Pending' && task.dueDate && new Date(task.dueDate) < new Date()
  ) || [];
  const upcomingMeetings = myTasks?.data?.filter((task: Task) => 
    task.type === 'meeting' && task.status === 'Pending'
  ) || [];

  // Items due for ERU (Evidence Relied Upon)
  const eruItems = activeCases.filter((caseItem: Case) => 
    caseItem.status === CaseStatus.PendingERU || 
    (caseItem.status === CaseStatus.Closed && !caseItem.eruCompleted)
  );

  // Cases requiring closeout meetings
  const closeoutRequired = activeCases.filter((caseItem: Case) => 
    caseItem.status === CaseStatus.Investigating && !caseItem.closeoutScheduled
  );

  // Priority notifications
  const priorityNotifications = [
    ...overdueTasks.map((task: Task) => ({
      id: task.id,
      type: 'overdue_task',
      message: `Task "${task.title}" is overdue`,
      priority: 'high',
      date: task.dueDate
    })),
    ...eruItems.map((caseItem: Case) => ({
      id: caseItem.id,
      type: 'eru_required',
      message: `ERU document required for Case ${caseItem.primaryCaseId}`,
      priority: 'medium',
      date: caseItem.closureDeadline
    })),
    ...closeoutRequired.map((caseItem: Case) => ({
      id: caseItem.id,
      type: 'closeout_meeting',
      message: `Schedule closeout meeting for Case ${caseItem.primaryCaseId}`,
      priority: 'medium',
      date: caseItem.investigationDeadline
    }))
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">My Workspace</h1>
          <p className="text-sm lg:text-base text-gray-600">Welcome back, {CURRENT_USER.name}</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" onClick={() => navigate('/calendar')} className="text-sm lg:text-base">
            <Calendar className="w-4 h-4 mr-2" />
            My Calendar
          </Button>
          <Button onClick={() => navigate('/intake')} className="text-sm lg:text-base">
            <Plus className="w-4 h-4 mr-2" />
            New Case
          </Button>
        </div>
      </div>

      {/* Priority Notifications - Compact */}
      {priorityNotifications.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-orange-800 text-lg">
              <Bell className="w-5 h-5 mr-2" />
              Priority Items ({priorityNotifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {priorityNotifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center">
                    <AlertTriangle className={`w-4 h-4 mr-2 ${
                      notification.priority === 'high' ? 'text-red-500' : 'text-orange-500'
                    }`} />
                    <span className="text-sm">{notification.message}</span>
                  </div>
                  <Badge variant={notification.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                    {notification.priority}
                  </Badge>
                </div>
              ))}
              {priorityNotifications.length > 3 && (
                <div className="text-sm text-gray-500 text-center pt-1">
                  +{priorityNotifications.length - 3} more items
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Cases</p>
                <p className="text-2xl font-bold">{activeCases.length}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-bold">{pendingTasks.length}</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Meetings</p>
                <p className="text-2xl font-bold">{upcomingMeetings.length}</p>
              </div>
              <CalendarDays className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ERU Items Due</p>
                <p className="text-2xl font-bold">{eruItems.length}</p>
              </div>
              <FileText className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* My Active Cases */}
        <Card>
          <CardHeader>
            <CardTitle>My Active Cases</CardTitle>
            <CardDescription>Cases currently assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            {activeCases.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active cases assigned</p>
            ) : (
              <div className="space-y-3">
                {activeCases.slice(0, 3).map((caseItem: Case) => (
                  <div key={caseItem.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{caseItem.primaryCaseId}</span>
                        <Badge variant={
                          caseItem.priority === 'High' ? 'destructive' :
                          caseItem.priority === 'Medium' ? 'default' : 'secondary'
                        }>
                          {caseItem.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{caseItem.description}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Due: {new Date(caseItem.investigationDeadline).toLocaleDateString()}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
                {activeCases.length > 3 && (
                  <div className="text-center">
                    <Button variant="ghost" size="sm">
                      View all {activeCases.length} cases
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tasks & Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks & Meetings</CardTitle>
            <CardDescription>Your schedule for the next few days</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming tasks</p>
            ) : (
              <div className="space-y-3">
                {pendingTasks.slice(0, 3).map((task: Task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {task.type === 'meeting' ? (
                          <Users className="w-4 h-4 text-blue-500" />
                        ) : (
                          <FileText className="w-4 h-4 text-green-500" />
                        )}
                        <span className="font-medium">{task.title}</span>
                        {task.dueDate && new Date(task.dueDate) < new Date() && (
                          <Badge variant="destructive">Overdue</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{task.description}</p>
                      {task.dueDate && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
                {pendingTasks.length > 3 && (
                  <div className="text-center">
                    <Button variant="ghost" size="sm">
                      View all {pendingTasks.length} tasks
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Items Requiring Action */}
        <Card>
          <CardHeader>
            <CardTitle>Items Requiring Action</CardTitle>
            <CardDescription>Cases and tasks that need your immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* ERU Items */}
              {eruItems.map((caseItem: Case) => (
                <div key={`eru-${caseItem.id}`} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">ERU Required: {caseItem.primaryCaseId}</span>
                    </div>
                    <p className="text-sm text-gray-600">Evidence Relied Upon document needed</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Complete ERU
                  </Button>
                </div>
              ))}

              {/* Closeout Meetings */}
              {closeoutRequired.map((caseItem: Case) => (
                <div key={`closeout-${caseItem.id}`} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Schedule Closeout: {caseItem.primaryCaseId}</span>
                    </div>
                    <p className="text-sm text-gray-600">Investigation complete, closeout meeting needed</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Schedule
                  </Button>
                </div>
              ))}

              {eruItems.length === 0 && closeoutRequired.length === 0 && (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500">All caught up! No immediate actions required.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity - Simplified */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start space-x-3 p-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Case DIGS-2024-001 updated</p>
                  <p className="text-xs text-gray-500">Status changed to "Investigating" • 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Witness interview completed</p>
                  <p className="text-xs text-gray-500">Case DIGS-2024-003 • 5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">ERU document submitted</p>
                  <p className="text-xs text-gray-500">Case DIGS-2024-002 • 1 day ago</p>
                </div>
              </div>
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm">View All Activity</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
