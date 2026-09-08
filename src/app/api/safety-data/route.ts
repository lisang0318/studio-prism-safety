import { NextResponse } from 'next/server';
import { getDB, saveDB } from '@/lib/db';
import { WorkPermit, WorkerOpinion, WorkPermitTemplate, DailySafetyLog } from '@/types';

export async function GET() {
  const db = getDB();
  return NextResponse.json(db);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    const db = getDB();

    // ==========================================
    // 1. WORK PERMIT ACTIONS
    // ==========================================
    if (action === 'add_permit') {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const seq = String(db.workPermits.length + 1).padStart(2, '0');
      const newPermit: WorkPermit = {
        ...payload,
        id: `wp-${Date.now()}`,
        permitNumber: `PRISM-WP-${todayStr}-${seq}`,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        status: payload.status || '승인대기'
      };
      db.workPermits.unshift(newPermit);

      // Auto-link or auto-register program in 12-month matrix
      if (newPermit.productionName) {
        const cleanPermitTitle = newPermit.productionName.replace(/[\[\]\s]/g, '').toLowerCase();
        let matched = false;
        if (!db.programs) db.programs = [];
        db.programs = db.programs.map((prog: any) => {
          const cleanProgTitle = prog.title.replace(/[\[\]\s]/g, '').toLowerCase();
          if (cleanProgTitle.includes(cleanPermitTitle) || cleanPermitTitle.includes(cleanProgTitle)) {
            matched = true;
            const currentMonth = new Date(newPermit.startDate || Date.now()).getMonth() + 1;
            const updatedMonths = prog.monthlyPermits.map((m: any) => {
              if (m.month === currentMonth) {
                return {
                  ...m,
                  status: newPermit.status || '승인대기',
                  permitTitle: newPermit.title,
                  permitNumber: newPermit.permitNumber,
                  workType: newPermit.workType,
                  date: newPermit.startDate?.slice(0, 10) || new Date().toISOString().slice(0, 10)
                };
              }
              return m;
            });
            return { ...prog, monthlyPermits: updatedMonths };
          }
          return prog;
        });

        // If not registered in programs list yet, automatically create program entry!
        if (!matched) {
          const currentMonth = new Date(newPermit.startDate || Date.now()).getMonth() + 1;
          const newMonths = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            monthLabel: `${i + 1}월`,
            status: (i + 1 === currentMonth ? (newPermit.status || '승인대기') : '미발행') as any,
            ...(i + 1 === currentMonth ? {
              permitTitle: newPermit.title,
              permitNumber: newPermit.permitNumber,
              workType: newPermit.workType,
              date: newPermit.startDate?.slice(0, 10) || new Date().toISOString().slice(0, 10)
            } : {})
          }));
          db.programs.unshift({
            id: `prog-${Date.now()}`,
            title: newPermit.productionName,
            genre: newPermit.title?.includes('콘서트') ? '콘서트' : '예능',
            status: '제작중',
            mainStudio: newPermit.studioName || '메인 세트장',
            pd: newPermit.managerName || '책임 PD',
            safetyOfficer: '이상욱',
            riskRating: newPermit.riskLevel === '고위험' ? 'A등급 (고위험)' : 'B등급 (일반)',
            monthlyPermits: newMonths
          });
        }
      }

      saveDB(db);
      return NextResponse.json({ success: true, item: newPermit });
    }

    if (action === 'update_permit') {
      const { id, ...updatedFields } = payload;
      let updatedPermit: WorkPermit | undefined;
      db.workPermits = db.workPermits.map(p => {
        if (p.id === id) {
          updatedPermit = {
            ...p,
            ...updatedFields,
            updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
          };
          return updatedPermit;
        }
        return p;
      });

      if (updatedPermit && (updatedPermit as WorkPermit).productionName) {
        const cleanPermitTitle = (updatedPermit as WorkPermit).productionName.replace(/[\[\]\s]/g, '').toLowerCase();
        let matched = false;
        if (!db.programs) db.programs = [];
        db.programs = db.programs.map((prog: any) => {
          const cleanProgTitle = prog.title.replace(/[\[\]\s]/g, '').toLowerCase();
          if (cleanProgTitle.includes(cleanPermitTitle) || cleanPermitTitle.includes(cleanProgTitle)) {
            matched = true;
            const currentMonth = new Date((updatedPermit as WorkPermit).startDate || Date.now()).getMonth() + 1;
            const updatedMonths = prog.monthlyPermits.map((m: any) => {
              if (m.month === currentMonth) {
                return {
                  ...m,
                  status: (updatedPermit as WorkPermit).status || m.status,
                  permitTitle: (updatedPermit as WorkPermit).title,
                  workType: (updatedPermit as WorkPermit).workType,
                  date: (updatedPermit as WorkPermit).startDate?.slice(0, 10) || m.date
                };
              }
              return m;
            });
            return { ...prog, monthlyPermits: updatedMonths };
          }
          return prog;
        });

        if (!matched) {
          const currentMonth = new Date((updatedPermit as WorkPermit).startDate || Date.now()).getMonth() + 1;
          const newMonths = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            monthLabel: `${i + 1}월`,
            status: (i + 1 === currentMonth ? ((updatedPermit as WorkPermit).status || '승인대기') : '미발행') as any,
            ...(i + 1 === currentMonth ? {
              permitTitle: (updatedPermit as WorkPermit).title,
              permitNumber: (updatedPermit as WorkPermit).permitNumber,
              workType: (updatedPermit as WorkPermit).workType,
              date: (updatedPermit as WorkPermit).startDate?.slice(0, 10) || new Date().toISOString().slice(0, 10)
            } : {})
          }));
          db.programs.unshift({
            id: `prog-${Date.now()}`,
            title: (updatedPermit as WorkPermit).productionName,
            genre: (updatedPermit as WorkPermit).title?.includes('콘서트') ? '콘서트' : '예능',
            status: '제작중',
            mainStudio: (updatedPermit as WorkPermit).studioName || '메인 세트장',
            pd: (updatedPermit as WorkPermit).managerName || '책임 PD',
            safetyOfficer: '이상욱',
            riskRating: (updatedPermit as WorkPermit).riskLevel === '고위험' ? 'A등급 (고위험)' : 'B등급 (일반)',
            monthlyPermits: newMonths
          });
        }
      }

      saveDB(db);
      return NextResponse.json({ success: true, item: updatedPermit });
    }

    if (action === 'approve_permit') {
      const { id, safetyOfficerName, digitalSignature, officerSignature } = payload;
      let approvedPermit: WorkPermit | undefined;
      db.workPermits = db.workPermits.map(p => {
        if (p.id === id) {
          approvedPermit = {
            ...p,
            status: '승인완료',
            safetyOfficerName,
            digitalSignature,
            officerSignature: officerSignature || p.officerSignature,
            approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
          };
          return approvedPermit;
        }
        return p;
      });

      // Update program matrix status to '승인완료'
      if (approvedPermit && (approvedPermit as WorkPermit).productionName) {
        const cleanPermitTitle = (approvedPermit as WorkPermit).productionName.replace(/[\[\]\s]/g, '').toLowerCase();
        let matched = false;
        if (!db.programs) db.programs = [];
        db.programs = db.programs.map((prog: any) => {
          const cleanProgTitle = prog.title.replace(/[\[\]\s]/g, '').toLowerCase();
          if (cleanProgTitle.includes(cleanPermitTitle) || cleanProgTitle.includes(cleanProgTitle)) {
            matched = true;
            const currentMonth = new Date((approvedPermit as WorkPermit).startDate || Date.now()).getMonth() + 1;
            const updatedMonths = prog.monthlyPermits.map((m: any) => {
              if (m.month === currentMonth) {
                return {
                  ...m,
                  status: '승인완료',
                  officer: safetyOfficerName,
                  permitTitle: (approvedPermit as WorkPermit).title,
                  permitNumber: (approvedPermit as WorkPermit).permitNumber,
                  workType: (approvedPermit as WorkPermit).workType,
                  date: (approvedPermit as WorkPermit).startDate?.slice(0, 10) || m.date
                };
              }
              return m;
            });
            return { ...prog, monthlyPermits: updatedMonths };
          }
          return prog;
        });

        if (!matched) {
          const currentMonth = new Date((approvedPermit as WorkPermit).startDate || Date.now()).getMonth() + 1;
          const newMonths = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            monthLabel: `${i + 1}월`,
            status: (i + 1 === currentMonth ? '승인완료' : '미발행') as any,
            ...(i + 1 === currentMonth ? {
              permitTitle: (approvedPermit as WorkPermit).title,
              permitNumber: (approvedPermit as WorkPermit).permitNumber,
              workType: (approvedPermit as WorkPermit).workType,
              date: (approvedPermit as WorkPermit).startDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
              officer: safetyOfficerName
            } : {})
          }));
          db.programs.unshift({
            id: `prog-${Date.now()}`,
            title: (approvedPermit as WorkPermit).productionName,
            genre: (approvedPermit as WorkPermit).title?.includes('콘서트') ? '콘서트' : '예능',
            status: '제작중',
            mainStudio: (approvedPermit as WorkPermit).studioName || '메인 세트장',
            pd: (approvedPermit as WorkPermit).managerName || '책임 PD',
            safetyOfficer: safetyOfficerName || '이상욱',
            riskRating: (approvedPermit as WorkPermit).riskLevel === '고위험' ? 'A등급 (고위험)' : 'B등급 (일반)',
            monthlyPermits: newMonths
          });
        }
      }

      saveDB(db);
      return NextResponse.json({ success: true, item: approvedPermit });
    }

    if (action === 'reject_permit') {
      const { id, reason } = payload;
      let rejectedPermit: WorkPermit | undefined;
      db.workPermits = db.workPermits.map(p => {
        if (p.id === id) {
          rejectedPermit = {
            ...p,
            status: '반려',
            rejectReason: reason,
            updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
          };
          return rejectedPermit;
        }
        return p;
      });

      if (rejectedPermit && (rejectedPermit as WorkPermit).productionName) {
        const cleanPermitTitle = (rejectedPermit as WorkPermit).productionName.replace(/[\[\]\s]/g, '').toLowerCase();
        if (db.programs && db.programs.length > 0) {
          db.programs = db.programs.map((prog: any) => {
            const cleanProgTitle = prog.title.replace(/[\[\]\s]/g, '').toLowerCase();
            if (cleanProgTitle.includes(cleanPermitTitle) || cleanPermitTitle.includes(cleanProgTitle)) {
              const currentMonth = new Date((rejectedPermit as WorkPermit).startDate || Date.now()).getMonth() + 1;
              const updatedMonths = prog.monthlyPermits.map((m: any) => {
                if (m.month === currentMonth) {
                  return { ...m, status: '반려' };
                }
                return m;
              });
              return { ...prog, monthlyPermits: updatedMonths };
            }
            return prog;
          });
        }
      }

      saveDB(db);
      return NextResponse.json({ success: true });
    }

    if (action === 'update_permit_status') {
      const { id, status } = payload;
      db.workPermits = db.workPermits.map(p =>
        p.id === id
          ? {
              ...p,
              status,
              updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
            }
          : p
      );
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_permit') {
      const { id } = payload;
      const targetPermit = db.workPermits.find(p => p.id === id);
      db.workPermits = db.workPermits.filter(p => p.id !== id);

      if (targetPermit && targetPermit.productionName && db.programs) {
        const cleanPermitTitle = targetPermit.productionName.replace(/[\[\]\s]/g, '').toLowerCase();
        db.programs = db.programs.map((prog: any) => {
          const cleanProgTitle = prog.title.replace(/[\[\]\s]/g, '').toLowerCase();
          if (cleanProgTitle.includes(cleanPermitTitle) || cleanPermitTitle.includes(cleanProgTitle)) {
            const currentMonth = new Date(targetPermit.startDate || Date.now()).getMonth() + 1;
            const updatedMonths = prog.monthlyPermits.map((m: any) => {
              if (m.month === currentMonth && (m.permitNumber === targetPermit.permitNumber || m.permitTitle === targetPermit.title)) {
                return {
                  month: m.month,
                  monthLabel: m.monthLabel,
                  status: '미발행'
                };
              }
              return m;
            });
            return { ...prog, monthlyPermits: updatedMonths };
          }
          return prog;
        });
      }

      saveDB(db);
      return NextResponse.json({ success: true });
    }

    // ==========================================
    // 2. TEMPLATE ACTIONS
    // ==========================================
    if (action === 'add_template') {
      const newTemplate: WorkPermitTemplate = {
        ...payload,
        id: `tmpl-${Date.now()}`,
        isCustom: true,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      if (!db.templates) db.templates = [];
      db.templates.push(newTemplate);
      saveDB(db);
      return NextResponse.json({ success: true, item: newTemplate });
    }

    if (action === 'update_template') {
      const { id, ...updatedFields } = payload;
      if (!db.templates) db.templates = [];
      db.templates = db.templates.map(t =>
        t.id === id ? { ...t, ...updatedFields } : t
      );
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_template') {
      const { id } = payload;
      db.templates = (db.templates || []).filter(t => t.id !== id);
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    // ==========================================
    // 3. WORKER OPINION ACTIONS
    // ==========================================
    if (action === 'add_opinion') {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const seq = String(db.workerOpinions.length + 1).padStart(2, '0');
      const newOpinion: WorkerOpinion = {
        ...payload,
        id: `op-${Date.now()}`,
        opinionNumber: `VOICE-${todayStr}-${seq}`,
        status: '접수',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      db.workerOpinions.unshift(newOpinion);
      saveDB(db);
      return NextResponse.json({ success: true, item: newOpinion });
    }

    if (action === 'update_opinion_status') {
      const { id, status } = payload;
      db.workerOpinions = db.workerOpinions.map(o =>
        o.id === id ? { ...o, status } : o
      );
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    if (action === 'resolve_opinion') {
      const { id, actionContent, actionPhotos, actionOfficer, officerSignature } = payload;
      db.workerOpinions = db.workerOpinions.map(o =>
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
      );
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_opinion') {
      const { id } = payload;
      db.workerOpinions = db.workerOpinions.filter(o => o.id !== id);
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    // ==========================================
    // 4. PROGRAM & MATRIX ACTIONS
    // ==========================================
    if (action === 'add_program') {
      const newMonths = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        monthLabel: `${i + 1}월`,
        status: '미발행'
      }));
      const newProg = {
        ...payload,
        id: `prog-${Date.now()}`,
        monthlyPermits: newMonths
      };
      if (!db.programs) db.programs = [];
      db.programs.unshift(newProg);
      saveDB(db);
      return NextResponse.json({ success: true, item: newProg });
    }

    if (action === 'update_program') {
      const { id, ...updatedFields } = payload;
      if (!db.programs) db.programs = [];
      db.programs = db.programs.map(p =>
        p.id === id ? { ...p, ...updatedFields } : p
      );
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_program') {
      const { id } = payload;
      if (!db.programs) db.programs = [];
      db.programs = db.programs.filter(p => p.id !== id);
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    if (action === 'update_program_month') {
      const { progId, month, permitData } = payload;
      if (!db.programs) db.programs = [];
      db.programs = db.programs.map(p => {
        if (p.id === progId) {
          const updatedMonths = p.monthlyPermits.map((m: any) =>
            m.month === month ? { ...m, ...permitData } : m
          );
          return { ...p, monthlyPermits: updatedMonths };
        }
        return p;
      });
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    // ==========================================
    // 5. TBM ACTIONS
    // ==========================================
    if (action === 'add_tbm') {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const seq = String((db.tbmRecords || []).length + 1).padStart(2, '0');
      const newTBM = {
        ...payload,
        id: `tbm-${Date.now()}`,
        tbmNumber: `TBM-${todayStr}-${seq}`,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      if (!db.tbmRecords) db.tbmRecords = [];
      db.tbmRecords.unshift(newTBM);
      saveDB(db);
      return NextResponse.json({ success: true, item: newTBM });
    }

    if (action === 'update_tbm') {
      const { id, ...updatedFields } = payload;
      if (!db.tbmRecords) db.tbmRecords = [];
      db.tbmRecords = db.tbmRecords.map((t: any) =>
        t.id === id ? { ...t, ...updatedFields } : t
      );
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_tbm') {
      const { id } = payload;
      if (!db.tbmRecords) db.tbmRecords = [];
      db.tbmRecords = db.tbmRecords.filter((t: any) => t.id !== id);
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    // ==========================================
    // 6. DAILY SAFETY LOGS ACTIONS
    // ==========================================
    if (action === 'add_safety_log') {
      const newLog: DailySafetyLog = {
        ...payload,
        id: `log-${Date.now()}`,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      if (!db.safetyLogs) db.safetyLogs = [];
      db.safetyLogs.unshift(newLog);
      saveDB(db);
      return NextResponse.json({ success: true, item: newLog });
    }

    if (action === 'update_safety_log') {
      const { id, ...updatedFields } = payload;
      if (!db.safetyLogs) db.safetyLogs = [];
      db.safetyLogs = db.safetyLogs.map((l: any) =>
        l.id === id ? { ...l, ...updatedFields } : l
      );
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_safety_log') {
      const { id } = payload;
      if (!db.safetyLogs) db.safetyLogs = [];
      db.safetyLogs = db.safetyLogs.filter((l: any) => l.id !== id);
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    // ==========================================
    // 7. CALENDAR EVENTS ACTIONS
    // ==========================================
    if (action === 'add_calendar_event') {
      const newEvent = {
        ...payload,
        id: `e-${Date.now()}`
      };
      if (!db.calendarEvents) db.calendarEvents = [];
      db.calendarEvents.unshift(newEvent);
      saveDB(db);
      return NextResponse.json({ success: true, item: newEvent });
    }

    if (action === 'update_calendar_event') {
      const { id, ...updatedFields } = payload;
      if (!db.calendarEvents) db.calendarEvents = [];
      db.calendarEvents = db.calendarEvents.map((e: any) =>
        e.id === id ? { ...e, ...updatedFields } : e
      );
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_calendar_event') {
      const { id } = payload;
      if (!db.calendarEvents) db.calendarEvents = [];
      db.calendarEvents = db.calendarEvents.filter((e: any) => e.id !== id);
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    // ==========================================
    // 8. MEETING MINUTES ACTIONS
    // ==========================================
    if (action === 'add_meeting') {
      const newMeeting = {
        ...payload,
        id: `meet-${Date.now()}`,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      if (!db.meetingRecords) db.meetingRecords = [];
      db.meetingRecords.unshift(newMeeting);
      saveDB(db);
      return NextResponse.json({ success: true, item: newMeeting });
    }

    if (action === 'delete_meeting') {
      const { id } = payload;
      if (!db.meetingRecords) db.meetingRecords = [];
      db.meetingRecords = db.meetingRecords.filter((m: any) => m.id !== id);
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    // ==========================================
    // 9. ORGANIZATION DATA ACTIONS
    // ==========================================
    if (action === 'update_org_data') {
      db.orgData = {
        ...db.orgData,
        ...payload
      };
      saveDB(db);
      return NextResponse.json({ success: true, orgData: db.orgData });
    }

    // ==========================================
    // 10. INSPECTION, INCIDENT, CONTRACTOR
    // ==========================================
    if (action === 'add_inspection') {
      if (!db.inspections) db.inspections = [];
      db.inspections.unshift(payload);
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    if (action === 'add_incident') {
      if (!db.incidents) db.incidents = [];
      db.incidents.unshift(payload);
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    if (action === 'add_contractor') {
      if (!db.contractors) db.contractors = [];
      db.contractors.unshift(payload);
      saveDB(db);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
