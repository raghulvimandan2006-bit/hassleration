
"use client"

import { UserPortal } from '@/components/UserPortal';
import { Toaster } from "@/components/ui/toaster";
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UserEntryPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-12">
      <nav className="p-4">
        <Link href="/">
          <button className="flex items-center text-xs font-bold text-muted-foreground hover:text-primary gap-2 uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </Link>
      </nav>
      <UserPortal />
      <Toaster />
    </main>
  );
}
