import { Case, CaseStatus, ViolationType, BaseCode, UnionGroup } from '../types/index';

// Extended Case interface for easier mock data (allows string dates)
interface MockCase extends Omit<Case, 'createdOn' | 'modifiedOn' | 'dateOfKnowledge' | 'dok' | 'incidentDate' | 'reportedDate' | 'investigationDeadline' | 'closureDeadline'> {
  createdOn: string;
  modifiedOn?: string;
  dateOfKnowledge: string;
  dok: string;
  incidentDate: string;
  reportedDate: string;
  investigationDeadline: string;
  closureDeadline: string;
  investigator?: {
    id: string;
    name: string;
    email: string;
    jobTitle: string;
    department: string;
    officeLocation?: string;
  };
}

// Mock data for development - replace with actual API calls
const mockCases: MockCase[] = [
  {
    id: '1',
  systemCaseId: 'PRM-AFA-0001',
  caseName: 'Smith, John E12345',
  entryId: 1,
    primaryCaseId: 'INV-2024-0001',
    secondaryCaseId: 'Smith,John-E12345',
    caseNumber: 'DIGS-001',
    employeeKey: 'EMP-E12345',
    employeeFirstName: 'John',
    employeeLastName: 'Smith',
    employeeId: 'E12345',
    unionGroup: UnionGroup.AFA,
    violationType: ViolationType.Misconduct,
    severity: 3,
    likelihood: 4,
    status: CaseStatus.Investigating,
    priority: 'High',
    dok: '2024-01-15T09:00:00Z',
    incidentDate: '2024-01-14T15:30:00Z',
    reportedDate: '2024-01-15T08:00:00Z',
    investigatorId: 'INV001',
    investigator: {
      id: 'inv-001',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@company.com',
      jobTitle: 'Senior Investigator',
      department: 'Employee Relations',
      officeLocation: 'Seattle Office'
    },
    baseLocation: BaseCode.SEA,
    riskScore: 12,
    litigationHold: false,
    description: 'Employee was observed using inappropriate language during a team meeting.',
    investigationDeadline: '2024-01-29T17:00:00Z',
    closureDeadline: '2024-02-15T17:00:00Z',
    closeoutScheduled: false,
    eruCompleted: false,
    createdOn: '2024-01-15T08:30:00Z',
    createdBy: 'SYSTEM',
    modifiedOn: '2024-01-20T14:30:00Z',
    modifiedBy: 'INV001',
    isPrmCase: true,
    foiNeeded: false,
    submitterId: 'M98765',
    submitterInfo: {
      id: 'M98765',
      name: 'Jane Manager',
      email: 'jane.manager@company.com',
      jobTitle: 'Engineering Manager',
      employeeNumber: 'M98765',
      department: 'Engineering'
    },
    subjectEmployee: {
      id: 'E12345',
      name: 'John Smith',
      email: 'john.smith@company.com',
      jobTitle: 'Software Developer',
      department: 'Engineering',
      officeLocation: 'Seattle Office'
    },
    dateOfKnowledge: '2024-01-15T09:00:00Z',
    location: 'Conference Room B',
    concernType: 'Misconduct',
    contextTags: ['Team Meeting', 'Workplace Conduct', 'Verbal Warning'],
    witnesses: [
      {
        id: 'w1',
        displayName: 'Alice Johnson',
        mail: 'alice.johnson@company.com',
        type: 'employee',
        details: 'Present during the incident'
      }
    ],
    urgencyLevel: 'high'
  }
];

// Convert mock case to actual Case interface
function convertMockCase(mockCase: MockCase): Case {
  return {
    ...mockCase,
    createdOn: new Date(mockCase.createdOn),
    modifiedOn: mockCase.modifiedOn ? new Date(mockCase.modifiedOn) : undefined,
    dateOfKnowledge: new Date(mockCase.dateOfKnowledge),
    dok: new Date(mockCase.dok),
    incidentDate: new Date(mockCase.incidentDate),
    reportedDate: new Date(mockCase.reportedDate),
    investigationDeadline: new Date(mockCase.investigationDeadline),
    closureDeadline: new Date(mockCase.closureDeadline)
  };
}

export async function getCases(): Promise<Case[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockCases.map(convertMockCase);
}

export async function getCaseById(id: string): Promise<Case | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  const mockCase = mockCases.find(c => c.id === id);
  return mockCase ? convertMockCase(mockCase) : null;
}

export async function updateCase(id: string, updates: Partial<Case>): Promise<Case> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const caseIndex = mockCases.findIndex(c => c.id === id);
  if (caseIndex === -1) {
    throw new Error('Case not found');
  }

  // Convert dates back to strings for mock storage
  const stringUpdates: any = { ...updates };
  if (updates.dateOfKnowledge) {
    stringUpdates.dateOfKnowledge = updates.dateOfKnowledge.toISOString();
  }
  if (updates.dok) {
    stringUpdates.dok = updates.dok.toISOString();
  }
  if (updates.incidentDate) {
    stringUpdates.incidentDate = updates.incidentDate.toISOString();
  }
  if (updates.reportedDate) {
    stringUpdates.reportedDate = updates.reportedDate.toISOString();
  }
  if (updates.investigationDeadline) {
    stringUpdates.investigationDeadline = updates.investigationDeadline.toISOString();
  }
  if (updates.closureDeadline) {
    stringUpdates.closureDeadline = updates.closureDeadline.toISOString();
  }

  // Update the case
  mockCases[caseIndex] = {
    ...mockCases[caseIndex],
    ...stringUpdates,
    modifiedOn: new Date().toISOString(),
    modifiedBy: 'CURRENT_USER'
  };

  return convertMockCase(mockCases[caseIndex]);
}

export async function createCase(caseData: Omit<Case, 'id' | 'createdOn' | 'modifiedOn'>): Promise<Case> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newMockCase: MockCase = {
    ...caseData,
    id: Math.random().toString(36).substr(2, 9),
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString(),
    createdBy: 'CURRENT_USER',
    modifiedBy: 'CURRENT_USER',
    // Convert Date objects to strings for mock storage
    dateOfKnowledge: caseData.dateOfKnowledge.toISOString(),
    dok: caseData.dok.toISOString(),
    incidentDate: caseData.incidentDate.toISOString(),
    reportedDate: caseData.reportedDate.toISOString(),
    investigationDeadline: caseData.investigationDeadline.toISOString(),
    closureDeadline: caseData.closureDeadline.toISOString()
  };

  mockCases.push(newMockCase);
  return convertMockCase(newMockCase);
}

export async function deleteCase(id: string): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const caseIndex = mockCases.findIndex(c => c.id === id);
  if (caseIndex === -1) {
    throw new Error('Case not found');
  }

  mockCases.splice(caseIndex, 1);
}

// Mock functions for tasks and notes - replace with actual implementations
export async function getTasksByCaseId(caseId: string) {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      id: 't1',
      title: 'Conduct Initial Interview',
      description: 'Interview the subject employee about the incident',
      status: 'InProgress',
      priority: 'High',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      ownerId: 'INV001',
      caseId
    },
    {
      id: 't2',
      title: 'Interview Witnesses',
      description: 'Conduct interviews with all identified witnesses',
      status: 'Pending',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      ownerId: 'INV001',
      caseId
    }
  ];
}

export async function getNotesByCaseId(caseId: string) {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      id: 'n1',
      subject: 'Initial Case Review',
      body: 'Case has been assigned and initial review completed. Witness list identified. Employee has been notified of the investigation.',
      noteCategory: 'Investigation',
      createdOn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      authorId: 'INV001',
      authorName: 'Sarah Wilson',
      followUpFlag: false,
      caseId,
      isConfidential: false
    },
    {
      id: 'n2',
      subject: 'Documentation Received',
      body: 'Received additional documentation from the reporting manager including email chain and witness statements.',
      noteCategory: 'Evidence',
      createdOn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      authorId: 'INV001',
      authorName: 'Sarah Wilson',
      followUpFlag: true,
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      caseId,
      isConfidential: false
    },
    {
      id: 'n3',
      subject: 'Subject Employee Interview Scheduled',
      body: 'Interview with John Smith scheduled for tomorrow at 2:00 PM in Conference Room A. Union representative will be present.',
      noteCategory: 'Interview',
      createdOn: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      authorId: 'INV001',
      authorName: 'Sarah Wilson',
      followUpFlag: true,
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      caseId,
      isConfidential: false
    }
  ];
}

export async function getEvidenceFilesByCaseId(caseId: string) {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      id: 'e1',
      fileName: 'incident-report-01-15-2024.pdf',
      fileSize: 2048576,
      mimeType: 'application/pdf',
      docType: 'Report',
      uploadedBy: 'Jane Manager',
      uploadedById: 'M98765',
      uploadedOn: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      privilegedFlag: false,
      virusScanStatus: 'Clean',
      virusScanDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      caseId
    },
    {
      id: 'e2',
      fileName: 'email-chain-inappropriate-language.msg',
      fileSize: 512000,
      mimeType: 'application/vnd.ms-outlook',
      docType: 'Email',
      uploadedBy: 'Sarah Wilson',
      uploadedById: 'INV001',
      uploadedOn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      privilegedFlag: false,
      virusScanStatus: 'Clean',
      virusScanDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      caseId
    },
    {
      id: 'e3',
      fileName: 'witness-statement-alice-johnson.pdf',
      fileSize: 1024000,
      mimeType: 'application/pdf',
      docType: 'Statement',
      uploadedBy: 'Sarah Wilson',
      uploadedById: 'INV001',
      uploadedOn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      privilegedFlag: false,
      virusScanStatus: 'Clean',
      virusScanDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      caseId
    }
  ];
}

export async function getMeetingsByCaseId(caseId: string) {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      id: 'm1',
      title: 'Subject Employee Interview',
      description: 'Initial interview with John Smith regarding the incident on January 14th',
      scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      location: 'Conference Room A',
      meetingType: 'Interview',
      status: 'Scheduled',
      organizer: 'Sarah Wilson',
      organizerId: 'INV001',
      attendees: [
        {
          id: 'E12345',
          name: 'John Smith',
          email: 'john.smith@company.com',
          role: 'Subject Employee',
          required: true
        },
        {
          id: 'REP001',
          name: 'Mike Torres',
          email: 'mike.torres@afa.org',
          role: 'Union Representative',
          required: true
        },
        {
          id: 'INV001',
          name: 'Sarah Wilson',
          email: 'sarah.wilson@company.com',
          role: 'Investigator',
          required: true
        }
      ],
      caseId,
      createdOn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'INV001'
    },
    {
      id: 'm2',
      title: 'Witness Interview - Alice Johnson',
      description: 'Interview with witness Alice Johnson who was present during the incident',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 45,
      location: 'Conference Room B',
      meetingType: 'Interview',
      status: 'Scheduled',
      organizer: 'Sarah Wilson',
      organizerId: 'INV001',
      attendees: [
        {
          id: 'w1',
          name: 'Alice Johnson',
          email: 'alice.johnson@company.com',
          role: 'Witness',
          required: true
        },
        {
          id: 'INV001',
          name: 'Sarah Wilson',
          email: 'sarah.wilson@company.com',
          role: 'Investigator',
          required: true
        }
      ],
      caseId,
      createdOn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'INV001'
    }
  ];
}

export async function getTimelineExtensionsByCaseId(caseId: string) {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      id: 'te1',
      requestedBy: 'Sarah Wilson',
      requestedById: 'INV001',
      requestedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      requestedDays: 5,
      reason: 'Additional witnesses identified that require interviews. Need extra time to complete thorough investigation.',
      justification: 'Two additional witnesses have come forward with relevant information. Standard interview process requires 5 additional business days to complete properly.',
      currentDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      requestedDeadline: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Pending',
      afaRepresentative: 'Mike Torres',
      afaRepresentativeId: 'REP001',
      reviewedDate: null,
      approvedDate: null,
      rejectedDate: null,
      responseReason: null,
      caseId,
      createdOn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      extensionType: 'Investigation'
    }
  ];
}
