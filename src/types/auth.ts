export type UserRole = 'SUPER_ADMIN' | 'SAFETY_TEAM' | 'QR_APPLICANT';

export interface UserPermissions {
  canManageTeam: boolean;      // 팀원 계정 생성 및 관리 (최고 관리자 전용)
  canFinalApprove: boolean;    // 작업허가서 최종 전결 승인
  canReviewPermits: boolean;   // 작업허가서 1차 현장 검토 및 조회
  canEditLogs: boolean;        // 일일 안전일지 작성 및 수정
  canEditTBM: boolean;         // TBM 안전회의 일지 작성 및 수정
  canEditMeetings: boolean;    // 회의록 등록 및 관리
  canEditOrg: boolean;         // 조직도 및 관리감독자(CP) 수정
  canEditPrograms: boolean;    // 프로그램 등록 및 연간 매트릭스 수정
  canEditHotline: boolean;     // 비상 연락망 수정
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  department: string;
  phone: string;
  permissions: UserPermissions;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthSession {
  user: UserAccount | null;
  isAuthenticated: boolean;
}
