// Hybrid case service: tries database via CaseDataService first, falls back to in-memory mock store
// Keeps existing getCases shape so callers remain mostly unchanged.
import { Case, CaseSearchFilters } from '../types';
import { caseDataService } from './db/CaseDataService';
import { caseData, createCaseFromIntake, getCases as getMockCases, getCaseById as getMockCaseById } from '../data/mockCaseData';
import { GetActiveCasesService } from './GetActiveCasesService';
import { vw_ActiveCasesService } from './vw_ActiveCasesService';
import { CaseService } from './CaseService';
import { usp_UpdateCaseStatusService } from './usp_UpdateCaseStatusService';

// Attempt connector-first (shared_sql) if generated models present.

function getEnvPriority(): string {
  try {
    // @ts-ignore
    return (import.meta?.env?.VITE_CASES_SOURCE_PRIORITY as string) || 'connector,api,mock';
  } catch { return 'connector,api,mock'; }
}

async function fetchCasesViaConnector(): Promise<Case[] | null> {
  if (!/connector/i.test(getEnvPriority())) return null;
  // Try stored procedure based source first
  try {
    const procResult = await GetActiveCasesService.GetActiveCases();
    if (procResult.success) {
      const table = (procResult.data?.ResultSets as any)?.Table1;
      if (Array.isArray(table) && table.length) {
        return table.map(mapConnectorRowToCase);
      }
    }
  } catch { /* swallow */ }
  // Fallback to view service
  try {
    const viewResult = await vw_ActiveCasesService.getAll();
    if (viewResult.success && Array.isArray(viewResult.data) && viewResult.data.length) {
      return viewResult.data.map(mapConnectorRowToCase);
    }
  } catch { /* swallow */ }
  // Fallback to raw table (CaseService)
  try {
    const tableResult = await CaseService.getAll();
    if (tableResult.success && Array.isArray(tableResult.data) && tableResult.data.length) {
      return tableResult.data.map(mapConnectorRowToCase);
    }
  } catch { /* swallow */ }
  return null;
}

// Cache mapping of systemCaseId -> connector native CaseId (for update/delete)
const connectorIdMap = new Map<string,string>();

function trackConnectorIds(row: any) {
  const systemId = row.systemCaseId || row.SystemCaseId;
  const caseId = row.CaseId || row.caseId;
  if (systemId && caseId) connectorIdMap.set(systemId, String(caseId));
}

function mapConnectorRowToCase(row: any): Case {
  // Minimal mapping; extend as DB schema grows
  trackConnectorIds(row);
  return {
    id: row.systemCaseId || row.SystemCaseId || row.primaryCaseId || crypto.randomUUID(),
  createdOn: row.createdOn ? new Date(row.createdOn) : (row.CreatedOn ? new Date(row.CreatedOn) : new Date()),
  createdBy: row.createdBy || row.CreatedBy || 'unknown',
    systemCaseId: row.systemCaseId || row.SystemCaseId || '',
    caseName: row.caseName || row.CaseName || '',
    entryId: row.entryId || row.EntryId || 0,
    primaryCaseId: row.primaryCaseId || row.PrimaryCaseId || row.systemCaseId || '',
    secondaryCaseId: row.secondaryCaseId || row.SecondaryCaseId || '',
    caseNumber: row.caseNumber || row.CaseNumber || '',
    employeeKey: row.employeeId || row.EmployeeId || '',
    employeeFirstName: row.employeeFirstName || row.EmployeeFirstName || '',
    employeeLastName: row.employeeLastName || row.EmployeeLastName || '',
    employeeId: row.employeeId || row.EmployeeId || '',
  unionGroup: row.unionGroup || row.UnionGroup || row.UnionGroupCode || 'AFA',
    violationType: row.violationType || row.ViolationType || 'Policy_Violation',
    severity: row.severity || 1,
    likelihood: row.likelihood || 1,
    status: row.status || row.Status || 'New',
    priority: row.priority || row.Priority || 'Medium',
    dok: new Date(row.dok || row.DOK || Date.now()),
    incidentDate: new Date(row.incidentDate || row.IncidentDate || Date.now()),
    reportedDate: new Date(row.reportedDate || row.ReportedDate || Date.now()),
    investigatorId: row.investigatorId || row.InvestigatorId || '',
    assignedTo: row.assignedTo || row.AssignedTo,
  baseLocation: row.baseLocation || row.BaseLocation || row.BaseCode || 'SEA',
    riskScore: row.riskScore || row.RiskScore || 0,
    litigationHold: !!(row.litigationHold || row.LitigationHold),
    description: row.description || row.Description,
    summary: row.summary || row.Summary,
  investigationDeadline: new Date(row.investigationDeadline || row.InvestigationDeadline || row.Investigationdeadline || Date.now()),
  closureDeadline: new Date(row.closureDeadline || row.ClosureDeadline || row.Closuredeadline || Date.now()),
    closeoutScheduled: !!(row.closeoutScheduled || row.CloseoutScheduled),
    eruCompleted: !!(row.eruCompleted || row.EruCompleted),
    dateOfKnowledge: new Date(row.dok || row.DOK || Date.now()),
    concernType: row.concernType || 'Unknown',
    contextTags: [],
    witnesses: [],
    urgencyLevel: 'medium',
    isPrmCase: /PRM/i.test(row.systemCaseId || ''),
    foiNeeded: false,
    submitterId: row.createdBy || 'unknown'
  } as Case;
}

interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Attempt to fetch active cases from DB; if none returned (or client noop) use mock store.
async function fetchAllCasesDB(): Promise<Case[] | null> {
  try {
    const rows = await caseDataService.getActiveCases();
    if (rows && rows.length) return rows;
    return null;
  } catch (_e) {
    return null;
  }
}

export async function getCases(filters?: CaseSearchFilters, page = 1, pageSize = 10): Promise<PagedResult<Case>> {
  // Priority chain: connector -> api/db -> mock (configurable later)
  const connectorCases = await fetchCasesViaConnector();
  const dbCases = connectorCases || await fetchAllCasesDB();
  if (!dbCases) return getMockCases(filters, page, pageSize);

  // Apply simple filters similar to mock logic
  let filtered = [...dbCases];
  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(c =>
      c.primaryCaseId.toLowerCase().includes(term) ||
      (c.description && c.description.toLowerCase().includes(term)) ||
      (c.violationType && c.violationType.toLowerCase().includes(term)) ||
      `${c.employeeFirstName} ${c.employeeLastName}`.toLowerCase().includes(term)
    );
  }
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return {
    data: filtered.slice(startIndex, endIndex),
    total: filtered.length,
    page,
    pageSize
  };
}

interface CreateCaseUnifiedInput {
  subject: { firstName: string; lastName: string; employeeId: string };
  incidentDate: Date;
  dateOfKnowledge: Date;
  concernType: string;
  contextTags: string[];
  description: string;
  witnesses: any[];
  urgencyLevel: 'low' | 'medium' | 'high';
  isPrmCase: boolean;
  foiNeeded: boolean;
  investigatorId?: string;
  createdBy?: string;
}

export async function createCaseUnified(intake: CreateCaseUnifiedInput): Promise<Case> {
  // Try connector table create first (preferred)
  try {
    if (/connector/i.test(getEnvPriority())) {
      const now = new Date();
      const ts = now.toISOString().replace(/[-:TZ.]/g,'').slice(0,14); // yyyymmddhhmmss
      const systemCaseId = `${intake.isPrmCase ? 'PRM' : 'NPRM'}-${intake.subject.employeeId}-${ts}`;
      const caseName = `${intake.subject.lastName},${intake.subject.firstName} ${intake.subject.employeeId}`;
  // (primaryCaseId/secondaryCaseId calculated implicitly when backend populates; omitted locally)
      // Deadlines
      const addBusinessDays = (start: Date, businessDays: number) => {
        const date = new Date(start);
        let added = 0;
        while (added < businessDays) {
          date.setDate(date.getDate() + 1);
          const day = date.getDay();
            if (day !== 0 && day !== 6) added++;
        }
        return date;
      };
      const investigationDeadline = addBusinessDays(now, 12);
      const closureDeadline = new Date(investigationDeadline.getTime() + 14*24*60*60*1000);
      const record = {
        SystemCaseId: systemCaseId,
        CaseName: caseName,
        EntryId: 0,
        EmployeeId: intake.subject.employeeId,
        EmployeeFirstName: intake.subject.firstName,
        EmployeeLastName: intake.subject.lastName,
        Status: 'New',
        Priority: 'Medium',
        DOK: intake.dateOfKnowledge.toISOString().substring(0,10),
        IncidentDate: intake.incidentDate.toISOString().substring(0,10),
        ReportedDate: now.toISOString(),
        Description: intake.description,
        IsPrmCase: intake.isPrmCase,
        FoiNeeded: intake.foiNeeded,
        ConcernType: intake.concernType,
        UrgencyLevel: intake.urgencyLevel,
        InvestigationDeadline: investigationDeadline.toISOString().substring(0,10),
        ClosureDeadline: closureDeadline.toISOString().substring(0,10),
        CloseoutScheduled: false,
        EruCompleted: false,
        LitigationHold: false,
        CreatedBy: intake.createdBy || 'CURRENT_USER'
      } as any;
      const result = await CaseService.create(record);
      if (result.success && result.data) {
        const caseObj = mapConnectorRowToCase({
          ...result.data,
          SystemCaseId: systemCaseId,
          CaseName: caseName,
          DOK: record.DOK,
          IncidentDate: record.IncidentDate,
          ReportedDate: record.ReportedDate,
          InvestigationDeadline: record.InvestigationDeadline,
          ClosureDeadline: record.ClosureDeadline,
          ConcernType: record.ConcernType,
          UrgencyLevel: record.UrgencyLevel,
          IsPrmCase: record.IsPrmCase,
          FoiNeeded: record.FoiNeeded,
          Description: record.Description,
          CreatedBy: record.CreatedBy
        });
        caseData.push(caseObj); // optimistic local inclusion
        return caseObj;
      }
    }
  } catch(_e) { /* swallow and fallback */ }

  // Try DB create (API direct DB) second
  try {
    const dbCase = await caseDataService.createCase({
      employeeId: intake.subject.employeeId,
      employeeFirstName: intake.subject.firstName,
      employeeLastName: intake.subject.lastName,
      isPrmCase: intake.isPrmCase,
      dok: intake.dateOfKnowledge,
      incidentDate: intake.incidentDate,
      reportedDate: new Date(),
      description: intake.description,
      createdBy: intake.createdBy || 'CURRENT_USER'
    });
    if (dbCase) {
      // Ensure caseName follows standard if backend didn't set it
      if (!dbCase.caseName || !dbCase.caseName.includes(',')) {
        dbCase.caseName = `${intake.subject.lastName},${intake.subject.firstName} ${intake.subject.employeeId}`;
      }
      // If deadlines missing, compute similarly to mock logic
      if (!dbCase.investigationDeadline || !dbCase.closureDeadline) {
        const now = new Date();
        const addBusinessDays = (start: Date, businessDays: number) => {
          const date = new Date(start);
          let added = 0;
          while (added < businessDays) {
            date.setDate(date.getDate() + 1);
            const day = date.getDay();
            if (day !== 0 && day !== 6) added++;
          }
          return date;
        };
        const investigationDeadline = addBusinessDays(now, 12);
        const closureDeadline = new Date(investigationDeadline.getTime() + 14 * 24 * 60 * 60 * 1000);
        (dbCase as any).investigationDeadline = investigationDeadline;
        (dbCase as any).closureDeadline = closureDeadline;
      }
      // Also push into mock store so existing views immediately reflect new record
      caseData.push(dbCase);
      return dbCase;
    }
  } catch (_e) {
    // swallow & fallback
  }
  // Fallback to in-memory creation
  return createCaseFromIntake(intake);
}

// Update case status using connector stored proc, fallback to direct DB proc, then mock.
export async function updateCaseStatusUnified(systemCaseId: string, newStatus: string, changedBy?: string): Promise<Case | null> {
  // Connector proc first
  try {
    if (/connector/i.test(getEnvPriority())) {
      const proc = await usp_UpdateCaseStatusService.usp_UpdateCaseStatus(changedBy, newStatus, systemCaseId);
      const row = (proc.data?.ResultSets as any)?.Table1?.[0];
      if (proc.success && row) return mapConnectorRowToCase(row);
    }
  } catch { /* ignore */ }
  // Direct DB
  try {
    const dbCase = await caseDataService.updateCaseStatus(systemCaseId, newStatus, changedBy);
    if (dbCase) return dbCase;
  } catch { /* ignore */ }
  // Mock fallback
  const mock = caseData.find(c => c.systemCaseId === systemCaseId);
  if (mock) {
    (mock as any).status = newStatus;
    return mock;
  }
  return null;
}

// Generic update of case fields via connector table update
export async function updateCaseFields(systemCaseId: string, fields: Partial<Case>): Promise<Case | null> {
  // Ensure mapping exists
  if (!connectorIdMap.has(systemCaseId)) {
    await getCases(); // populate map
  }
  const caseId = connectorIdMap.get(systemCaseId);
  if (caseId) {
    try {
      const payload: any = {};
      // Translate camelCase internal to PascalCase connector names where applicable
      const fieldMap: Record<string,string> = {
        caseName: 'CaseName',
        priority: 'Priority',
        description: 'Description',
        summary: 'Summary',
        investigatorId: 'InvestigatorId',
        baseLocation: 'BaseCode',
        concernType: 'ConcernType',
        urgencyLevel: 'UrgencyLevel'
      };
      Object.entries(fields).forEach(([k,v]) => {
        if (v === undefined) return;
        const target = fieldMap[k] || k;
        // Date handling
        if (v instanceof Date) {
          payload[target.charAt(0).toUpperCase()+target.slice(1)] = v.toISOString();
        } else {
          payload[target.charAt(0).toUpperCase()+target.slice(1)] = v as any;
        }
      });
      const res = await CaseService.update(caseId, payload);
      if (res.success && res.data) {
        return mapConnectorRowToCase(res.data);
      }
    } catch { /* ignore */ }
  }
  return null;
}

export async function deleteCase(systemCaseId: string): Promise<boolean> {
  if (!connectorIdMap.has(systemCaseId)) await getCases();
  const caseId = connectorIdMap.get(systemCaseId);
  if (caseId) {
    try {
      await CaseService.delete(caseId);
      return true;
    } catch { /* ignore */ }
  }
  return false;
}

// Unified single-case fetch by id (treat id as systemCaseId or internal id)
export async function getCaseByIdUnified(id: string): Promise<Case | null> {
  // Try connector cache/populate
  try {
    const casesPaged = await getCases(undefined, 1, 500); // batch pull (reasonable cap)
    const found = casesPaged.data.find(c => c.id === id || c.systemCaseId === id || c.primaryCaseId === id);
    if (found) return found;
  } catch { /* ignore */ }
  // Direct DB
  try {
    const dbRows = await caseDataService.getActiveCases();
    const foundDb = dbRows.find(c => (c as any).systemCaseId === id || (c as any).primaryCaseId === id || (c as any).id === id);
    if (foundDb) return foundDb as Case;
  } catch { /* ignore */ }
  // Mock fallback
  return getMockCaseById(id) || null;
}

// Unified update (status + other fields)
export async function updateCaseUnified(id: string, updates: Partial<Case>): Promise<Case | null> {
  let current = await getCaseByIdUnified(id);
  if (!current) return null;
  const systemId = current.systemCaseId || id;
  // Status change prioritized through stored proc for auditing
  if (updates.status && updates.status !== current.status) {
    const statusUpdated = await updateCaseStatusUnified(systemId, updates.status, updates.modifiedBy || updates.createdBy);
    if (statusUpdated) current = statusUpdated;
  }
  const fieldUpdates = { ...updates };
  delete (fieldUpdates as any).status;
  if (Object.keys(fieldUpdates).length) {
    const updated = await updateCaseFields(systemId, fieldUpdates);
    if (updated) current = updated;
  }
  return current;
}
