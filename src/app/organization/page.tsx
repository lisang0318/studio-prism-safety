'use client';

import React, { useState, useEffect } from 'react';
import {
  Network,
  ShieldCheck,
  Users,
  UserCheck,
  Phone,
  Building,
  Plus,
  Printer,
  Edit3,
  Trash2,
  X,
  FileText,
  GripVertical,
  Check,
  CheckCircle2,
  KeyRound,
  Shield,
  UserPlus,
  Lock,
  Mail,
  Smartphone,
  AlertCircle,
  Eye,
  EyeOff,
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSafety } from '@/context/SafetyContext';
import { UserAccount, UserRole, UserPermissions } from '@/types/auth';

interface Supervisor {
  id: string;
  cpName: string;
  name: string;
  position: string;
  phone: string;
}

export default function OrganizationPage() {
  const { user, teamAccounts, addTeamAccount, updateTeamAccount, deleteTeamAccount, logout } = useAuth();
  const { orgData, updateOrgData } = useSafety();

  // Active Main Tab: 'chart' | 'accounts'
  const [activeMainTab, setActiveMainTab] = useState<'chart' | 'accounts'>('chart');

  // ==========================================
  // 1. ORGANIZATION CHART STATE
  // ==========================================
  const [csoRole, setCsoRole] = useState('안전보건총괄책임자');
  const [csoTitle, setCsoTitle] = useState('대표이사');
  const [csoName, setCsoName] = useState('공희철');

  const [committeeTitle, setCommitteeTitle] = useState('산업안전보건위원회');
  const [committeeSub, setCommitteeSub] = useState('법정 심의·의결 기구');
  const [userMemberCount, setUserMemberCount] = useState(0);
  const [workerMemberCount, setWorkerMemberCount] = useState(0);

  const [safetyTeamTitle, setSafetyTeamTitle] = useState('안전보건팀');
  const [safetyTeamSub, setSafetyTeamSub] = useState('전담 안전보건 조직');
  const [safetyLeaderRole, setSafetyLeaderRole] = useState('안전관리자 1명');
  const [safetyLeaderName, setSafetyLeaderName] = useState('이상욱');
  const [safetyLeaderPhone, setSafetyLeaderPhone] = useState('010-6670-3534');

  const [supervisors, setSupervisors] = useState<Supervisor[]>([
    { id: 'sp-1', cpName: '1CP', name: '박성훈', position: '국장', phone: '010-3160-3534' },
    { id: 'sp-2', cpName: '2CP', name: '곽승영', position: '부장', phone: '010-9188-3534' },
    { id: 'sp-3', cpName: '3CP', name: '조문주', position: '부장', phone: '010-5202-3534' },
    { id: 'sp-4', cpName: '4CP', name: '박중원', position: '차장', phone: '010-4005-3534' },
    { id: 'sp-5', cpName: '5CP', name: '정익승', position: '차장', phone: '010-8502-3534' }
  ]);

  // Modals for Org Chart
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showEditCsoModal, setShowEditCsoModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [showEditCommitteeModal, setShowEditCommitteeModal] = useState(false);
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null);

  const [spCpName, setSpCpName] = useState('');
  const [spName, setSpName] = useState('');
  const [spPosition, setSpPosition] = useState('');
  const [spPhone, setSpPhone] = useState('');

  // ==========================================
  // 2. USER ACCOUNT MANAGEMENT STATE
  // ==========================================
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [showAccountPassword, setShowAccountPassword] = useState(false);
  const [accountForm, setAccountForm] = useState({
    username: '',
    password: '',
    name: '',
    role: 'SAFETY_TEAM' as UserRole,
    department: '스튜디오프리즘 안전보건팀',
    phone: '',
    permissions: {
      canManageTeam: false,
      canFinalApprove: true,
      canReviewPermits: true,
      canEditLogs: true,
      canEditTBM: true,
      canEditMeetings: true,
      canEditOrg: false,
      canEditPrograms: true,
      canEditHotline: true
    } as UserPermissions
  });
  const [accountError, setAccountError] = useState('');

  // Sync Org Data from central Server
  useEffect(() => {
    if (orgData) {
      if (orgData.csoRole) setCsoRole(orgData.csoRole);
      if (orgData.csoTitle) setCsoTitle(orgData.csoTitle);
      if (orgData.csoName) setCsoName(orgData.csoName);
      if (orgData.committeeTitle) setCommitteeTitle(orgData.committeeTitle);
      if (orgData.committeeSub) setCommitteeSub(orgData.committeeSub);
      if (orgData.safetyTeamTitle) setSafetyTeamTitle(orgData.safetyTeamTitle);
      if (orgData.safetyTeamSub) setSafetyTeamSub(orgData.safetyTeamSub);
      if (orgData.safetyLeaderRole) setSafetyLeaderRole(orgData.safetyLeaderRole);
      if (orgData.safetyLeaderName) setSafetyLeaderName(orgData.safetyLeaderName);
      if (orgData.safetyLeaderPhone) setSafetyLeaderPhone(orgData.safetyLeaderPhone);
      if (orgData.supervisors) setSupervisors(orgData.supervisors);
      if (orgData.userMemberCount !== undefined) setUserMemberCount(orgData.userMemberCount);
      if (orgData.workerMemberCount !== undefined) setWorkerMemberCount(orgData.workerMemberCount);
    }
  }, [orgData]);

  const saveStateToStorage = (updatedSupervisors = supervisors) => {
    updateOrgData({
      csoRole,
      csoTitle,
      csoName,
      committeeTitle,
      committeeSub,
      userMemberCount,
      workerMemberCount,
      safetyTeamTitle,
      safetyTeamSub,
      safetyLeaderRole,
      safetyLeaderName,
      safetyLeaderPhone,
      supervisors: updatedSupervisors
    });
  };

  // Supervisor handlers
  const handleOpenAddSupervisor = () => {
    setEditingSupervisor(null);
    setSpCpName(`${supervisors.length + 1}CP`);
    setSpName('');
    setSpPosition('차장');
    setSpPhone('010-0000-0000');
    setShowSupervisorModal(true);
  };

  const handleOpenEditSupervisor = (sp: Supervisor) => {
    setEditingSupervisor(sp);
    setSpCpName(sp.cpName);
    setSpName(sp.name);
    setSpPosition(sp.position);
    setSpPhone(sp.phone);
    setShowSupervisorModal(true);
  };

  const handleSaveSupervisor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spCpName.trim() || !spName.trim()) {
      alert('소속 CP명과 성명을 입력해 주세요.');
      return;
    }

    let updated: Supervisor[];
    if (editingSupervisor) {
      updated = supervisors.map(s =>
        s.id === editingSupervisor.id
          ? { ...s, cpName: spCpName.trim(), name: spName.trim(), position: spPosition.trim(), phone: spPhone.trim() }
          : s
      );
    } else {
      const newSp: Supervisor = {
        id: `sp-${Date.now()}`,
        cpName: spCpName.trim(),
        name: spName.trim(),
        position: spPosition.trim() || '관리감독자',
        phone: spPhone.trim() || '010-0000-0000'
      };
      updated = [...supervisors, newSp];
    }
    setSupervisors(updated);
    saveStateToStorage(updated);
    setShowSupervisorModal(false);
  };

  const handleDeleteSupervisor = (id: string) => {
    if (confirm('이 관리감독자 항목을 삭제하시겠습니까?')) {
      const updated = supervisors.filter(s => s.id !== id);
      setSupervisors(updated);
      saveStateToStorage(updated);
    }
  };

  // ==========================================
  // USER ACCOUNT CRUD HANDLERS
  // ==========================================
  const handleOpenAddAccount = () => {
    setEditingAccount(null);
    setAccountError('');
    setShowAccountPassword(false);
    setAccountForm({
      username: '',
      password: '',
      name: '',
      role: 'SAFETY_TEAM',
      department: '스튜디오프리즘 안전보건팀',
      phone: '010-',
      permissions: {
        canManageTeam: false,
        canFinalApprove: true,
        canReviewPermits: true,
        canEditLogs: true,
        canEditTBM: true,
        canEditMeetings: true,
        canEditOrg: false,
        canEditPrograms: true,
        canEditHotline: true
      }
    });
    setShowAccountModal(true);
  };

  const handleOpenEditAccount = (acc: UserAccount) => {
    setEditingAccount(acc);
    setAccountError('');
    setShowAccountPassword(false);
    setAccountForm({
      username: acc.username,
      password: '',
      name: acc.name,
      role: acc.role,
      department: acc.department || '스튜디오프리즘',
      phone: acc.phone || '',
      permissions: {
        canManageTeam: !!acc.permissions?.canManageTeam,
        canFinalApprove: !!acc.permissions?.canFinalApprove,
        canReviewPermits: !!acc.permissions?.canReviewPermits,
        canEditLogs: !!acc.permissions?.canEditLogs,
        canEditTBM: !!acc.permissions?.canEditTBM,
        canEditMeetings: !!acc.permissions?.canEditMeetings,
        canEditOrg: !!acc.permissions?.canEditOrg,
        canEditPrograms: !!acc.permissions?.canEditPrograms,
        canEditHotline: !!acc.permissions?.canEditHotline
      }
    });
    setShowAccountModal(true);
  };

  const handleRoleChange = (role: UserRole) => {
    let permissions: UserPermissions;
    let dept = accountForm.department;

    if (role === 'SUPER_ADMIN') {
      permissions = {
        canManageTeam: true,
        canFinalApprove: true,
        canReviewPermits: true,
        canEditLogs: true,
        canEditTBM: true,
        canEditMeetings: true,
        canEditOrg: true,
        canEditPrograms: true,
        canEditHotline: true
      };
      dept = '스튜디오프리즘 총괄안전관리단';
    } else if (role === 'SAFETY_TEAM') {
      permissions = {
        canManageTeam: false,
        canFinalApprove: true,
        canReviewPermits: true,
        canEditLogs: true,
        canEditTBM: true,
        canEditMeetings: true,
        canEditOrg: false,
        canEditPrograms: true,
        canEditHotline: true
      };
      dept = '스튜디오프리즘 안전보건팀';
    } else {
      permissions = {
        canManageTeam: false,
        canFinalApprove: false,
        canReviewPermits: true,
        canEditLogs: false,
        canEditTBM: true,
        canEditMeetings: false,
        canEditOrg: false,
        canEditPrograms: false,
        canEditHotline: false
      };
      dept = '예능제작본부 / 외주협력사';
    }

    setAccountForm(prev => ({
      ...prev,
      role,
      department: dept,
      permissions
    }));
  };

  const handleTogglePermission = (permKey: keyof UserPermissions) => {
    setAccountForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permKey]: !prev.permissions[permKey]
      }
    }));
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError('');

    const cleanUsername = accountForm.username.trim().toLowerCase();
    const cleanName = accountForm.name.trim();

    if (!cleanUsername) {
      setAccountError('아이디(로그인 계정)를 입력해 주세요.');
      return;
    }

    if (!cleanName) {
      setAccountError('사용자 성명을 입력해 주세요.');
      return;
    }

    if (!editingAccount) {
      // New account creation validation
      if (!accountForm.password || accountForm.password.length < 6) {
        setAccountError('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }

      // Duplicate check
      const duplicate = teamAccounts.some(a => a.username.toLowerCase() === cleanUsername);
      if (duplicate) {
        setAccountError(`이미 등록된 아이디(${cleanUsername})입니다. 다른 아이디를 사용해 주세요.`);
        return;
      }

      const res = await addTeamAccount({
        username: cleanUsername,
        password: accountForm.password,
        name: cleanName,
        role: accountForm.role,
        department: accountForm.department.trim(),
        phone: accountForm.phone.trim(),
        permissions: accountForm.permissions
      });

      if (!res.success) {
        setAccountError(res.message || '계정 등록에 실패했습니다.');
        return;
      }

      alert(`'${cleanName}(${cleanUsername})' 계정이 성공적으로 등록되었습니다!`);
    } else {
      // Edit account validation
      // If changing username, check if another account already uses it
      if (cleanUsername !== editingAccount.username.toLowerCase()) {
        const duplicate = teamAccounts.some(
          a => a.id !== editingAccount.id && a.username.toLowerCase() === cleanUsername
        );
        if (duplicate) {
          setAccountError(`이미 등록된 아이디(${cleanUsername})입니다. 다른 아이디를 사용해 주세요.`);
          return;
        }
      }

      const updates: any = {
        username: cleanUsername,
        name: cleanName,
        role: accountForm.role,
        department: accountForm.department.trim(),
        phone: accountForm.phone.trim(),
        permissions: accountForm.permissions
      };

      if (accountForm.password && accountForm.password.length >= 6) {
        updates.password = accountForm.password;
      } else if (accountForm.password && accountForm.password.length < 6) {
        setAccountError('비밀번호 변경 시 최소 6자 이상 입력해야 합니다.');
        return;
      }

      const res = await updateTeamAccount(editingAccount.id, updates);
      if (!res.success) {
        setAccountError(res.message || '계정 수정에 실패했습니다.');
        return;
      }

      alert(`'${cleanName}' 계정 정보(ID/비밀번호/권한)가 성공적으로 수정되었습니다.`);
    }

    setShowAccountModal(false);
  };

  const handleDeleteAccount = async (acc: UserAccount) => {
    // Safety check: ensure at least 1 SUPER_ADMIN remains in the system if there are multiple accounts
    const superAdminCount = teamAccounts.filter(a => a.role === 'SUPER_ADMIN').length;
    if (acc.role === 'SUPER_ADMIN' && superAdminCount <= 1 && teamAccounts.length > 1) {
      alert('시스템 보호를 위해 최소 1명의 총괄 관리자(SUPER_ADMIN) 계정이 유지되어야 합니다.\n다른 총괄 관리자 계정을 추가한 후 삭제해 주세요.');
      return;
    }

    const isCurrentLoggedIn = user?.username === acc.username || (user as any)?.id === acc.id;
    const confirmMsg = isCurrentLoggedIn
      ? `'${acc.name}(${acc.username})' 관리자 계정을 삭제하시겠습니까?\n\n⚠️ 현재 로그인 중인 관리자 계정입니다. 삭제 완료 시 자동으로 로그아웃됩니다.`
      : `'${acc.name}(${acc.username})' 관리자/사용자 계정을 영구 삭제하시겠습니까?\n\n이 작업은 취소할 수 없으며, 모든 시스템 접근 권한이 즉시 회수됩니다.`;

    if (!confirm(confirmMsg)) return;

    const res = await deleteTeamAccount(acc.id || acc.username);
    if (!res.success) {
      alert(res.message || '계정 삭제 실패');
      return;
    }

    alert(`'${acc.name}(${acc.username})' 관리자 계정이 성공적으로 삭제되었습니다.`);
    setShowAccountModal(false);

    if (isCurrentLoggedIn) {
      logout();
    }
  };

  const totalCompanyMembers = 1 + 1 + supervisors.length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-[#FF4B3E] uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Studio Prism Safety Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            안전보건 관리체계 및 사용자·권한 관리
          </h1>
          <p className="text-xs text-slate-800 font-medium mt-1">
            방송제작 현장 안전보건 총괄책임자, 관리감독자 조직도 및 시스템 접근 계정(ID/PW/권한)을 통합 관리합니다.
          </p>
        </div>

        {/* Tab Switcher & Primary Action */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 border border-slate-200 p-1 rounded-2xl flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveMainTab('chart')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                activeMainTab === 'chart'
                  ? 'bg-[#FF4B3E] text-white shadow-md shadow-[#FF4B3E]/25 font-black'
                  : 'text-slate-800 hover:text-black'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>안전 조직도</span>
            </button>
            <button
              onClick={() => setActiveMainTab('accounts')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                activeMainTab === 'accounts'
                  ? 'bg-[#FF4B3E] text-white shadow-md shadow-[#FF4B3E]/25 font-black'
                  : 'text-slate-800 hover:text-black'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>사용자 및 권한 관리</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeMainTab === 'accounts' ? 'bg-white/20 text-slate-900' : 'bg-slate-200 text-slate-900'
              }`}>
                {teamAccounts.length}
              </span>
            </button>
          </div>

          {activeMainTab === 'chart' ? (
            <button
              onClick={() => setShowPdfModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-4 h-4 text-[#FF4B3E]" />
              <span>조직도 인쇄 / PDF</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddAccount}
              className="px-4 py-2.5 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#FF4B3E]/25 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ 신규 사용자/권한 등록</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SAFETY ORGANIZATION CHART                                          */}
      {/* ========================================================================= */}
      {activeMainTab === 'chart' && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="px-3 py-1 rounded-full bg-[#FF4B3E]/10 text-[#FF4B3E] border border-[#FF4B3E]/30 font-black">
              회사 {totalCompanyMembers}명
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold">
              협력업체 0명
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 font-bold">
              위원 {userMemberCount + workerMemberCount}명
            </span>
          </div>

          {/* Org Tree View */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm space-y-10 relative overflow-hidden">
            {/* Level 1: CSO Node */}
            <div className="flex flex-col items-center relative z-10">
              <div className="max-w-md w-full p-5 rounded-2xl bg-white border-2 border-[#FF4B3E] shadow-sm text-center relative group hover:border-[#FF3823] transition">
                <button
                  onClick={() => setShowEditCsoModal(true)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:text-[#FF4B3E] transition"
                  title="CSO 정보 수정"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <div className="inline-block px-3 py-1 rounded-full bg-[#FF4B3E]/10 text-[#FF4B3E] border border-[#FF4B3E]/30 text-xs font-black mb-2">
                  {csoRole}
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {csoTitle} {csoName}
                </h3>
                <p className="text-xs text-slate-800 font-medium mt-1">
                  스튜디오프리즘 안전보건경영 총괄 및 최고 결정권자
                </p>
              </div>

              {/* Vertical Connecting Line */}
              <div className="w-0.5 h-8 bg-slate-300"></div>
            </div>

            {/* Level 2: Safety Team & Committee Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {/* Safety Committee */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 relative group hover:border-slate-300 transition">
                <button
                  onClick={() => setShowEditCommitteeModal(true)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-white text-slate-700 hover:text-[#FF4B3E] border border-slate-200 transition"
                  title="위원회 정보 수정"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-2 rounded-xl bg-purple-100 text-purple-800 border border-purple-200 font-bold">
                    <Users className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{committeeTitle}</h4>
                    <span className="text-[11px] text-purple-900 font-bold">{committeeSub}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-800 font-bold mt-3 flex items-center justify-between pt-3 border-t border-slate-200">
                  <span>사용자위원 {userMemberCount}명</span>
                  <span>근로자위원 {workerMemberCount}명</span>
                </div>
              </div>

              {/* Safety Team */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-emerald-200 relative group hover:border-emerald-300 transition">
                <button
                  onClick={() => setShowEditTeamModal(true)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-white text-slate-700 hover:text-emerald-700 border border-slate-200 transition"
                  title="안전팀 정보 수정"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{safetyTeamTitle}</h4>
                    <span className="text-[11px] text-emerald-900 font-bold">{safetyTeamSub}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-900 mt-3 flex items-center justify-between pt-3 border-t border-slate-200 font-bold">
                  <span>{safetyLeaderRole} : {safetyLeaderName}</span>
                  <a href={`tel:${safetyLeaderPhone}`} className="text-emerald-800 hover:underline flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3" />
                    {safetyLeaderPhone}
                  </a>
                </div>
              </div>
            </div>

            {/* Level 3: Supervisors (CPs) Section */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <Building className="w-4 h-4 text-[#FF4B3E]" />
                  <span>관리감독자 (예능제작 CP / 총괄 책임자)</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF4B3E]/10 text-[#FF4B3E] border border-[#FF4B3E]/30 font-black">
                    {supervisors.length}개 CP
                  </span>
                </div>
                <button
                  onClick={handleOpenAddSupervisor}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-[#FF4B3E] font-bold text-xs flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>CP 추가</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {supervisors.map(sp => (
                  <div
                    key={sp.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition flex flex-col justify-between space-y-2 group shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-[#FF4B3E]/10 text-[#FF4B3E] border border-[#FF4B3E]/30 font-black text-[10px]">
                          {sp.cpName}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleOpenEditSupervisor(sp)}
                            className="p-1 text-slate-700 hover:text-black"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteSupervisor(sp.id)}
                            className="p-1 text-slate-700 hover:text-rose-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm font-black text-slate-900">{sp.name} {sp.position}</div>
                      <div className="text-[11px] text-slate-700 font-medium mt-0.5">스튜디오프리즘 예능제작</div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-800 font-bold flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-slate-600" />
                      <span>{sp.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TEAM & USER ACCOUNT MANAGEMENT (TASK 1: FEATURE ADDITIONS)         */}
      {/* ========================================================================= */}
      {activeMainTab === 'accounts' && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          {/* Top Info Banner */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-[#FF4B3E] mb-1">
                <KeyRound className="w-4 h-4" />
                <span>계정 권한 및 현장 결재 체계</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                등록된 제작 안전관리 팀원 및 사용자 목록 ({teamAccounts.length}명)
              </h3>
              <p className="text-xs text-slate-800 font-medium mt-1">
                신규 사용자를 등록하고, 아이디/비밀번호 변경 및 작업허가서 전결·일지 작성 등 기능별 권한을 설정할 수 있습니다.
              </p>
            </div>

            <button
              onClick={handleOpenAddAccount}
              className="px-4 py-2.5 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#FF4B3E]/25 transition shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ 신규 사용자/권한 등록</span>
            </button>
          </div>

          {/* Team Accounts Table */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-900 font-black text-[11px] pb-3">
                    <th className="pb-3 pl-2">사용자 성명 / 아이디</th>
                    <th className="pb-3">소속 / 부서</th>
                    <th className="pb-3">시스템 권한 등급</th>
                    <th className="pb-3">연락처</th>
                    <th className="pb-3">보유 세부 권한</th>
                    <th className="pb-3 text-right pr-2">ID/PW 및 권한 관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teamAccounts.map(acc => {
                    const isSuper = acc.role === 'SUPER_ADMIN';
                    const isSafety = acc.role === 'SAFETY_TEAM';
                    return (
                      <tr key={acc.id} className="hover:bg-slate-50 transition group">
                        {/* Name & Username */}
                        <td className="py-4 pl-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                              isSuper ? 'bg-[#FF4B3E] text-white shadow-xs' :
                              isSafety ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black' :
                              'bg-slate-100 text-slate-900 font-black'
                            }`}>
                              {acc.name?.slice(0, 2) || '사용'}
                            </div>
                            <div>
                              <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                                <span>{acc.name}</span>
                                {acc.username === user?.username && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-black">
                                    현재 접속중
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-800 font-mono font-bold mt-0.5">
                                @{acc.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="py-4 text-slate-900 font-bold">
                          {acc.department || '스튜디오프리즘'}
                        </td>

                        {/* Role Badge */}
                        <td className="py-4">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${
                            isSuper ? 'bg-[#FF4B3E]/10 text-[#FF4B3E] border-[#FF4B3E]/30' :
                            isSafety ? 'bg-amber-100 text-amber-900 border-amber-300' :
                            'bg-slate-100 text-slate-900 border-slate-300'
                          }`}>
                            {isSuper ? '👑 총괄책임자 (SUPER_ADMIN)' :
                             isSafety ? '🛡️ 안전관리자 (SAFETY_TEAM)' :
                             '📋 현장담당자 (QR_APPLICANT)'}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="py-4 font-mono text-slate-900 font-bold">
                          {acc.phone || '-'}
                        </td>

                        {/* Permissions Badges */}
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {acc.permissions?.canFinalApprove && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] border border-emerald-300 font-bold">
                                허가서 전결
                              </span>
                            )}
                            {acc.permissions?.canEditLogs && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] border border-blue-300 font-bold">
                                안전일지
                              </span>
                            )}
                            {acc.permissions?.canEditPrograms && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 text-[10px] border border-purple-300 font-bold">
                                프로그램
                              </span>
                            )}
                            {acc.permissions?.canManageTeam && (
                              <span className="px-1.5 py-0.5 rounded bg-[#FF4B3E]/10 text-[#FF4B3E] text-[10px] border border-[#FF4B3E]/30 font-bold">
                                계정/권한관리
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 pr-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditAccount(acc)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-xs border border-slate-300 transition flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3 text-[#FF4B3E]" />
                              <span>ID/PW·권한 수정</span>
                            </button>
                            <button
                              onClick={() => handleDeleteAccount(acc)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition flex items-center gap-1"
                              title="관리자/사용자 계정 영구 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">삭제</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: USER ACCOUNT REGISTRATION & EDIT (TASK 1: ID/PW/PERMISSIONS)       */}
      {/* ========================================================================= */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-900 shadow-2xl space-y-4 text-xs overflow-y-auto max-h-[90vh] animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-[#FF4B3E] font-black text-base">
                <UserPlus className="w-5 h-5 text-[#FF4B3E]" />
                <span>{editingAccount ? '사용자 정보, ID/비밀번호 및 권한 수정' : '신규 사용자 및 시스템 권한 등록'}</span>
              </div>
              <button onClick={() => setShowAccountModal(false)} className="text-slate-800 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            {accountError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{accountError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Username */}
                <div>
                  <label className="block font-black text-slate-900 mb-1">
                    아이디 (로그인 계정) *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-800 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="예: leesa, pd_kim"
                      value={accountForm.username}
                      onChange={e => setAccountForm(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-[#FF4B3E]"
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block font-black text-slate-900 mb-1">성명 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 이상욱"
                    value={accountForm.name}
                    onChange={e => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-black focus:bg-white focus:border-[#FF4B3E]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-black text-slate-900 mb-1">
                  {editingAccount ? '비밀번호 변경 (변경할 때만 6자 이상 입력, 미입력 시 기존 비밀번호 유지)' : '비밀번호 (최소 6자 이상) *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-800 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showAccountPassword ? 'text' : 'password'}
                    required={!editingAccount}
                    placeholder={editingAccount ? '기존 비밀번호 유지' : '비밀번호를 입력하세요 (6자 이상)'}
                    value={accountForm.password}
                    onChange={e => setAccountForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-10 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-[#FF4B3E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccountPassword(!showAccountPassword)}
                    className="p-1 text-slate-800 hover:text-black absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showAccountPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-900 mb-1">권한 등급 (Role) *</label>
                  <select
                    value={accountForm.role}
                    onChange={e => handleRoleChange(e.target.value as UserRole)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-black focus:bg-white focus:border-[#FF4B3E]"
                  >
                    <option value="SUPER_ADMIN">👑 총괄 책임자 (전체 권한)</option>
                    <option value="SAFETY_TEAM">🛡️ 안전관리자 (결재·일지)</option>
                    <option value="QR_APPLICANT">📋 현장담당자 (제출·TBM)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black text-slate-900 mb-1">소속 / 부서</label>
                  <input
                    type="text"
                    placeholder="예: 안전보건팀, 1CP"
                    value={accountForm.department}
                    onChange={e => setAccountForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:bg-white focus:border-[#FF4B3E]"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block font-black text-slate-900 mb-1">연락처 (비상연락망)</label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-800 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="예: 010-6670-3534"
                    value={accountForm.phone}
                    onChange={e => setAccountForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:border-[#FF4B3E]"
                  />
                </div>
              </div>

              {/* Granular Permissions */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <label className="block font-black text-slate-900">세부 기능별 접근 권한 설정</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={accountForm.permissions.canFinalApprove}
                      onChange={() => handleTogglePermission('canFinalApprove')}
                      className="rounded text-[#FF4B3E] focus:ring-[#FF4B3E]"
                    />
                    <span className="text-[11px] text-slate-900 font-black">작업허가서 전결 승인</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={accountForm.permissions.canReviewPermits}
                      onChange={() => handleTogglePermission('canReviewPermits')}
                      className="rounded text-[#FF4B3E] focus:ring-[#FF4B3E]"
                    />
                    <span className="text-[11px] text-slate-900 font-black">허가서 현장 검토</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={accountForm.permissions.canEditLogs}
                      onChange={() => handleTogglePermission('canEditLogs')}
                      className="rounded text-[#FF4B3E] focus:ring-[#FF4B3E]"
                    />
                    <span className="text-[11px] text-slate-900 font-black">안전일지 작성 및 결재</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={accountForm.permissions.canEditPrograms}
                      onChange={() => handleTogglePermission('canEditPrograms')}
                      className="rounded text-[#FF4B3E] focus:ring-[#FF4B3E]"
                    />
                    <span className="text-[11px] text-slate-900 font-black">프로그램 및 매트릭스 관리</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={accountForm.permissions.canEditOrg}
                      onChange={() => handleTogglePermission('canEditOrg')}
                      className="rounded text-[#FF4B3E] focus:ring-[#FF4B3E]"
                    />
                    <span className="text-[11px] text-slate-900 font-black">조직도 및 CP 관리</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={accountForm.permissions.canManageTeam}
                      onChange={() => handleTogglePermission('canManageTeam')}
                      className="rounded text-[#FF4B3E] focus:ring-[#FF4B3E]"
                    />
                    <span className="text-[11px] text-slate-900 font-black">팀원 계정 생성 및 권한 관리</span>
                  </label>
                </div>
              </div>

              {/* Submit / Cancel / Delete */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                {editingAccount ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteAccount(editingAccount)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>이 관리자/계정 삭제</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAccountModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black shadow-md shadow-[#FF4B3E]/25"
                  >
                    {editingAccount ? '수정 완료 (저장)' : '계정 등록'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CSO EDIT                                                           */}
      {/* ========================================================================= */}
      {showEditCsoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900">안전보건 총괄책임자(CSO) 수정</h3>
              <button onClick={() => setShowEditCsoModal(false)} className="text-slate-800 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveStateToStorage(); setShowEditCsoModal(false); }} className="space-y-3">
              <div>
                <label className="block font-black text-slate-900 mb-1">직책 역할</label>
                <input
                  type="text"
                  value={csoRole}
                  onChange={e => setCsoRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-black"
                />
              </div>
              <div>
                <label className="block font-black text-slate-900 mb-1">직함</label>
                <input
                  type="text"
                  value={csoTitle}
                  onChange={e => setCsoTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-bold"
                />
              </div>
              <div>
                <label className="block font-black text-slate-900 mb-1">성명</label>
                <input
                  type="text"
                  value={csoName}
                  onChange={e => setCsoName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-black"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button type="button" onClick={() => setShowEditCsoModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold">취소</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black">저장</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMMITTEE EDIT                                                     */}
      {/* ========================================================================= */}
      {showEditCommitteeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900">산업안전보건위원회 구성 수정</h3>
              <button onClick={() => setShowEditCommitteeModal(false)} className="text-slate-800 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveStateToStorage(); setShowEditCommitteeModal(false); }} className="space-y-3">
              <div>
                <label className="block font-black text-slate-900 mb-1">위원회 명칭</label>
                <input
                  type="text"
                  value={committeeTitle}
                  onChange={e => setCommitteeTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-black text-slate-900 mb-1">사용자위원 수 (명)</label>
                  <input
                    type="number"
                    value={userMemberCount}
                    onChange={e => setUserMemberCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-900 mb-1">근로자위원 수 (명)</label>
                  <input
                    type="number"
                    value={workerMemberCount}
                    onChange={e => setWorkerMemberCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button type="button" onClick={() => setShowEditCommitteeModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold">취소</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black">저장</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SAFETY TEAM EDIT                                                   */}
      {/* ========================================================================= */}
      {showEditTeamModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900">전담 안전보건팀 정보 수정</h3>
              <button onClick={() => setShowEditTeamModal(false)} className="text-slate-800 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveStateToStorage(); setShowEditTeamModal(false); }} className="space-y-3">
              <div>
                <label className="block font-black text-slate-900 mb-1">조직 명칭</label>
                <input
                  type="text"
                  value={safetyTeamTitle}
                  onChange={e => setSafetyTeamTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-black"
                />
              </div>
              <div>
                <label className="block font-black text-slate-900 mb-1">안전관리자 성명</label>
                <input
                  type="text"
                  value={safetyLeaderName}
                  onChange={e => setSafetyLeaderName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-black"
                />
              </div>
              <div>
                <label className="block font-black text-slate-900 mb-1">직통 연락처</label>
                <input
                  type="text"
                  value={safetyLeaderPhone}
                  onChange={e => setSafetyLeaderPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button type="button" onClick={() => setShowEditTeamModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold">취소</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black">저장</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUPERVISOR ADD/EDIT                                                */}
      {/* ========================================================================= */}
      {showSupervisorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-black text-slate-900">{editingSupervisor ? '관리감독자(CP) 수정' : '관리감독자(CP) 신규 추가'}</h3>
              <button onClick={() => setShowSupervisorModal(false)} className="text-slate-800 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSupervisor} className="space-y-3">
              <div>
                <label className="block font-black text-slate-900 mb-1">소속 CP 명칭 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 6CP"
                  value={spCpName}
                  onChange={e => setSpCpName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-black"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-black text-slate-900 mb-1">성명 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 홍길동"
                    value={spName}
                    onChange={e => setSpName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-black"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-900 mb-1">직급</label>
                  <input
                    type="text"
                    placeholder="예: 국장, 부장, 차장"
                    value={spPosition}
                    onChange={e => setSpPosition(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-black text-slate-900 mb-1">비상 연락처</label>
                <input
                  type="tel"
                  placeholder="010-0000-0000"
                  value={spPhone}
                  onChange={e => setSpPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button type="button" onClick={() => setShowSupervisorModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold">취소</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black">저장</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRINT / PDF PREVIEW                                                */}
      {/* ========================================================================= */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full bg-white text-slate-900 rounded-3xl p-8 shadow-2xl space-y-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="font-black text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FF4B3E]" />
                <span>스튜디오프리즘 안전보건 관리체계 조직도 보고서</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#FF4B3E] hover:bg-[#FF3823] text-white font-black flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>A4 인쇄 / PDF 저장</span>
                </button>
                <button onClick={() => setShowPdfModal(false)} className="p-1.5 text-slate-700 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 border border-slate-300 rounded-2xl space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-slate-900">(주)스튜디오프리즘 안전보건관리 조직도</h2>
                <p className="text-xs text-slate-600 font-mono font-bold">기준일자: {new Date().getFullYear()}년 {new Date().getMonth() + 1}월 현재</p>
              </div>

              {/* Printable hierarchy */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 text-center font-bold">
                  <div className="text-xs text-[#FF4B3E] font-black">{csoRole}</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">{csoTitle} {csoName}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl border border-slate-300 text-center">
                    <div className="font-black text-slate-900">{committeeTitle}</div>
                    <div className="text-xs text-slate-700 font-bold mt-1">사용자위원 {userMemberCount}명 / 근로자위원 {workerMemberCount}명</div>
                  </div>
                  <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-center">
                    <div className="font-black text-emerald-900">{safetyTeamTitle}</div>
                    <div className="text-xs text-slate-900 mt-1 font-black">{safetyLeaderRole} : {safetyLeaderName} ({safetyLeaderPhone})</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-300 space-y-2">
                  <div className="font-black text-slate-900">관리감독자 (예능제작 CP)</div>
                  <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
                    {supervisors.map(sp => (
                      <div key={sp.id} className="p-2 rounded bg-slate-50 border border-slate-200">
                        <div className="font-black text-[#FF4B3E]">{sp.cpName}</div>
                        <div className="font-black text-slate-900">{sp.name} {sp.position}</div>
                        <div className="text-[10px] text-slate-700 font-mono font-bold mt-0.5">{sp.phone}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
