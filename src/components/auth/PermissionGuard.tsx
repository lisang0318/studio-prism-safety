'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole, UserPermissions } from '@/types/auth';

interface PermissionGuardProps {
  roles?: UserRole[];
  permission?: keyof UserPermissions;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Non-invasive Permission Wrapper Component
 * Renders children only when the authenticated user satisfies the given role or permission criteria.
 */
export default function PermissionGuard({
  roles,
  permission,
  fallback = null,
  children
}: PermissionGuardProps) {
  const { user, isAuthenticated, hasRole, can } = useAuth();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // Super Admin possesses all privileges
  if (user.role === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  // Check role requirement if provided
  if (roles && roles.length > 0) {
    const isRoleAllowed = roles.includes(user.role);
    if (!isRoleAllowed) {
      return <>{fallback}</>;
    }
  }

  // Check specific granular permission flag if provided
  if (permission) {
    const isPermissionAllowed = can(permission);
    if (!isPermissionAllowed) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
