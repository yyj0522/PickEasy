"use client";

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Header />}
      <main className="flex-1 min-h-screen">
        {children}
      </main>
    </>
  );
}