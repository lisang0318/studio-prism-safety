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
        teamAccounts: INITIAL_ACCOUNTS as UserAccount[]
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf8');
      return initialDB;
    }
    const content = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(content);
    if (!parsed.templates || parsed.templates.length === 0) {
      parsed.templates = INITIAL_TEMPLATES;
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
      teamAccounts: INITIAL_ACCOUNTS as UserAccount[]
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
