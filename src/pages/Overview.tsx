import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { AlertTriangle, Clock, CheckCircle, FileText, Scale, TrendingDown } from 'lucide-react';
import { DashboardMetrics, Case } from '../types';
import { getCases, getDashboardMetrics } from '../data/mockCaseData';
import { PowerAppsDiagnostics } from '../components/PowerAppsDiagnostics';

export function Overview() {
  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => getDashboardMetrics(),
  });

  // Fetch recent cases
  const { data: recentCases, isLoading: casesLoading } = useQuery({
    queryKey: ['recent-cases'],
    queryFn: () => getCases(undefined, 1, 5),
  });

  // Mock data for charts
  const caseVolumeData = [
    { month: 'Jan', cases: 12, grievances: 3 },
    { month: 'Feb', cases: 18, grievances: 5 },
    { month: 'Mar', cases: 15, grievances: 2 },
    { month: 'Apr', cases: 22, grievances: 7 },
    { month: 'May', cases: 28, grievances: 4 },
    { month: 'Jun', cases: 19, grievances: 6 },
  ];

  const slaComplianceData = [
    { name: 'On Time', value: 94.2, count: 147 },
    { name: 'Overdue', value: 5.8, count: 9 },
  ];

  const violationTypeData = [
    { name: 'Performance', value: 35, count: 54 },
    { name: 'Attendance', value: 25, count: 39 },
    { name: 'Safety', value: 20, count: 31 },
    { name: 'Misconduct', value: 15, count: 23 },
    { name: 'Other', value: 5, count: 8 },
  ];

  if (metricsLoading || casesLoading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  const defaultMetrics: DashboardMetrics = {
    totalCases: 156,
    activeCases: 23,
    overdueCases: 3,
    totalGrievances: 45,
    activeGrievances: 8,
    slaCompliance: 94.2,
    averageResolutionDays: 18.5,
    riskDistribution: {
      low: 45,
      medium: 67,
      high: 32,
      critical: 12
    }
  };

  const dashboardMetrics = metrics || defaultMetrics;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Power Platform Diagnostics */}
      <PowerAppsDiagnostics />
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Labor Relations Investigation & Grievance Management Overview</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-3">
          <Button variant="outline" className="text-sm lg:text-base">Export Report</Button>
          <Button className="text-sm lg:text-base">New Case</Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.totalCases}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ 12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.activeCases}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">↗ 8%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.slaCompliance}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ 2.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.averageResolutionDays} days</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↓ 2.3 days</span> improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Overdue Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{dashboardMetrics.overdueCases}</div>
            <p className="text-xs text-red-600">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">High Risk Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{dashboardMetrics.riskDistribution.critical + dashboardMetrics.riskDistribution.high}</div>
            <p className="text-xs text-yellow-600">Need priority review</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Active Grievances</CardTitle>
            <Scale className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{dashboardMetrics.activeGrievances}</div>
            <p className="text-xs text-blue-600">Union proceedings</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Case Volume Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Case Volume Trend</CardTitle>
            <CardDescription>Monthly cases and grievances over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={caseVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cases" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="grievances" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SLA Compliance */}
        <Card>
          <CardHeader>
            <CardTitle>SLA Compliance</CardTitle>
            <CardDescription>Current period performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={slaComplianceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {slaComplianceData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Violation Types */}
        <Card>
          <CardHeader>
            <CardTitle>Cases by Violation Type</CardTitle>
            <CardDescription>Distribution of current active cases</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={violationTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Cases</CardTitle>
            <CardDescription>Latest investigation cases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCases?.data.slice(0, 5).map((case_: Case) => (
                <div key={case_.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{case_.primaryCaseId}</h4>
                      <Badge variant={case_.status === 'Investigation' ? 'default' : 'secondary'}>
                        {case_.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {case_.employeeFirstName} {case_.employeeLastName} - {case_.violationType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      DOK: {new Date(case_.dok).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={case_.riskScore > 25 ? 'destructive' : case_.riskScore > 15 ? 'default' : 'secondary'}
                    >
                      Risk: {case_.riskScore}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
          <CardDescription>Cases categorized by risk level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <div className="text-center p-3 lg:p-4 border rounded-lg bg-green-50">
              <div className="text-xl lg:text-2xl font-bold text-green-800">{dashboardMetrics.riskDistribution.low}</div>
              <div className="text-xs lg:text-sm text-green-600">Low Risk</div>
            </div>
            <div className="text-center p-3 lg:p-4 border rounded-lg bg-yellow-50">
              <div className="text-xl lg:text-2xl font-bold text-yellow-800">{dashboardMetrics.riskDistribution.medium}</div>
              <div className="text-xs lg:text-sm text-yellow-600">Medium Risk</div>
            </div>
            <div className="text-center p-3 lg:p-4 border rounded-lg bg-orange-50">
              <div className="text-xl lg:text-2xl font-bold text-orange-800">{dashboardMetrics.riskDistribution.high}</div>
              <div className="text-xs lg:text-sm text-orange-600">High Risk</div>
            </div>
            <div className="text-center p-3 lg:p-4 border rounded-lg bg-red-50">
              <div className="text-xl lg:text-2xl font-bold text-red-800">{dashboardMetrics.riskDistribution.critical}</div>
              <div className="text-xs lg:text-sm text-red-600">Critical Risk</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
