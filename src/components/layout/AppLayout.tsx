'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Automatically close mobile menu when navigating to another route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Public mobile pages accessed via QR codes and standalone Login page: NO Admin sidebar, NO Admin header
  const isStandalonePage =
    pathname === '/login' ||
    pathname.startsWith('/login') ||
    pathname === '/work-permit-apply' ||
    pathname === '/worker-report' ||
    pathname === '/tbm-sign' ||
    pathname.startsWith('/qr-permit');

  if (isStandalonePage) {
    return (
      <main className="min-h-screen w-full">
        {children}
      </main>
    );
  }

  // If unauthenticated and not loading, render without sidebar/header (middleware will redirect to /login)
  if (!isAuthenticated && !isLoading) {
    return (
      <main className="min-h-screen w-full">
        {children}
      </main>
    );
  }

  // Admin Dashboard layout for Authenticated Safety Manager
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
