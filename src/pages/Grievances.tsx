import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Search, Plus, Filter, Eye, Scale, Clock, AlertTriangle, FileText } from 'lucide-react';
import { Grievance, GrievanceSearchFilters, GrievanceStatus, GrievanceType } from '../types';
import { getGrievances } from '../data/mockGrievanceData';

export function Grievances() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Fetch grievances with current filters
  const { data: grievancesResult, isLoading, refetch } = useQuery({
    queryKey: ['grievances', currentPage, searchTerm],
    queryFn: () => {
      const searchFilters: GrievanceSearchFilters = {
        searchTerm: searchTerm || undefined,
      };
      return getGrievances(searchFilters, currentPage, pageSize);
    },
  });

  const grievances = grievancesResult?.data || [];
  const totalGrievances = grievancesResult?.total || 0;

  const getStatusBadge = (status: GrievanceStatus) => {
    const variants: Record<GrievanceStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      [GrievanceStatus.Filed]: 'outline',
      [GrievanceStatus.UnderReview]: 'default',
      [GrievanceStatus.Hearing]: 'default',
      [GrievanceStatus.Decision]: 'secondary',
      [GrievanceStatus.Appeal]: 'default',
      [GrievanceStatus.Closed]: 'secondary',
    };

    return (
      <Badge variant={variants[status]}>
        {status.replace(/([A-Z])/g, ' $1').trim()}
      </Badge>
    );
  };

  const getTypeBadge = (type: GrievanceType) => {
    return (
      <Badge variant={type === GrievanceType.PostDisciplinary ? 'destructive' : 'default'}>
        {type === GrievanceType.PostDisciplinary ? 'Post-Disciplinary' : 'Contract'}
      </Badge>
    );
  };

  const getStepBadge = (step: number) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 'bg-red-100 text-red-800'];
    return (
      <Badge className={colors[step - 1] || 'bg-gray-100 text-gray-800'}>
        Step {step}
      </Badge>
    );
  };

  const isNearingDeadline = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const isOverdue = (dueDate: Date) => {
    return new Date() > new Date(dueDate);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Grievances</h1>
          <p className="text-muted-foreground">Manage union grievances and appeals</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => refetch()}>
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Grievance
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Grievances</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGrievances}</div>
            <p className="text-xs text-muted-foreground">All grievances in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grievances.filter((g: Grievance) => 
                g.status !== GrievanceStatus.Closed
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently in process</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Post-Disciplinary</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grievances.filter((g: Grievance) => g.type === GrievanceType.PostDisciplinary).length}
            </div>
            <p className="text-xs text-muted-foreground">Challenging discipline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nearing Deadline</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grievances.filter((g: Grievance) => isNearingDeadline(g.currentStepDueDate)).length}
            </div>
            <p className="text-xs text-muted-foreground">Within 3 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Grievances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search grievances by number, employee, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grievances Table */}
      <Card>
        <CardHeader>
          <CardTitle>Union Grievances</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">Loading grievances...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grievance #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Step</TableHead>
                  <TableHead>Filed Date</TableHead>
                  <TableHead>Current Deadline</TableHead>
                  <TableHead>Union Rep</TableHead>
                  <TableHead>Linked Case</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grievances.map((grievance: Grievance) => {
                  const daysUntilDeadline = Math.ceil(
                    (new Date(grievance.currentStepDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  const isOverdueDeadline = isOverdue(grievance.currentStepDueDate);
                  const isNearDeadline = isNearingDeadline(grievance.currentStepDueDate);

                  return (
                    <TableRow key={grievance.id}>
                      <TableCell className="font-medium">
                        {grievance.grievanceNumber}
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(grievance.type)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{grievance.employeeKey}</span>
                          <span className="text-xs text-muted-foreground">Employee Key</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(grievance.status)}
                      </TableCell>
                      <TableCell>
                        {getStepBadge(grievance.step)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{new Date(grievance.filingDate).toLocaleDateString()}</span>
                          <span className="text-xs text-muted-foreground">
                            {Math.floor((Date.now() - new Date(grievance.filingDate).getTime()) / (1000 * 60 * 60 * 24))} days ago
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm">{new Date(grievance.currentStepDueDate).toLocaleDateString()}</span>
                          {isOverdueDeadline ? (
                            <Badge variant="destructive" className="flex items-center text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Overdue
                            </Badge>
                          ) : isNearDeadline ? (
                            <Badge variant="default" className="bg-yellow-500 flex items-center text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {daysUntilDeadline}d
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {daysUntilDeadline}d
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{grievance.unionRepresentative}</span>
                      </TableCell>
                      <TableCell>
                        {grievance.linkedCaseId ? (
                          <Link to={`/cases/${grievance.linkedCaseId}`} className="text-blue-600 hover:underline">
                            <Badge variant="outline" className="flex items-center">
                              <FileText className="h-3 w-3 mr-1" />
                              Linked
                            </Badge>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link to={`/grievances/${grievance.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalGrievances)} of {totalGrievances} grievances
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={currentPage * pageSize >= totalGrievances}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
