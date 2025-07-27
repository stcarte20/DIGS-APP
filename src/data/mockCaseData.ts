import { Case, CaseStatus, ViolationType, UnionGroup, BaseCode, TaskStatus, NoteCategory } from '../types';

export const caseData: Case[] = [
  {
    id: '1',
    primaryCaseId: 'INV-2024-0001',
    secondaryCaseId: 'Smith,John-E12345',
    caseNumber: 'INV-2024-0001',
    employeeKey: 'EMP001',
    employeeFirstName: 'John',
    employeeLastName: 'Smith',
    employeeId: 'E12345',
    unionGroup: UnionGroup.AFA,
    violationType: ViolationType.Performance,
    severity: 4,
    likelihood: 3,
    status: CaseStatus.Investigating,
    priority: 'High',
    dok: new Date('2024-01-15'),
    incidentDate: new Date('2024-01-10'),
    reportedDate: new Date('2024-01-15'),
    investigatorId: 'INV001',
    assignedTo: 'Sarah Johnson',
    baseLocation: BaseCode.SEA,
    riskScore: 85,
    litigationHold: false,
    description: 'Investigation into alleged policy violations during scheduled flight operations',
    summary: 'Employee misconduct investigation',
    investigationDeadline: new Date('2024-02-15'),
    closureDeadline: new Date('2024-03-01'),
    closeoutScheduled: false,
    eruCompleted: false,
    createdOn: new Date('2024-01-15'),
    createdBy: 'system',
    modifiedOn: new Date('2024-01-15'),
    modifiedBy: 'system',
    // Extended fields from intake form
    subjectEmployee: {
      id: 'E12345',
      name: 'John Smith',
      email: 'john.smith@company.com',
      jobTitle: 'Flight Attendant',
      department: 'In-Flight Services',
      officeLocation: 'Seattle Hub',
      manager: {
        id: 'M001',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        jobTitle: 'In-Flight Services Manager',
        department: 'In-Flight Services'
      }
    },
    dateOfKnowledge: new Date('2024-01-15'),
    location: 'Aircraft - Flight AS123',
    concernType: 'Performance Issues',
    contextTags: ['Misuse of Time', 'Call Avoidance', 'Failure to Follow Instructions'],
    witnesses: [
      {
        id: 'W001',
        displayName: 'Michael Davis',
        mail: 'michael.davis@company.com',
        type: 'employee',
        details: 'Flight Attendant - In-Flight Services',
        manager: {
          id: 'M001',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          jobTitle: 'In-Flight Services Manager',
          department: 'In-Flight Services'
        }
      },
      {
        id: 'W002',
        name: 'Passenger John Doe',
        type: 'external',
        details: 'Passenger on Flight AS123'
      }
    ],
    urgencyLevel: 'high',
    isPrmCase: false,
    foiNeeded: false,
    submitterId: 'SUB001',
    submitterInfo: {
      id: 'SUB001',
      name: 'Lisa Chen',
      email: 'lisa.chen@company.com',
      jobTitle: 'Operations Supervisor',
      employeeNumber: 'E99999',
      department: 'Operations'
    }
  },
  {
    id: '2',
    primaryCaseId: 'INV-2024-0002',
    secondaryCaseId: 'Doe,Jane-E67890',
    caseNumber: 'INV-2024-0002',
    employeeKey: 'EMP002',
    employeeFirstName: 'Jane',
    employeeLastName: 'Doe',
    employeeId: 'E67890',
    unionGroup: UnionGroup.AFA,
    violationType: ViolationType.EEO,
    severity: 5,
    likelihood: 4,
    status: CaseStatus.New,
    priority: 'Critical',
    dok: new Date('2024-01-20'),
    incidentDate: new Date('2024-01-18'),
    reportedDate: new Date('2024-01-20'),
    investigatorId: 'INV002',
    assignedTo: 'Michael Brown',
    baseLocation: BaseCode.PDX,
    riskScore: 92,
    litigationHold: true,
    description: 'Formal harassment complaint filed regarding inappropriate workplace behavior',
    summary: 'Harassment complaint investigation',
    investigationDeadline: new Date('2024-02-20'),
    closureDeadline: new Date('2024-03-05'),
    closeoutScheduled: false,
    eruCompleted: false,
    createdOn: new Date('2024-01-20'),
    createdBy: 'system',
    modifiedOn: new Date('2024-01-20'),
    modifiedBy: 'system',
    // Extended fields from intake form
    subjectEmployee: {
      id: 'E67890',
      name: 'Jane Doe',
      email: 'jane.doe@company.com',
      jobTitle: 'Customer Service Representative',
      department: 'Customer Relations',
      officeLocation: 'Portland Hub',
      manager: {
        id: 'M002',
        name: 'Robert Wilson',
        email: 'robert.wilson@company.com',
        jobTitle: 'Customer Relations Manager',
        department: 'Customer Relations'
      }
    },
    dateOfKnowledge: new Date('2024-01-20'),
    location: 'Customer Service Desk - Terminal B',
    concernType: 'Harassment - Sexual',
    contextTags: ['Sexual Harassment'],
    witnesses: [
      {
        id: 'W003',
        displayName: 'Amanda Rodriguez',
        mail: 'amanda.rodriguez@company.com',
        type: 'employee',
        details: 'Customer Service Representative - Customer Relations',
        manager: {
          id: 'M002',
          name: 'Robert Wilson',
          email: 'robert.wilson@company.com',
          jobTitle: 'Customer Relations Manager',
          department: 'Customer Relations'
        }
      }
    ],
    urgencyLevel: 'high',
    isPrmCase: true,
    foiNeeded: true,
    submitterId: 'SUB002',
    submitterInfo: {
      id: 'SUB002',
      name: 'David Kim',
      email: 'david.kim@company.com',
      jobTitle: 'HR Business Partner',
      employeeNumber: 'E88888',
      department: 'Human Resources'
    }
  }
];

export const getCases = (filters?: any, page = 1, pageSize = 10) => {
  let filteredCases = [...caseData];
  
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filteredCases = filteredCases.filter(c => 
      c.primaryCaseId.toLowerCase().includes(term) ||
      (c.description && c.description.toLowerCase().includes(term)) ||
      c.violationType.toLowerCase().includes(term) ||
      `${c.employeeFirstName} ${c.employeeLastName}`.toLowerCase().includes(term)
    );
  }
  
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    data: filteredCases.slice(startIndex, endIndex),
    total: filteredCases.length,
    page,
    pageSize
  };
};

export const getCaseById = (id: string) => {
  return caseData.find(c => c.id === id);
};

export const getTasksByCaseId = (caseId: string) => {
  // Mock tasks data
  return [
    {
      id: `task-${caseId}-1`,
      caseId,
      title: 'Conduct Initial Interview',
      description: 'Interview the reporting party',
      ownerId: 'owner1',
      assignedTo: 'investigator1',
      assignedBy: 'supervisor1',
      dueDate: new Date('2024-02-01'),
      status: TaskStatus.Pending,
      priority: 'High' as const,
      taskType: 'Interview',
      type: 'task' as const,
      autoGenerated: false,
      createdOn: new Date('2024-01-15'),
      createdBy: 'system'
    }
  ];
};

export const getNotesByCaseId = (caseId: string) => {
  // Mock notes data
  return [
    {
      id: `note-${caseId}-1`,
      caseId,
      authorId: 'investigator1',
      noteCategory: NoteCategory.General,
      subject: 'Initial Assessment',
      body: 'Initial case assessment completed with preliminary findings.',
      followUpFlag: false,
      isConfidential: false,
      createdOn: new Date('2024-01-15'),
      createdBy: 'investigator1'
    }
  ];
};

export const getTasks = (filters?: any) => {
  // Mock tasks for workspace
  const mockTasks = [
    {
      id: 'task-1',
      caseId: '1',
      title: 'Complete Case Review',
      description: 'Review case documentation and evidence',
      ownerId: 'owner1',
      assignedTo: filters?.assignedTo || 'user-1',
      assignedBy: 'supervisor1',
      dueDate: new Date('2024-02-01'),
      status: TaskStatus.Open,
      priority: 'High' as const,
      taskType: 'Review',
      type: 'task' as const,
      autoGenerated: false,
      createdOn: new Date('2024-01-15'),
      createdBy: 'system'
    }
  ];

  return {
    data: mockTasks,
    total: mockTasks.length
  };
};

export const getDashboardMetrics = () => {
  return {
    totalCases: caseData.length,
    activeCases: caseData.filter(c => c.status !== CaseStatus.Closed).length,
    overdueCases: 1,
    totalGrievances: 2,
    activeGrievances: 1,
    slaCompliance: 85,
    averageResolutionDays: 12,
    riskDistribution: {
      low: 2,
      medium: 1,
      high: 1,
      critical: 0
    }
  };
};
