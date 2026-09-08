import { WorkPermit, WorkerOpinion, SafetyInspection, RiskAssessmentItem, TBMRecord, IncidentRecord, Contractor, WorkPermitTemplate, DailySafetyLog, UserAccount } from '@/types';

export const INITIAL_TEMPLATES: WorkPermitTemplate[] = [
  {
    id: 't-1',
    title: '야외 경기장 세트·조명타워 설치 (골 때리는 그녀들)',
    workType: '야외 스포츠·경기장 특수 세트',
    riskLevel: '고위험',
    description: '야외 축구장/경기장 그라운드 세트 설치, 조명 타워 배치, 잔디 보호재 깔기 및 선수 충돌 방지 대책',
    hazards: [
      '야외 폭염/한파로 인한 온열·한냉 질환 발생',
      '선수 및 출연진 격렬한 운동/경기 중 충돌 및 전도',
      '임시 조명타워 및 구조물 강풍 전도 위험'
    ],
    safetyMeasures: [
      '경기장 잔디 보호재 및 펜스 충격완화 안전매트 100% 시공',
      '야외 그늘막, 식수대, 냉각/온열 설비 상시 비치',
      '임시 조명타워 4점 지지 와이어 결속 및 풍속 10m/s 이상 시 작업 중지',
      '응급구조사 및 전담 구급차 현장 상시 대기'
    ],
    requiredPPE: ['안전모', '안전화', '스포츠 안전보호대', '야광조끼', '무전기']
  },
  {
    id: 't-2',
    title: '도심·야외 로케이션 및 미션 구조물 (런닝맨)',
    workType: '도심·야외 로케이션 미션작업',
    riskLevel: '고위험',
    description: '도심 및 야외 로케이션 이동 촬영, 에어바운스/대형 장애물 등 야외 미션용 임시 구조물 설치 및 해체',
    hazards: [
      '차량 통행 지역 촬영 시 교통 안전사고 위험',
      '군중 밀집에 따른 통제선 붕괴 및 압사/전도 사고',
      '미션 구조물(에어바운스/타워) 고소 작업 중 추락'
    ],
    safetyMeasures: [
      '관할 경찰서/지자체 도로점용 허가 득 및 모범운전자 교통 통제선 구축',
      '군중 밀집 구역 펜스 설치 및 전담 안전요원 10명 이상 배치',
      '에어바운스/미션 구조물 앵커 와이어 6점 체결 및 하중 사전 테스트',
      '현장 안전관리자 사전 동선 리허설 2회 이상 실시'
    ],
    requiredPPE: ['안전모', '안전화', '무전기', '야광조끼', '호루라기']
  },
  {
    id: 't-3',
    title: '상암 메인무대 트러스 리깅·특수효과 (우리들의 발라드 / 인기가요)',
    workType: '무대·조명 트러스 리깅 및 특수효과',
    riskLevel: '고위험',
    description: '상암 스튜디오 메인 무대 트러스(Truss) 설치, 고중량 음향·조명 장비 리깅(Rigging), 화약/불꽃 특수효과 연출',
    hazards: [
      '12m 이상 상부 고소 트러스 작업 중 추락 위험',
      '체인호이스트 양중 중 고중량 조명·스피커 낙하',
      '무대 특수효과(화약·불꽃) 연출 시 인접 가연물 착화 및 누전 화재'
    ],
    safetyMeasures: [
      '고소작업자 2점식 안전하네스 착용 및 수직구명줄 이중 체결',
      '호이스트 양중 반경 10m 하부 접근 금지선 구획 및 신호수 배치',
      '특효 화약 사용 전 소방서 신고 완료, 세트 방염포 3중 도포 및 소화기 8대 전진 배치',
      '스모크 강제 배기 환기팬 4대 풀가동'
    ],
    requiredPPE: ['안전모', '안전대(하네스)', '안전화', '방염복', '보안경', '소화기']
  },
  {
    id: 't-4',
    title: '실내 스튜디오 및 로케이션 세팅 (틈만나면 / 동상이몽 / 미우새 / 비서진)',
    workType: '실내 스튜디오 및 로케이션 세팅',
    riskLevel: '중위험',
    description: '실내 스튜디오 세트 제작 및 반입, 일반 주거지/상가 로케이션 실내 촬영 장비 세팅, 이동식 크레인 및 촬영 보조 장비 운용',
    hazards: [
      '실내 협소 공간 자재/대형 장비 운반 중 협착 및 부딪힘',
      '노출된 바닥 전선 케이블에 발걸림으로 인한 스태프/출연진 전도',
      '조명 스탠드 및 지미집 크레인 하중 불균형으로 인한 전도'
    ],
    safetyMeasures: [
      '바닥 전선 케이블 황색 고무 프로텍터(몰드) 100% 매립 시공',
      '협소 공간 대형 자재 운반 시 2인 1조 작업 및 유도자 동행',
      '조명 스탠드 하단 샌드백(Sandbag, 15kg 이상) 3점 고정',
      '문틀, 코너 모서리 보호대 및 바닥 스크래치 방지 보양재 설치'
    ],
    requiredPPE: ['안전화', '작업장갑', '보안경']
  },
  {
    id: 't-5',
    title: '임시전력·대형 발전차 배선 허가서 (예능 야외녹화 공통)',
    workType: '임시전력·대형 발전차 배선',
    riskLevel: '중위험',
    description: '300kW 대형 발전차 연계 전원 포설, 고전력 조명탑 및 스튜디오/야외 임시 분전반 연결',
    hazards: [
      '고압 전원선 노출로 인한 누전 및 감전 사고',
      '발전차 엔진 과열 및 유류 취급 중 화재 위험',
      '보행로 횡단 케이블 단선 및 단락'
    ],
    safetyMeasures: [
      '보행 및 차량 통로용 중하중 케이블 프로텍터 시공',
      '분전반 누전차단기(ELB) 감도전류 30mA 동작 사전 시험',
      '발전차 접지 저항 10Ω 이하 접지봉 시공 및 유류 화재용 소화기 2대 배치'
    ],
    requiredPPE: ['절연안전화', '절연장갑', '안전모']
  },
  {
    id: 't-6',
    title: '세트 해체·철거(야간작업) 허가서',
    workType: '세트 해체·철거(야간작업)',
    riskLevel: '고위험',
    description: '녹화 종료 후 심야/철야 세트 해체, 목재·철골 절단 및 5톤 화물차 반출 작업',
    hazards: [
      '야간 조도 부족 및 수면 부족 피로로 인한 돌발 안전사고',
      '해체 순서 미준수로 인한 상부 구조물 연쇄 붕괴 및 낙하',
      '대형 폐목재 및 타카 핀 돌출로 인한 찔림/베임'
    ],
    safetyMeasures: [
      '야간 작업 구역 집중 이동식 투광기(300 Lux 이상) 설치',
      '해체 전담 관리감독자 상주 하에 상부 부재부터 역순 해체',
      '해체 폐자재 즉시 전용 카트에 적재 후 반출로 확보',
      '철야 작업 시 2시간 단위 의무 휴식시간 20분 보장'
    ],
    requiredPPE: ['안전모', '안전화', '야광조끼', '방진마스크', '코팅장갑']
  }
];

export const INITIAL_WORK_PERMITS: WorkPermit[] = [];

export const INITIAL_WORKER_OPINIONS: WorkerOpinion[] = [];

export const INITIAL_INSPECTIONS: SafetyInspection[] = [];

export const INITIAL_CONTRACTORS: Contractor[] = [];

export const INITIAL_TBM_RECORDS: TBMRecord[] = [];

export const INITIAL_INCIDENTS: IncidentRecord[] = [];

export const INITIAL_SAFETY_LOGS: DailySafetyLog[] = [];

export const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    id: 'admin',
    username: 'admin',
    password: 'prism2026!',
    name: '이상욱',
    role: 'SUPER_ADMIN',
    department: '안전관리본부',
    phone: '010-6670-3534',
    permissions: {
      canManageTeam: true,
      canFinalApprove: true,
      canReviewPermits: true,
      canEditLogs: true,
      canEditTBM: true,
      canEditMeetings: true,
      canEditOrg: true,
      canEditPrograms: true,
      canEditHotline: true
    },
    createdAt: '2026-08-25 09:00'
  }
];
