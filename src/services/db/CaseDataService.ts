import { Case } from '../../types';
import { sqlClient } from './SqlClient';

export interface CreateCaseInput {
  employeeId: string;
  employeeFirstName: string;
  employeeLastName: string;
  isPrmCase: boolean;
  dok: Date;
  incidentDate: Date;
  reportedDate: Date;
  description?: string;
  createdBy?: string;
}

export class CaseDataService {
  async createCase(input: CreateCaseInput): Promise<Case | null> {
    // Placeholder: would call stored procedure via API endpoint
    const params = [
      input.employeeId,
      input.employeeFirstName,
      input.employeeLastName,
      input.isPrmCase ? 1 : 0,
      input.dok.toISOString().substring(0,10),
      input.incidentDate.toISOString().substring(0,10),
      input.reportedDate.toISOString(),
      input.description ?? null,
      input.createdBy ?? null
    ];
    const result = await sqlClient.query<Case>('EXEC dbo.usp_CreateCase @EmployeeId=?,@EmployeeFirstName=?,@EmployeeLastName=?,@IsPrmCase=?,@DOK=?,@IncidentDate=?,@ReportedDate=?,@Description=?,@CreatedBy=?', params);
    return result.rows[0] ?? null;
  }

  async getActiveCases(): Promise<Case[]> {
    const result = await sqlClient.query<Case>('SELECT * FROM dbo.vw_ActiveCases');
    return result.rows;
  }

  async updateCaseStatus(systemCaseId: string, newStatus: string, changedBy?: string): Promise<Case | null> {
    const result = await sqlClient.query<Case>('EXEC dbo.usp_UpdateCaseStatus @p1,@p2,@p3',[systemCaseId,newStatus,changedBy]);
    return result.rows[0] ?? null;
  }
}

export const caseDataService = new CaseDataService();
