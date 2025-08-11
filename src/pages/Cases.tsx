import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../components/ui/dialog';
import { InvestigatorModal } from '../components/InvestigatorModal';
import { Plus, Filter, Eye, Clock, AlertTriangle, Shield, Edit } from 'lucide-react';
import { Case, CaseSearchFilters, CaseStatus } from '../types';
import { getCases } from '../data/mockCaseData';

export function Cases() {
  const [searchTerm] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showInvestigatorModal, setShowInvestigatorModal] = useState(false);
  const [selectedInvestigator, setSelectedInvestigator] = useState<string>('');

  // Fetch cases with current filters
  const { data: casesResult, isLoading, refetch } = useQuery({
    queryKey: ['cases', searchTerm],
    queryFn: () => {
      const searchFilters: CaseSearchFilters = {
        searchTerm: searchTerm || undefined,
      };
      return getCases(searchFilters);
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

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Compact Page Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#01426a] mb-1">Investigation Cases</h1>
            <p className="text-sm lg:text-base text-gray-600">Manage and track investigation progress across all cases</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm lg:text-base"
            >
              <Filter className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Link to="/intake">
              <Button className="bg-[#01426a] hover:bg-blue-800 text-white text-sm lg:text-base">
                <Plus className="h-4 w-4 mr-2" />
                New Case
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Compact Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-500 to-blue-600 text-white pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Total Cases</CardTitle>
              <Clock className="h-4 w-4 text-blue-200" />
            </div>
          </CardHeader>
          <CardContent className="bg-white p-3">
            <div className="text-xl font-bold text-blue-600 mb-1">{totalCases}</div>
            <p className="text-xs text-gray-600 font-medium">All cases in system</p>
          </CardContent>
        </Card>

        <Card className="border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-orange-500 to-red-600 text-white pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Active</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-200" />
            </div>
          </CardHeader>
          <CardContent className="bg-white p-3">
            <div className="text-xl font-bold text-orange-600 mb-1">
              {cases.filter((c: Case) => 
                c.status !== CaseStatus.Closed && c.status !== CaseStatus.Archived
              ).length}
            </div>
            <p className="text-xs text-gray-600 font-medium">Currently being worked</p>
          </CardContent>
        </Card>

        <Card className="border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-red-500 to-pink-600 text-white pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">High Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-200" />
            </div>
          </CardHeader>
          <CardContent className="bg-white p-3">
            <div className="text-xl font-bold text-red-600 mb-1">
              {cases.filter((c: Case) => c.riskScore >= 16).length}
            </div>
            <p className="text-xs text-gray-600 font-medium">Require priority attention</p>
          </CardContent>
        </Card>

        <Card className="border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-purple-500 to-violet-600 text-white pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Overdue</CardTitle>
              <Clock className="h-4 w-4 text-purple-200" />
            </div>
          </CardHeader>
          <CardContent className="bg-white p-3">
            <div className="text-xl font-bold text-purple-600 mb-1">
              {cases.filter((c: Case) => {
                // Business day calculation for overdue cases
                const calculateBusinessDays = (startDate: Date, endDate: Date) => {
                  let businessDays = 0;
                  const currentDate = new Date(startDate);
                  
                  while (currentDate <= endDate) {
                    const dayOfWeek = currentDate.getDay();
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                      businessDays++;
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                  }
                  
                  return businessDays - 1;
                };
                
                const dokDate = new Date(c.dateOfKnowledge || c.dok);
                const today = new Date();
                const businessDaysElapsed = calculateBusinessDays(dokDate, today);
                return businessDaysElapsed > 12; // AFA 12 business day rule
              }).length}
            </div>
            <p className="text-xs text-gray-600 font-medium">Past AFA 12-day deadline</p>
          </CardContent>
        </Card>
      </div>

      {/* Compact Cases Table with Filter */}
      <Card className="border border-gray-200">
        <CardHeader className="bg-white border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-[#01426a]">Investigation Cases</CardTitle>
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => setShowFilterModal(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#01426a] mr-3"></div>
              Loading cases...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 text-sm py-3">Base</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm py-3">Employee</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm py-3">Concern Type</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm py-3">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm py-3">DOK</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm py-3">SLA Due Date</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm py-3">Days Until Due</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm py-3">Investigator</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-sm py-3 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map((case_: Case) => {
                    // Business day calculation for SLA
                    const calculateBusinessDays = (startDate: Date, endDate: Date) => {
                      let businessDays = 0;
                      const currentDate = new Date(startDate);
                      
                      while (currentDate <= endDate) {
                        const dayOfWeek = currentDate.getDay();
                        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                          businessDays++;
                        }
                        currentDate.setDate(currentDate.getDate() + 1);
                      }
                      
                      return businessDays - 1;
                    };

                    const dokDate = new Date(case_.dateOfKnowledge || case_.dok);
                    const today = new Date();
                    const businessDaysElapsed = calculateBusinessDays(dokDate, today);
                    const businessDaysRemaining = Math.max(0, 12 - businessDaysElapsed);
                    const isOverdueSLA = businessDaysElapsed > 12;

                    // Calculate SLA due date
                    const calculateSLADueDate = (dokDate: Date) => {
                      let businessDays = 0;
                      const currentDate = new Date(dokDate);
                      
                      while (businessDays < 12) {
                        currentDate.setDate(currentDate.getDate() + 1);
                        const dayOfWeek = currentDate.getDay();
                        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                          businessDays++;
                        }
                      }
                      
                      return currentDate;
                    };

                    const slaDueDate = calculateSLADueDate(dokDate);

                    return (
                      <TableRow key={case_.id} className="hover:bg-gray-50 border-b">
                        {/* Base Location */}
                        <TableCell className="py-4">
                          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 text-sm font-semibold">
                            {case_.baseLocation}
                          </Badge>
                        </TableCell>

                        {/* Employee Information */}
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="font-semibold text-gray-900 text-sm">
                              {case_.subjectEmployee?.name 
                                ? `${case_.employeeFirstName}, ${case_.employeeLastName} ${case_.subjectEmployee.id || case_.employeeId}`
                                : `${case_.employeeFirstName}, ${case_.employeeLastName} ${case_.employeeId}`
                              }
                            </div>
                            <div className="text-xs font-medium text-blue-600">
                              PRM: AFA-{case_.id}
                            </div>
                          </div>
                        </TableCell>

                        {/* Concern Type */}
                        <TableCell className="py-4">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs">
                            {case_.concernType || case_.violationType}
                          </Badge>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-4">
                          {getStatusBadge(case_.status)}
                        </TableCell>

                        {/* DOK */}
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900 text-sm">
                              {new Date(case_.dateOfKnowledge || case_.dok).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-600">
                              {businessDaysElapsed} business days ago
                            </div>
                          </div>
                        </TableCell>

                        {/* SLA Due Date */}
                        <TableCell className="py-4">
                          <div className="space-y-2">
                            <div className="font-medium text-gray-900 text-sm">
                              {slaDueDate.toLocaleDateString()}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  isOverdueSLA ? 'bg-red-500' : 
                                  businessDaysRemaining <= 2 ? 'bg-orange-500' : 
                                  businessDaysRemaining <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ 
                                  width: `${Math.min((businessDaysElapsed / 12) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Days Until Due */}
                        <TableCell className="py-4">
                          <div className="text-center">
                            {isOverdueSLA ? (
                              <Badge variant="destructive" className="flex items-center text-xs w-fit mx-auto">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Overdue {Math.abs(businessDaysRemaining)}d
                              </Badge>
                            ) : businessDaysRemaining <= 2 ? (
                              <Badge className="bg-orange-500 hover:bg-orange-600 flex items-center text-xs text-white w-fit mx-auto">
                                <Clock className="h-3 w-3 mr-1" />
                                {businessDaysRemaining}d
                              </Badge>
                            ) : businessDaysRemaining <= 4 ? (
                              <Badge className="bg-yellow-500 hover:bg-yellow-600 flex items-center text-xs text-white w-fit mx-auto">
                                <Clock className="h-3 w-3 mr-1" />
                                {businessDaysRemaining}d
                              </Badge>
                            ) : (
                              <Badge className="bg-green-500 hover:bg-green-600 flex items-center text-xs text-white w-fit mx-auto">
                                <Clock className="h-3 w-3 mr-1" />
                                {businessDaysRemaining}d
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Investigator */}
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            <div className="bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-lg px-3 py-2 flex-1">
                              <span className="text-sm font-medium text-gray-900">
                                {case_.investigatorId || 'Unassigned'}
                              </span>
                            </div>
                            {case_.investigatorId && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-purple-300 text-purple-700 hover:bg-purple-50 p-2"
                                title="View Investigator Details"
                                onClick={() => {
                                  setSelectedInvestigator(case_.investigatorId!);
                                  setShowInvestigatorModal(true);
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <Link to={`/cases/${case_.id}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-blue-300 text-blue-700 hover:bg-blue-50 text-xs"
                                title="Quick View"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Link to={`/cases/${case_.id}/edit`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-green-300 text-green-700 hover:bg-green-50 text-xs"
                                title="Edit Case"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-amber-300 text-amber-700 hover:bg-amber-50 text-xs"
                              title="Add to PRM"
                              onClick={() => {
                                // Add to PRM logic here
                                console.log('Add to PRM:', case_.id);
                              }}
                            >
                              <Shield className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination - Only show if more than 50 results */}
          {cases.length > 50 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing 1 to {Math.min(50, cases.length)} of {cases.length} cases
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled className="text-xs">
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">Page 1 of {Math.ceil(cases.length / 50)}</span>
                  <Button variant="outline" size="sm" disabled={cases.length <= 50} className="text-xs">
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Pagination - Remove this section since we moved it inside CardContent */}

      {/* Modern Filter Modal */}
      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              <DialogTitle>
                <span className="text-xl font-semibold text-gray-900">Advanced Case Filters</span>
              </DialogTitle>
            </div>
            <DialogClose onClick={() => setShowFilterModal(false)} />
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Case Status
              </Label>
              <Select>
                <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="New">🆕 New</SelectItem>
                  <SelectItem value="Investigation">🔍 Investigation</SelectItem>
                  <SelectItem value="Investigating">🔎 Investigating</SelectItem>
                  <SelectItem value="EvidenceReview">📋 Evidence Review</SelectItem>
                  <SelectItem value="RecommendationPending">⏳ Recommendation Pending</SelectItem>
                  <SelectItem value="PRMScheduled">📅 PRM Scheduled</SelectItem>
                  <SelectItem value="PRMComplete">✅ PRM Complete</SelectItem>
                  <SelectItem value="DecisionPending">🤔 Decision Pending</SelectItem>
                  <SelectItem value="PendingERU">⚠️ Pending ERU</SelectItem>
                  <SelectItem value="Closed">🔒 Closed</SelectItem>
                  <SelectItem value="Archived">📦 Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Priority Level
              </Label>
              <Select>
                <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">🔴 High Priority</SelectItem>
                  <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                  <SelectItem value="low">🟢 Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Risk Level Filter */}
            <div className="space-y-2">
              <Label htmlFor="riskLevel" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Risk Assessment
              </Label>
              <Select>
                <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                  <SelectValue placeholder="All Risk Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="critical">🚨 Critical Risk (36+)</SelectItem>
                  <SelectItem value="high">⚡ High Risk (16-35)</SelectItem>
                  <SelectItem value="medium">⚠️ Medium Risk (6-15)</SelectItem>
                  <SelectItem value="low">✅ Low Risk (0-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* SLA Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="slaStatus" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                SLA Compliance
              </Label>
              <Select>
                <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                  <SelectValue placeholder="All SLA Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All SLA Statuses</SelectItem>
                  <SelectItem value="overdue">🔥 Overdue (Past 12 days)</SelectItem>
                  <SelectItem value="critical">⏰ Critical (≤2 days left)</SelectItem>
                  <SelectItem value="warning">⚠️ Warning (≤4 days left)</SelectItem>
                  <SelectItem value="ontrack">✅ On Track (5+ days left)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Location
              </Label>
              <Input 
                id="location"
                placeholder="Enter location to filter..."
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
            </div>

            {/* Investigator Filter */}
            <div className="space-y-2">
              <Label htmlFor="investigator" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Investigator
              </Label>
              <Input 
                id="investigator"
                placeholder="Search by investigator name..."
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              Date Range Filters
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Date of Knowledge (DOK)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="date"
                    placeholder="From"
                    className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                  <Input 
                    type="date"
                    placeholder="To"
                    className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Case Created Date</Label>
                <div className="flex gap-2">
                  <Input 
                    type="date"
                    placeholder="From"
                    className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                  <Input 
                    type="date"
                    placeholder="To"
                    className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Special Flags */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              Special Case Flags
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">PRM Cases</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">FOI Required</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Has Witnesses</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">External Parties</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => {
                // Clear all filters logic here
                setShowFilterModal(false);
              }}
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              Clear All Filters
            </Button>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowFilterModal(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Apply filters logic here
                  setShowFilterModal(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Investigator Modal */}
      <InvestigatorModal 
        open={showInvestigatorModal}
        onOpenChange={setShowInvestigatorModal}
        investigatorId={selectedInvestigator}
      />
    </div>
  );
}
