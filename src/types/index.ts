export type PermitStatus = '작성중' | '승인대기' | '승인완료' | '작업진행중' | '작업완료' | '반려' | '기간만료';

export type RiskLevel = '고위험' | '중위험' | '저위험';

export type BroadcastWorkType = 
  | '특수효과(화기·폭파·연화)'
  | '무대·조명 트러스 리깅(고소작업)'
  | '세트 제작·설치(목공·철골)'
  | '세트 해체·철거(야간작업)'
  | '임시전력·대형 발전차 배선'
  | '스턴트·와이어 액션·차량추격'
  | '스튜디오 중장비(지게차·스카이)'
  | '음향·영상 설비 설치'
  | '일반 시설·청소·반입반출'
  | string;

export interface WorkPermitChecklist {
  id: string;
  category: string;
  item: string;
  checked: boolean;
  required: boolean;
  note?: string;
}

export interface WorkPermitTemplate {
  id: string;
  title: string;
  workType: string;
  riskLevel: RiskLevel;
  description: string;
  hazards: string[];
  safetyMeasures: string[];
  requiredPPE: string[];
  isCustom?: boolean;
  createdAt?: string;
}

export interface WorkPermit {
  id: string;
  permitNumber: string; // 예: PRISM-WP-2026-0825-01
  title: string;
  studioName: string; // 예: 스튜디오 A (드라마 메인 세트)
  productionName: string; // 예: SBS 특별기획 드라마 '열혈사제2'
  contractorName: string; // 예: (주)프리즘스테이지아트
  managerName: string; // 작업책임자
  managerContact: string; // 연락처
  workerCount: number;
  workType: BroadcastWorkType;
  riskLevel: RiskLevel;
  startDate: string; // YYYY-MM-DD HH:mm
  endDate: string;
  workDescription: string;
  hazards: string[]; // 주요 위험요인
  safetyMeasures: string[]; // 안전조치사항
  requiredPPE: string[]; // 필수 보호구 (안전모, 안전대, 보안경, 방염복 등)
  checklists: WorkPermitChecklist[];
  status: PermitStatus;
  rejectReason?: string;
  weather?: string;
  temperature?: string;
  safetyOfficerName?: string;
  approvedAt?: string;
  digitalSignature?: string;
  managerSignature?: string; // 작업책임자 자필 서명 (Base64)
  officerSignature?: string; // 안전관리 책임자 자필 서명 (Base64)
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export type OpinionType = '위험요인' | '불편사항' | '개선의견' | '안전시설 요청' | '작업방법 개선' | '기타';
export type OpinionStatus = '접수' | '확인중' | '조치중' | '조치완료' | '반영불가';

export interface WorkerOpinion {
  id: string;
  opinionNumber: string;
  studioName: string;
  workTitle?: string;
  contractorName?: string;
  authorName: string; // 익명 가능
  authorContact?: string;
  opinionType: OpinionType;
  title: string;
  content: string;
  photos: string[];
  workerSignature?: string; // 근로자 현장 자필 서명 (Base64)
  officerSignature?: string; // 안전관리 책임자 자필 승인 서명 (Base64)
  status: OpinionStatus;
  actionContent?: string;
  actionPhotos?: string[];
  actionDate?: string;
  actionOfficer?: string;
  createdAt: string;
}

export interface SafetyInspectionItem {
  id: string;
  category: string;
  title: string;
  description: string;
  result: '양호' | '개선필요' | '불량' | '해당없음';
  note?: string;
  photo?: string;
}

export interface SafetyInspection {
  id: string;
  inspectionNumber: string;
  studioName: string;
  productionName: string;
  inspectorName: string;
  inspectionDate: string;
  items: SafetyInspectionItem[];
  overallResult: '적합' | '조건부적합' | '부적합';
  correctiveActions: string;
  photos: string[];
  createdAt: string;
}

export interface RiskAssessmentItem {
  id: string;
  jobCategory: string;
  workStep: string;
  hazardFactor: string;
  riskSeverity: number;
  riskProbability: number;
  riskScore: number;
  currentMeasures: string;
  improvementMeasures: string;
  manager: string;
  dueDate: string;
  isCompleted: boolean;
}

export interface TBMRecord {
  id: string;
  tbmNumber: string;
  studioName: string;
  workName: string;
  contractorName: string;
  leaderName: string;
  date: string;
  time: string;
  workerCount: number;
  attendees: string[];
  keyHazards: string[];
  safetyInstructions: string[];
  photos: string[];
  signed: boolean;
  createdAt: string;
}

export interface IncidentRecord {
  id: string;
  incidentNumber: string;
  type: '사고' | '아차사고';
  title: string;
  studioName: string;
  productionName: string;
  contractorName: string;
  occurredAt: string;
  locationDetails: string;
  victimInfo?: string;
  incidentDescription: string;
  damageDescription: string;
  causeAnalysis: string;
  immediateAction: string;
  preventivePlan: string;
  photos: string[];
  severity: '경미' | '보통' | '중대';
  status: '조사중' | '조치완료' | '종결';
  createdAt: string;
}

export interface Contractor {
  id: string;
  name: string;
  businessNumber: string;
  ceoName: string;
  managerName: string;
  managerPhone: string;
  workCategory: string;
  safetyDocSubmitted: boolean;
  safetyScore: number;
  totalPermitCount: number;
  incidentCount: number;
  notes: string;
}

export interface MonthlyPermit {
  month: number; // 1 ~ 12
  monthLabel: string; // '1월' ~ '12월'
  permitTitle?: string;
  permitNumber?: string;
  workType?: string;
  status: '승인완료' | '진행중' | '승인대기' | '예정' | '미발행' | '반려';
  officer?: string;
  date?: string;
}

export interface ProgramItem {
  id: string;
  title: string;
  genre: '예능' | '예능(관객)' | '콘서트';
  status: '제작중' | '기획중' | '종영';
  mainStudio: string;
  pd: string;
  safetyOfficer: string;
  riskRating: string;
  monthlyPermits: MonthlyPermit[];
}

export interface DailySafetyLog {
  id: string;
  title: string;
  date: string;
  temperature?: string;
  weather?: '맑음' | '흐림' | '비' | '눈' | '강풍';
  workerCount?: number;
  workSummary: string;
  checklists: {
    id: string;
    item: string;
    checked: boolean;
  }[];
  specialNotes?: string;
  author: string;
  createdAt: string;
}

export * from './auth';

