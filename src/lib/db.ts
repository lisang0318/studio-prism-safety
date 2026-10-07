import fs from 'fs';
import path from 'path';
import {
  INITIAL_WORK_PERMITS,
  INITIAL_WORKER_OPINIONS,
  INITIAL_INSPECTIONS,
  INITIAL_CONTRACTORS,
  INITIAL_TBM_RECORDS,
  INITIAL_INCIDENTS,
  INITIAL_TEMPLATES,
  INITIAL_ACCOUNTS
} from '@/lib/mockData';
import { WorkPermitTemplate, ProgramItem, DailySafetyLog, UserAccount } from '@/types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'safety_db.json');
const ACCOUNTS_FILE = path.join(DB_DIR, 'team_accounts.json');

export interface DBStructure {
  workPermits: any[];
  workerOpinions: any[];
  inspections: any[];
  contractors: any[];
  tbmRecords: any[];
  incidents: any[];
  templates: WorkPermitTemplate[];
  programs: ProgramItem[];
  safetyLogs: DailySafetyLog[];
  meetingRecords: any[];
  calendarEvents: any[];
  orgData: any;
  teamAccounts?: UserAccount[];
  siteSettings?: {
    permitQrTitle?: string;
    permitQrText?: string;
    workerNoticeTitle?: string;
    workerNoticeSub?: string;
    workerNoticeBody?: string;
    [key: string]: any;
  };
}

const DEFAULT_ORG_DATA = {
  csoRole: '안전보건총괄책임자',
  csoTitle: '대표이사',
  csoName: '공희철',
  committeeTitle: '산업안전보건위원회',
  committeeSub: '법정 심의·의결 기구',
  userMemberCount: 0,
  workerMemberCount: 0,
  safetyTeamTitle: '안전보건팀',
  safetyTeamSub: '전담 안전보건 조직',
  safetyLeaderRole: '안전관리자 1명',
  safetyLeaderName: '이상욱',
  safetyLeaderPhone: '010-6670-3534',
  supervisors: [
    { id: 'sp-1', cpName: '1CP', name: '박성훈', position: '국장', phone: '010-3160-3534' },
    { id: 'sp-2', cpName: '2CP', name: '곽승영', position: '부장', phone: '010-9188-3534' },
    { id: 'sp-3', cpName: '3CP', name: '조문주', position: '부장', phone: '010-5202-3534' },
    { id: 'sp-4', cpName: '4CP', name: '박중원', position: '차장', phone: '010-4005-3534' },
    { id: 'sp-5', cpName: '5CP', name: '정익승', position: '차장', phone: '010-8502-3534' }
  ]
};

export const DEFAULT_SITE_SETTINGS = {
  permitQrTitle: '접근 및 작업 허가 QR',
  permitQrText: '본 사업장은 안전작업 허가제 시행 구역입니다.\n작업 전 반드시 QR코드를 스캔하여 허가서를 제출하고 승인을 받은 후 작업을 시작해 주시기 바랍니다.',
  workerNoticeTitle: '근로자 의견·제보',
  workerNoticeSub: '안전·보건 관련 의견을 남겨 주세요',
  workerNoticeBody: '산업안전보건법에 따라 근로자의 의견을 청취하고 있습니다. 안전·보건과 관련된 제보, 개선 의견, 문의를 남겨 주세요.\n\n• 제보자 성명 및 연락처는 신속한 현장 확인 및 조치 안내를 위해 필수 작성 항목입니다.\n• 제출된 내용은 이상욱 안전관리 책임자에게 실시간 전달됩니다.\n• 긴급한 위험 상황은 즉시 관리감독자에게 직접 알려 주시기 바랍니다.'
};

export function getDB(): DBStructure {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialDB: DBStructure = {
        workPermits: [],
        workerOpinions: [],
        inspections: [],
        contractors: [],
        tbmRecords: [],
        incidents: [],
        templates: INITIAL_TEMPLATES,
        programs: [],
        safetyLogs: [],
        meetingRecords: [],
        calendarEvents: [],
        orgData: DEFAULT_ORG_DATA,
        teamAccounts: INITIAL_ACCOUNTS as UserAccount[],
        siteSettings: DEFAULT_SITE_SETTINGS
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf8');
      return initialDB;
    }
    const content = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(content);
    if (!parsed.templates || parsed.templates.length === 0) {
      parsed.templates = INITIAL_TEMPLATES;
    } else {
      // Auto-deduplicate templates by id and title+workType
      const seenIds = new Set<string>();
      const seenCombos = new Set<string>();
      const uniqueTemplates: WorkPermitTemplate[] = [];

      for (const t of parsed.templates) {
        if (!t) continue;
        const cleanTitle = (t.title || '').trim().toLowerCase();
        const cleanWorkType = (t.workType || '').trim().toLowerCase();
        const comboKey = `${cleanTitle}:::${cleanWorkType}`;

        if (!seenIds.has(t.id) && !seenCombos.has(comboKey)) {
          seenIds.add(t.id);
          seenCombos.add(comboKey);
          uniqueTemplates.push(t);
        }
      }
      if (uniqueTemplates.length !== parsed.templates.length) {
        parsed.templates = uniqueTemplates;
        try {
          fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf8');
        } catch (e) {}
      }
    }
    if (!parsed.workPermits) {
      parsed.workPermits = [];
    }
    if (!parsed.workerOpinions) {
      parsed.workerOpinions = [];
    }
    if (!parsed.inspections) {
      parsed.inspections = [];
    }
    if (!parsed.contractors) {
      parsed.contractors = [];
    }
    if (!parsed.tbmRecords) {
      parsed.tbmRecords = [];
    }
    if (!parsed.incidents) {
      parsed.incidents = [];
    }
    if (!parsed.programs) {
      parsed.programs = [];
    }
    if (!parsed.safetyLogs) {
      parsed.safetyLogs = [];
    }
    if (!parsed.meetingRecords) {
      parsed.meetingRecords = [];
    }
    if (!parsed.calendarEvents) {
      parsed.calendarEvents = [];
    }
    if (!parsed.orgData) {
      parsed.orgData = DEFAULT_ORG_DATA;
    }
    if (!parsed.teamAccounts || parsed.teamAccounts.length === 0) {
      parsed.teamAccounts = INITIAL_ACCOUNTS as UserAccount[];
    }
    if (!parsed.siteSettings) {
      parsed.siteSettings = DEFAULT_SITE_SETTINGS;
    }
    return parsed;
  } catch (error) {
    console.error('Error reading safety_db.json:', error);
    return {
      workPermits: [],
      workerOpinions: [],
      inspections: [],
      contractors: [],
      tbmRecords: [],
      incidents: [],
      templates: INITIAL_TEMPLATES,
      programs: [],
      safetyLogs: [],
      meetingRecords: [],
      calendarEvents: [],
      orgData: DEFAULT_ORG_DATA,
      teamAccounts: INITIAL_ACCOUNTS as UserAccount[],
      siteSettings: DEFAULT_SITE_SETTINGS
    };
  }
}

export function saveDB(data: DBStructure) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving safety_db.json:', error);
  }
}

// User Accounts Local Persistence
export function getAccountsDB(): UserAccount[] {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(ACCOUNTS_FILE)) {
      fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(INITIAL_ACCOUNTS, null, 2), 'utf8');
      return INITIAL_ACCOUNTS as UserAccount[];
    }
    const content = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : (INITIAL_ACCOUNTS as UserAccount[]);
  } catch (e) {
    console.error('Error reading team_accounts.json:', e);
    return INITIAL_ACCOUNTS as UserAccount[];
  }
}

export function saveAccountsDB(accounts: UserAccount[]) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving team_accounts.json:', e);
  }
}
