import type { Metadata } from 'next';
import './globals.css';
import { SafetyProvider } from '@/context/SafetyContext';
import { AuthProvider } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: '스튜디오프리즘 안전관리 플랫폼 | Studio Prism Safety Hub',
  description: '방송·콘텐츠 제작현장 실무형 스마트 안전관리 통합 시스템',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased">
        <AuthProvider>
          <SafetyProvider>
            <AppLayout>{children}</AppLayout>
          </SafetyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
