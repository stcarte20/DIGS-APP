import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Search, Plus, Filter, Eye, Clock, AlertTriangle } from 'lucide-react';
import { Case, CaseSearchFilters, CaseStatus } from '../types';
import { getCases } from '../data/mockCaseData';

export function Cases() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Fetch cases with current filters
  const { data: casesResult, isLoading, refetch } = useQuery({
    queryKey: ['cases', currentPage, searchTerm],
    queryFn: () => {
      const searchFilters: CaseSearchFilters = {
        searchTerm: searchTerm || undefined,
      };
      return getCases(searchFilters, currentPage, pageSize);
    },
  });

  const cases = casesResult?.data || [];
  const totalCases = casesResult?.total || 0;

  const getStatusBadge = (status: CaseStatus) => {
    const variants: Record<CaseStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      [CaseStatus.New]: 'outline',
      [CaseStatus.Investigation]: 'default',
      [CaseStatus.Investigating]: 'default',
      [CaseStatus.EvidenceReview]: 'secondary',
      [CaseStatus.RecommendationPending]: 'default',
      [CaseStatus.PRMScheduled]: 'secondary',
      [CaseStatus.PRMComplete]: 'secondary',
      [CaseStatus.DecisionPending]: 'default',
      [CaseStatus.PendingERU]: 'destructive',
      [CaseStatus.Closed]: 'secondary',
      [CaseStatus.Archived]: 'outline',
    };

    return (
      <Badge variant={variants[status]}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 36) return <Badge variant="destructive">Critical</Badge>;
    if (riskScore >= 16) return <Badge variant="default" className="bg-orange-500">High</Badge>;
    if (riskScore >= 6) return <Badge variant="default" className="bg-yellow-500">Medium</Badge>;
    return <Badge variant="secondary">Low</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cases</h1>
          <p className="text-muted-foreground">Manage investigation cases and track progress</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => refetch()}>
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link to="/intake">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCases}</div>
            <p className="text-xs text-muted-foreground">All cases in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cases.filter((c: Case) => 
                c.status !== CaseStatus.Closed && c.status !== CaseStatus.Archived
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently being worked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cases.filter((c: Case) => c.riskScore >= 16).length}
            </div>
            <p className="text-xs text-muted-foreground">Require priority attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cases.filter((c: Case) => {
                // Mock overdue calculation - in real app would check SLA events
                const daysSinceDOK = Math.floor((Date.now() - new Date(c.dok).getTime()) / (1000 * 60 * 60 * 24));
                return daysSinceDOK > 12; // AFA 12 business day rule
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Past SLA deadline</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cases by ID, employee name, or description..."
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

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Investigation Cases</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">Loading cases...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Violation Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>DOK</TableHead>
                  <TableHead>Base</TableHead>
                  <TableHead>Investigator</TableHead>
                  <TableHead>SLA Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((case_: Case) => {
                  const daysSinceDOK = Math.floor((Date.now() - new Date(case_.dok).getTime()) / (1000 * 60 * 60 * 24));
                  const isOverdueSLA = daysSinceDOK > 12;
                  const daysUntilSLA = 12 - daysSinceDOK;

                  return (
                    <TableRow key={case_.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{case_.primaryCaseId}</span>
                          <span className="text-xs text-muted-foreground">{case_.secondaryCaseId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{case_.employeeFirstName} {case_.employeeLastName}</span>
                          <span className="text-xs text-muted-foreground">ID: {case_.employeeId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{case_.violationType}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(case_.status)}
                      </TableCell>
                      <TableCell>
                        {getRiskBadge(case_.riskScore)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{new Date(case_.dok).toLocaleDateString()}</span>
                          <span className="text-xs text-muted-foreground">
                            {daysSinceDOK} days ago
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{case_.baseLocation}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{case_.investigatorId}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {isOverdueSLA ? (
                            <Badge variant="destructive" className="flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Overdue
                            </Badge>
                          ) : daysUntilSLA <= 3 ? (
                            <Badge variant="default" className="bg-yellow-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {daysUntilSLA}d left
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {daysUntilSLA}d left
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link to={`/cases/${case_.id}`}>
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
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCases)} of {totalCases} cases
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
            disabled={currentPage * pageSize >= totalCases}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
