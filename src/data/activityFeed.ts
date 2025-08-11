import { caseData, getNotesByCaseId, getTasks } from './mockCaseData';
import { Case, CaseStatus } from '../types';

export type ActivityType =
  | 'case_created'
  | 'case_updated'
  | 'status_changed'
  | 'task_created'
  | 'note_created';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  caseId?: string;
  systemCaseId?: string;
  title: string;
  detail?: string;
  timestamp: Date;
  statusAfter?: CaseStatus;
}

function add<T>(arr: T[], item: T) { arr.push(item); }

export function getRecentActivity(limit = 10): { data: ActivityItem[] } {
  const items: ActivityItem[] = [];

  // Cases
  caseData.forEach((c: Case) => {
    add(items, {
      id: `case-created-${c.id}`,
      type: 'case_created',
      caseId: c.id,
      systemCaseId: c.systemCaseId,
      title: `Case created: ${c.systemCaseId}`,
      detail: `${c.employeeLastName}, ${c.employeeFirstName}`,
      timestamp: c.createdOn
    });
    if (c.modifiedOn && c.modifiedOn.getTime() - c.createdOn.getTime() > 60_000) {
      add(items, {
        id: `case-updated-${c.id}`,
        type: 'case_updated',
        caseId: c.id,
        systemCaseId: c.systemCaseId,
        title: `Case updated: ${c.systemCaseId}`,
        detail: `Modified by ${c.modifiedBy || 'system'}`,
        timestamp: c.modifiedOn
      });
    }
  });

  // Notes per case
  caseData.forEach(c => {
    const notes = getNotesByCaseId(c.id);
    notes.forEach(n => add(items, {
      id: `note-${n.id}`,
      type: 'note_created',
      caseId: c.id,
      systemCaseId: c.systemCaseId,
      title: `Note: ${n.subject}`,
      detail: `Case ${c.systemCaseId}`,
      timestamp: (n.createdOn instanceof Date) ? n.createdOn : new Date(n.createdOn)
    }));
  });

  // Tasks (workspace-wide)
  const tasksResult = getTasks();
  tasksResult.data.forEach(t => add(items, {
    id: `task-${t.id}`,
    type: 'task_created',
    caseId: t.caseId,
    title: `Task: ${t.title}`,
    detail: t.description,
    timestamp: (t.createdOn instanceof Date) ? t.createdOn : new Date(t.createdOn)
  }));

  // Sort newest first
  items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return { data: items.slice(0, limit) };
}
