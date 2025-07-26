import { Grievance, GrievanceStatus, GrievanceType } from '../types';

export const mockGrievances: Grievance[] = [
  {
    id: '1',
    grievanceNumber: 'GRV-2024-0001',
    type: GrievanceType.Contract,
    employeeKey: 'EMP001',
    unionRepresentative: 'Rep Smith',
    filingDate: new Date('2024-01-15'),
    responseDueDate: new Date('2024-02-01'),
    status: GrievanceStatus.Filed,
    step: 1,
    currentStepDueDate: new Date('2024-02-15'),
    description: 'Improper scheduling practices violating contract Article 12',
    contractArticle: 'Article 12',
    createdOn: new Date('2024-01-15'),
    createdBy: 'system'
  },
  {
    id: '2',
    grievanceNumber: 'GRV-2024-0002',
    type: GrievanceType.PostDisciplinary,
    employeeKey: 'EMP002',
    unionRepresentative: 'Rep Jones',
    filingDate: new Date('2024-01-20'),
    responseDueDate: new Date('2024-02-05'),
    status: GrievanceStatus.UnderReview,
    step: 2,
    currentStepDueDate: new Date('2024-02-20'),
    description: 'Appealing recent disciplinary action as excessive and unwarranted',
    createdOn: new Date('2024-01-20'),
    createdBy: 'system'
  }
];

export const getGrievances = (filters?: any, page = 1, pageSize = 10) => {
  let filteredGrievances = [...mockGrievances];
  
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filteredGrievances = filteredGrievances.filter(g => 
      g.grievanceNumber.toLowerCase().includes(term) ||
      g.description.toLowerCase().includes(term) ||
      g.employeeKey.toLowerCase().includes(term)
    );
  }
  
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    data: filteredGrievances.slice(startIndex, endIndex),
    total: filteredGrievances.length,
    page,
    pageSize
  };
};

// For workspace queries with different filters
export const getGrievancesForWorkspace = () => {
  return {
    data: mockGrievances.filter(g => g.status !== GrievanceStatus.Closed),
    total: mockGrievances.length
  };
};
