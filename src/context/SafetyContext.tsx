'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  WorkPermit,
  WorkerOpinion,
  SafetyInspection,
  TBMRecord,
  IncidentRecord,
  Contractor,
  WorkPermitTemplate,
  PermitStatus,
  OpinionStatus,
  ProgramItem,
  MonthlyPermit,
  DailySafetyLog
} from '@/types';
import {
  INITIAL_WORK_PERMITS,
  INITIAL_WORKER_OPINIONS,
  INITIAL_INSPECTIONS,
  INITIAL_CONTRACTORS,
  INITIAL_TBM_RECORDS,
  INITIAL_INCIDENTS,
  INITIAL_TEMPLATES
} from '@/lib/mockData';

export interface CalendarEvent {
  id: string;
  date: string;
  program: string;
  studio: string;
  title: string;
  type: '고위험작업' | '안전점검' | '일반작업' | '정기점검' | 'TBM회의';
  status: '승인완료' | '작업진행중' | '승인대기' | '예정' | '작업완료';
  time: string;
  officer: string;
}

export interface MeetingRecord {
  id: string;
  category: 'committee' | 'subcontractor' | 'other';
  year: string;
  quarterOrPeriod: string;
  date: string;
  title: string;
  fileName?: string;
  fileSize?: string;
  fileDataUrl?: string;
  fileType?: string;
  createdAt: string;
}

export function deduplicateTemplates(tmplList: WorkPermitTemplate[]): WorkPermitTemplate[] {
  if (!Array.isArray(tmplList)) return [];
  const seenIds = new Set<string>();
  const seenCombos = new Set<string>();
  const result: WorkPermitTemplate[] = [];

  for (const t of tmplList) {
    if (!t) continue;
    const cleanTitle = (t.title || '').trim().toLowerCase();
    const cleanWorkType = (t.workType || '').trim().toLowerCase();
    const comboKey = `${cleanTitle}:::${cleanWorkType}`;

    if (!seenIds.has(t.id) && !seenCombos.has(comboKey)) {
      seenIds.add(t.id);
      seenCombos.add(comboKey);
      result.push(t);
    }
  }
  return result;
}

interface SafetyContextType {
  workPermits: WorkPermit[];
  workerOpinions: WorkerOpinion[];
  inspections: SafetyInspection[];
  tbmRecords: TBMRecord[];
  incidents: IncidentRecord[];
  contractors: Contractor[];
  templates: WorkPermitTemplate[];
  programs: ProgramItem[];
  safetyLogs: DailySafetyLog[];
  calendarEvents: CalendarEvent[];
  meetingRecords: MeetingRecord[];
  orgData: any;
  serverIp: string;
  tunnelUrl: string | null;
  
  // Program Actions
  addProgram: (program: Omit<ProgramItem, 'id' | 'monthlyPermits'>) => void;
  updateProgram: (id: string, updatedData: Partial<ProgramItem>) => void;
  deleteProgram: (id: string) => void;
  updateProgramMonthPermit: (progId: string, month: number, permitData: Partial<MonthlyPermit>) => void;

  // Work Permit Actions
  addWorkPermit: (permit: Omit<WorkPermit, 'id' | 'permitNumber' | 'createdAt' | 'updatedAt'>) => WorkPermit;
  updateWorkPermit: (id: string, data: Partial<WorkPermit>) => void;
  deleteWorkPermit: (id: string) => void;
  approveWorkPermit: (id: string, safetyOfficerName: string, digitalSignature: string, officerSignature?: string) => void;
  rejectWorkPermit: (id: string, reason: string) => void;
  updatePermitStatus: (id: string, status: PermitStatus) => void;

  // Template Actions
  addTemplate: (template: Omit<WorkPermitTemplate, 'id' | 'createdAt' | 'isCustom'>) => void;
  updateTemplate: (id: string, updatedData: Partial<WorkPermitTemplate>) => void;
  deleteTemplate: (id: string) => void;

  // Worker Opinion Actions
  addWorkerOpinion: (opinion: Omit<WorkerOpinion, 'id' | 'opinionNumber' | 'createdAt' | 'status'>) => WorkerOpinion;
  deleteWorkerOpinion: (id: string) => void;
  updateOpinionStatus: (id: string, status: OpinionStatus) => void;
  resolveWorkerOpinion: (
    id: string,
    actionContent: string,
    actionPhotos: string[],
    actionOfficer: string,
    officerSignature?: string
  ) => void;

  // Safety Logs Actions
  addSafetyLog: (log: Omit<DailySafetyLog, 'id' | 'createdAt'>) => void;
  updateSafetyLog: (id: string, updatedData: Partial<DailySafetyLog>) => void;
  deleteSafetyLog: (id: string) => void;

  // Calendar Events Actions
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateCalendarEvent: (id: string, updatedData: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;

  // Meeting Minutes Actions
  addMeetingRecord: (meeting: Omit<MeetingRecord, 'id' | 'createdAt'>) => void;
  deleteMeetingRecord: (id: string) => void;

  // Org Data Actions
  updateOrgData: (data: any) => void;

  // TBM, Inspection & Others
  addSafetyInspection: (inspection: Omit<SafetyInspection, 'id' | 'inspectionNumber' | 'createdAt'>) => void;
  addTBMRecord: (tbm: Omit<TBMRecord, 'id' | 'tbmNumber' | 'createdAt'>) => void;
  updateTBMRecord: (id: string, updatedData: Partial<TBMRecord>) => void;
  deleteTBMRecord: (id: string) => void;
  addIncidentRecord: (incident: Omit<IncidentRecord, 'id' | 'incidentNumber' | 'createdAt'>) => void;
  addContractor: (contractor: Omit<Contractor, 'id'>) => void;
  
  refreshData: () => Promise<void>;
  resetData: () => void;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export function SafetyProvider({ children }: { children: React.ReactNode }) {
  const [workPermits, setWorkPermits] = useState<WorkPermit[]>(INITIAL_WORK_PERMITS);
  const [workerOpinions, setWorkerOpinions] = useState<WorkerOpinion[]>(INITIAL_WORKER_OPINIONS);
  const [inspections, setInspections] = useState<SafetyInspection[]>(INITIAL_INSPECTIONS);
  const [tbmRecords, setTbmRecords] = useState<TBMRecord[]>(INITIAL_TBM_RECORDS);
  const [incidents, setIncidents] = useState<IncidentRecord[]>(INITIAL_INCIDENTS);
  const [contractors, setContractors] = useState<Contractor[]>(INITIAL_CONTRACTORS);
  const [templates, setTemplates] = useState<WorkPermitTemplate[]>(INITIAL_TEMPLATES);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [safetyLogs, setSafetyLogs] = useState<DailySafetyLog[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [meetingRecords, setMeetingRecords] = useState<MeetingRecord[]>([]);
  const [orgData, setOrgData] = useState<any>(null);
  const [serverIp, setServerIp] = useState('10.210.115.120');
  const [tunnelUrl, setTunnelUrl] = useState<string | null>(null);

  // Mutation Guard: Prevents background polling from overwriting unsaved or newly saved edits
  const lastMutationTimeRef = useRef<number>(0);

  // Initial load from localStorage on client mount
  useEffect(() => {
    try {
      const savedTemplates = localStorage.getItem('PRISM_TEMPLATES');
      if (savedTemplates) {
        const parsed = JSON.parse(savedTemplates);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const unique = deduplicateTemplates(parsed);
          setTemplates(unique);
          localStorage.setItem('PRISM_TEMPLATES', JSON.stringify(unique));
        }
      }
      const savedOrg = localStorage.getItem('PRISM_ORG_DATA');
      if (savedOrg) {
        const parsedOrg = JSON.parse(savedOrg);
        if (parsedOrg) {
          setOrgData(parsedOrg);
        }
      }
    } catch (e) {}
  }, []);

  // Fetch Server Data (Single Central Source of Truth with Race-Condition Guard)
  const refreshData = useCallback(async () => {
    // If a user mutation occurred within the last 4 seconds, skip background overwrite
    if (Date.now() - lastMutationTimeRef.current < 4000) {
      return;
    }
    try {
      const res = await fetch(`/api/safety-data?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      if (res.ok) {
        // Re-check after awaiting fetch to prevent race conditions from in-flight requests
        if (Date.now() - lastMutationTimeRef.current < 4000) {
          return;
        }
        const data = await res.json();
        if (data.workPermits) setWorkPermits(data.workPermits);
        if (data.workerOpinions) setWorkerOpinions(data.workerOpinions);
        if (data.inspections) setInspections(data.inspections);
        if (data.contractors) setContractors(data.contractors);
        if (data.tbmRecords) setTbmRecords(data.tbmRecords);
        if (data.incidents) setIncidents(data.incidents);
        if (data.programs) setPrograms(data.programs);
        if (data.safetyLogs) setSafetyLogs(data.safetyLogs);
        if (data.calendarEvents) setCalendarEvents(data.calendarEvents);
        if (data.meetingRecords) setMeetingRecords(data.meetingRecords);

        // Smart templates sync (strictly deduplicated, single central source of truth)
        if (data.templates && Array.isArray(data.templates) && data.templates.length > 0) {
          try {
            const uniqueTemplates = deduplicateTemplates(data.templates);
            setTemplates(uniqueTemplates);
            localStorage.setItem('PRISM_TEMPLATES', JSON.stringify(uniqueTemplates));
          } catch (e) {
            setTemplates(data.templates);
          }
        }

        // Central OrgData sync
        if (data.orgData) {
          setOrgData(data.orgData);
          try {
            localStorage.setItem('PRISM_ORG_DATA', JSON.stringify(data.orgData));
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn('API sync warning:', e);
    }
  }, []);

  // Fetch IP & Tunnel
  const fetchIpInfo = useCallback(() => {
    fetch('/api/ip')
      .then(res => res.json())
      .then(data => {
        if (data.ip) setServerIp(data.ip);
        if (data.tunnelUrl) setTunnelUrl(data.tunnelUrl);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchIpInfo();
    const ipInterval = setInterval(fetchIpInfo, 5000);
    return () => clearInterval(ipInterval);
  }, [fetchIpInfo]);

  // Initial fetch and 2s polling for real-time mobile sync
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Program Actions
  const addProgram = async (programData: Omit<ProgramItem, 'id' | 'monthlyPermits'>) => {
    lastMutationTimeRef.current = Date.now();
    const newMonths: MonthlyPermit[] = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthLabel: `${i + 1}월`,
      status: '미발행' as const
    }));
    const newProg: ProgramItem = {
      ...programData,
      id: `prog-${Date.now()}`,
      monthlyPermits: newMonths
    };
    setPrograms(prev => [newProg, ...prev]);
    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_program', payload: programData })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.programs) setPrograms(json.programs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateProgram = async (id: string, updatedData: Partial<ProgramItem>) => {
    lastMutationTimeRef.current = Date.now();
    setPrograms(prev => prev.map(p => (p.id === id ? { ...p, ...updatedData } : p)));
    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_program', payload: { id, ...updatedData } })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.programs) setPrograms(json.programs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteProgram = async (id: string) => {
    lastMutationTimeRef.current = Date.now();
    setPrograms(prev => prev.filter(p => p.id !== id));
    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_program', payload: { id } })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.programs) setPrograms(json.programs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateProgramMonthPermit = async (progId: string, month: number, permitData: Partial<MonthlyPermit>) => {
    lastMutationTimeRef.current = Date.now();
    setPrograms(prev =>
      prev.map(p => {
        if (p.id === progId) {
          const updatedMonths = p.monthlyPermits.map(m => (m.month === month ? { ...m, ...permitData } : m));
          return { ...p, monthlyPermits: updatedMonths };
        }
        return p;
      })
    );
    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_program_month', payload: { progId, month, permitData } })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.programs) setPrograms(json.programs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Work Permit Actions
  const addWorkPermit = (permitData: Omit<WorkPermit, 'id' | 'permitNumber' | 'createdAt' | 'updatedAt'>) => {
    lastMutationTimeRef.current = Date.now();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(workPermits.length + 1).padStart(2, '0');
    const newPermit: WorkPermit = {
      ...permitData,
      id: `wp-${Date.now()}`,
      permitNumber: `PRISM-WP-${todayStr}-${seq}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setWorkPermits(prev => [newPermit, ...prev]);

    fetch('/api/safety-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_permit', payload: permitData })
    }).catch(e => console.error('Add permit API error:', e));

    return newPermit;
  };

  const updateWorkPermit = async (id: string, data: Partial<WorkPermit>) => {
    lastMutationTimeRef.current = Date.now();
    setWorkPermits(prev =>
      prev.map(p => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) } : p))
    );
    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_permit', payload: { id, ...data } })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.item) {
          setWorkPermits(prev => prev.map(p => (p.id === id ? { ...p, ...json.item } : p)));
        }
      }
    } catch (e) {
      console.error('Update permit API error:', e);
    }
  };

  const deleteWorkPermit = async (id: string) => {
    lastMutationTimeRef.current = Date.now();
    setWorkPermits(prev => prev.filter(p => p.id !== id));
    try {
      await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_permit', payload: { id } })
      });
    } catch (e) {
      console.error('Delete permit API error:', e);
    }
  };

  const approveWorkPermit = async (
    id: string,
    safetyOfficerName: string,
    digitalSignature: string,
    officerSignature?: string
  ) => {
    lastMutationTimeRef.current = Date.now();
    setWorkPermits(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              status: '승인완료',
              safetyOfficerName,
              digitalSignature,
              officerSignature: officerSignature || p.officerSignature,
              approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
            }
          : p
      )
    );

    try {
      await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_permit',
          payload: { id, safetyOfficerName, digitalSignature, officerSignature }
        })
      });
    } catch (e) {
      console.error('Approve permit API error:', e);
    }
  };

  const rejectWorkPermit = async (id: string, reason: string) => {
    lastMutationTimeRef.current = Date.now();
    setWorkPermits(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              status: '반려',
              rejectReason: reason,
              updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
            }
          : p
      )
    );
    try {
      await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject_permit', payload: { id, reason } })
      });
    } catch (e) {
      console.error('Reject permit API error:', e);
    }
  };

  const updatePermitStatus = async (id: string, status: PermitStatus) => {
    lastMutationTimeRef.current = Date.now();
    setWorkPermits(prev =>
      prev.map(p => (p.id === id ? { ...p, status, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) } : p))
    );
    try {
      await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_permit_status', payload: { id, status } })
      });
    } catch (e) {
      console.error('Update permit status API error:', e);
    }
  };

  // Template Actions
  const addTemplate = async (templateData: Omit<WorkPermitTemplate, 'id' | 'createdAt' | 'isCustom'>) => {
    lastMutationTimeRef.current = Date.now();
    const newTmpl: WorkPermitTemplate = {
      ...templateData,
      id: `tmpl-${Date.now()}`,
      isCustom: true,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setTemplates(prev => {
      const cleanTitle = newTmpl.title.trim().toLowerCase();
      const cleanWorkType = newTmpl.workType.trim().toLowerCase();
      const exists = prev.some(
        t => t.id === newTmpl.id ||
             (t.title && t.title.trim().toLowerCase() === cleanTitle && 
              t.workType && t.workType.trim().toLowerCase() === cleanWorkType)
      );
      if (exists) return prev;
      const updated = deduplicateTemplates([...prev, newTmpl]);
      try {
        localStorage.setItem('PRISM_TEMPLATES', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_template', payload: newTmpl })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.templates) {
          const unique = deduplicateTemplates(json.templates);
          setTemplates(unique);
          try {
            localStorage.setItem('PRISM_TEMPLATES', JSON.stringify(unique));
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error('Add template API error:', e);
    }
  };

  const updateTemplate = async (id: string, updatedData: Partial<WorkPermitTemplate>) => {
    lastMutationTimeRef.current = Date.now();
    setTemplates(prev => {
      const updated = prev.map(t => (t.id === id ? { ...t, ...updatedData } : t));
      try {
        localStorage.setItem('PRISM_TEMPLATES', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_template', payload: { id, ...updatedData } })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.templates) {
          const unique = deduplicateTemplates(json.templates);
          setTemplates(unique);
          try {
            localStorage.setItem('PRISM_TEMPLATES', JSON.stringify(unique));
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error('Update template API error:', e);
    }
  };

  const deleteTemplate = async (id: string) => {
    lastMutationTimeRef.current = Date.now();
    setTemplates(prev => {
      const target = prev.find(t => t.id === id);
      const updated = prev.filter(t => {
        if (t.id === id) return false;
        if (target && target.isCustom && target.title && target.workType &&
            t.title?.trim() === target.title.trim() && t.workType?.trim() === target.workType.trim()) {
          return false;
        }
        return true;
      });
      try {
        localStorage.setItem('PRISM_TEMPLATES', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_template', payload: { id } })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.templates) {
          const unique = deduplicateTemplates(json.templates);
          setTemplates(unique);
          try {
            localStorage.setItem('PRISM_TEMPLATES', JSON.stringify(unique));
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error('Delete template API error:', e);
    }
  };

  // Worker Opinion Actions
  const addWorkerOpinion = (opinionData: Omit<WorkerOpinion, 'id' | 'opinionNumber' | 'createdAt' | 'status'>) => {
    lastMutationTimeRef.current = Date.now();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(workerOpinions.length + 1).padStart(2, '0');
    const newOpinion: WorkerOpinion = {
      ...opinionData,
      id: `op-${Date.now()}`,
      opinionNumber: `VOICE-${todayStr}-${seq}`,
      status: '접수',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setWorkerOpinions(prev => [newOpinion, ...prev]);

    fetch('/api/safety-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_opinion', payload: opinionData })
    }).catch(e => console.error('Add opinion API error:', e));

    return newOpinion;
  };

  const deleteWorkerOpinion = async (id: string) => {
    lastMutationTimeRef.current = Date.now();
    setWorkerOpinions(prev => prev.filter(o => o.id !== id));
    try {
      await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_opinion', payload: { id } })
      });
    } catch (e) {
      console.error('Delete opinion API error:', e);
    }
  };

  const updateOpinionStatus = async (id: string, status: OpinionStatus) => {
    lastMutationTimeRef.current = Date.now();
    setWorkerOpinions(prev =>
      prev.map(o => (o.id === id ? { ...o, status } : o))
    );
    try {
      await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_opinion_status', payload: { id, status } })
      });
    } catch (e) {
      console.error('Update opinion status API error:', e);
    }
  };

  const resolveWorkerOpinion = async (
    id: string,
    actionContent: string,
    actionPhotos: string[],
    actionOfficer: string,
    officerSignature?: string
  ) => {
    lastMutationTimeRef.current = Date.now();
    setWorkerOpinions(prev =>
      prev.map(o =>
        o.id === id
          ? {
              ...o,
              status: '조치완료',
              actionContent,
              actionPhotos,
              actionOfficer,
              officerSignature: officerSignature || o.officerSignature,
              actionDate: new Date().toISOString().replace('T', ' ').slice(0, 16)
            }
          : o
      )
    );

    try {
      await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve_opinion',
          payload: { id, actionContent, actionPhotos, actionOfficer, officerSignature }
        })
      });
    } catch (e) {
      console.error('Resolve opinion API error:', e);
    }
  };

  // Safety Logs Actions
  const addSafetyLog = async (logData: Omit<DailySafetyLog, 'id' | 'createdAt'>) => {
    lastMutationTimeRef.current = Date.now();
    const newLog: DailySafetyLog = {
      ...logData,
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setSafetyLogs(prev => [newLog, ...prev]);

    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_safety_log', payload: logData })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.safetyLogs) setSafetyLogs(json.safetyLogs);
      }
    } catch (e) {
      console.error('Add safety log API error:', e);
    }
  };

  const updateSafetyLog = async (id: string, updatedData: Partial<DailySafetyLog>) => {
    lastMutationTimeRef.current = Date.now();
    setSafetyLogs(prev => prev.map(l => (l.id === id ? { ...l, ...updatedData } : l)));
    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_safety_log', payload: { id, ...updatedData } })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.safetyLogs) setSafetyLogs(json.safetyLogs);
      }
    } catch (e) {
      console.error('Update safety log API error:', e);
    }
  };

  const deleteSafetyLog = async (id: string) => {
    lastMutationTimeRef.current = Date.now();
    setSafetyLogs(prev => prev.filter(l => l.id !== id));
    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_safety_log', payload: { id } })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.safetyLogs) setSafetyLogs(json.safetyLogs);
      }
    } catch (e) {
      console.error('Delete safety log API error:', e);
    }
  };

  // Calendar Events Actions
  const addCalendarEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    lastMutationTimeRef.current = Date.now();
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `e-${Date.now()}`
    };
    setCalendarEvents(prev => [newEvent, ...prev]);
    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_calendar_event', payload: eventData })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.calendarEvents) setCalendarEvents(json.calendarEvents);
      }
    } catch (e) {
      console.error('Add calendar event API error:', e);
    }
  };

  const updateCalendarEvent = async (id: string, updatedData: Partial<CalendarEvent>) => {
    lastMutationTimeRef.current = Date.now();
    setCalendarEvents(prev => prev.map(e => (e.id === id ? { ...e, ...updatedData } : e)));
    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_calendar_event', payload: { id, ...updatedData } })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.calendarEvents) setCalendarEvents(json.calendarEvents);
      }
    } catch (e) {
      console.error('Update calendar event API error:', e);
    }
  };

  const deleteCalendarEvent = async (id: string) => {
    lastMutationTimeRef.current = Date.now();
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_calendar_event', payload: { id } })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.calendarEvents) setCalendarEvents(json.calendarEvents);
      }
    } catch (e) {
      console.error('Delete calendar event API error:', e);
    }
  };

  // Meeting Minutes Actions
  const addMeetingRecord = async (meetingData: Omit<MeetingRecord, 'id' | 'createdAt'>) => {
    lastMutationTimeRef.current = Date.now();
    const newMeeting: MeetingRecord = {
      ...meetingData,
      id: `meet-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setMeetingRecords(prev => [newMeeting, ...prev]);
    try {
      await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_meeting', payload: meetingData })
      });
    } catch (e) {
      console.error('Add meeting record API error:', e);
    }
  };

  const deleteMeetingRecord = async (id: string) => {
    lastMutationTimeRef.current = Date.now();
    setMeetingRecords(prev => prev.filter(m => m.id !== id));
    try {
      await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_meeting', payload: { id } })
      });
    } catch (e) {
      console.error('Delete meeting record API error:', e);
    }
  };

  // Org Data Actions
  const updateOrgData = async (data: any) => {
    lastMutationTimeRef.current = Date.now();
    setOrgData((prev: any) => {
      const updated = { ...prev, ...data };
      try {
        localStorage.setItem('PRISM_ORG_DATA', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_org_data', payload: data })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.orgData) {
          setOrgData(json.orgData);
          try {
            localStorage.setItem('PRISM_ORG_DATA', JSON.stringify(json.orgData));
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error('Update org data API error:', e);
    }
  };

  // Inspection, TBM, Incident, Contractor
  const addSafetyInspection = async (inspectionData: Omit<SafetyInspection, 'id' | 'inspectionNumber' | 'createdAt'>) => {
    lastMutationTimeRef.current = Date.now();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(inspections.length + 1).padStart(2, '0');
    const newInsp: SafetyInspection = {
      ...inspectionData,
      id: `ins-${Date.now()}`,
      inspectionNumber: `INSP-${todayStr}-${seq}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setInspections(prev => [newInsp, ...prev]);
    try {
      await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_inspection', payload: newInsp })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const addTBMRecord = async (tbmData: Omit<TBMRecord, 'id' | 'tbmNumber' | 'createdAt'>) => {
    lastMutationTimeRef.current = Date.now();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(tbmRecords.length + 1).padStart(2, '0');
    const newTBM: TBMRecord = {
      ...tbmData,
      id: `tbm-${Date.now()}`,
      tbmNumber: `TBM-${todayStr}-${seq}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setTbmRecords(prev => [newTBM, ...prev]);
    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_tbm', payload: tbmData })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.tbmRecords) setTbmRecords(json.tbmRecords);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateTBMRecord = async (id: string, updatedData: Partial<TBMRecord>) => {
    lastMutationTimeRef.current = Date.now();
    setTbmRecords(prev => prev.map(t => (t.id === id ? { ...t, ...updatedData } : t)));
    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_tbm', payload: { id, ...updatedData } })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.tbmRecords) setTbmRecords(json.tbmRecords);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTBMRecord = async (id: string) => {
    lastMutationTimeRef.current = Date.now();
    setTbmRecords(prev => prev.filter(t => t.id !== id));
    try {
      const res = await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_tbm', payload: { id } })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.tbmRecords) setTbmRecords(json.tbmRecords);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addIncidentRecord = async (incidentData: Omit<IncidentRecord, 'id' | 'incidentNumber' | 'createdAt'>) => {
    lastMutationTimeRef.current = Date.now();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(incidents.length + 1).padStart(2, '0');
    const newInc: IncidentRecord = {
      ...incidentData,
      id: `inc-${Date.now()}`,
      incidentNumber: `INC-${todayStr}-${seq}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setIncidents(prev => [newInc, ...prev]);
    try {
      await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_incident', payload: newInc })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const addContractor = async (contractorData: Omit<Contractor, 'id'>) => {
    lastMutationTimeRef.current = Date.now();
    const newContractor: Contractor = {
      ...contractorData,
      id: `con-${Date.now()}`
    };
    setContractors(prev => [newContractor, ...prev]);
    try {
      await fetch('/api/safety-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_contractor', payload: newContractor })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const resetData = () => {
    setWorkPermits(INITIAL_WORK_PERMITS);
    setWorkerOpinions(INITIAL_WORKER_OPINIONS);
    setInspections(INITIAL_INSPECTIONS);
    setContractors(INITIAL_CONTRACTORS);
    setTbmRecords(INITIAL_TBM_RECORDS);
    setIncidents(INITIAL_INCIDENTS);
    setTemplates(INITIAL_TEMPLATES);
  };

  return (
    <SafetyContext.Provider
      value={{
        workPermits,
        workerOpinions,
        inspections,
        tbmRecords,
        incidents,
        contractors,
        templates,
        programs,
        safetyLogs,
        calendarEvents,
        meetingRecords,
        orgData,
        serverIp,
        tunnelUrl,
        addProgram,
        updateProgram,
        deleteProgram,
        updateProgramMonthPermit,
        addWorkPermit,
        updateWorkPermit,
        deleteWorkPermit,
        approveWorkPermit,
        rejectWorkPermit,
        updatePermitStatus,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        addWorkerOpinion,
        deleteWorkerOpinion,
        updateOpinionStatus,
        resolveWorkerOpinion,
        addSafetyLog,
        updateSafetyLog,
        deleteSafetyLog,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        addMeetingRecord,
        deleteMeetingRecord,
        updateOrgData,
        addSafetyInspection,
        addTBMRecord,
        updateTBMRecord,
        deleteTBMRecord,
        addIncidentRecord,
        addContractor,
        refreshData,
        resetData
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
}
