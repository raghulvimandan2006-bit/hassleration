
"use client"

import { useState, useEffect } from 'react';
import { AdminPortal } from '@/components/AdminPortal';

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <AdminPortal />;
}
