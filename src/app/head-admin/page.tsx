"use client"

import React, { useState, useEffect } from 'react';
import { AdminPortal } from '@/components/AdminPortal';
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Activity, ShieldAlert, Zap, Globe, Cpu } from 'lucide-react';

export default function HeadAdminPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200">
      {/* High-Impact Widescreen Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 border-b border-white/10 py-6 px-10 shadow-2xl flex justify-between items-center sticky top-0 z-[100] backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
            <ShieldAlert className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic text-nowrap">Hassle-Free Ration Service</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Direct District Oversight Console</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden xl:flex flex-col items-end mr-6 border-r border-white/10 pr-6">
            <p className="text-[10px] font-black uppercase text-purple-300">System Performance</p>
            <p className="text-sm font-black text-white">4.2% CPU / 1.1ms Latency</p>
          </div>
          <Badge variant="outline" className="text-purple-300 border-purple-300/40 px-6 py-2 rounded-xl font-black uppercase text-xs">Superuser Mode</Badge>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-10 space-y-10">
        {/* Operations Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <DashboardCard 
            label="Gross Daily Flow" 
            value="₹4,25,000" 
            icon={<TrendingUp className="w-8 h-8" />} 
            trend="+12% from yesterday"
            color="border-purple-500"
          />
          <DashboardCard 
            label="Shop Connectivity" 
            value="ALL ONLINE" 
            icon={<Globe className="w-8 h-8" />} 
            trend="14 distribution nodes active"
            color="border-green-500"
            valueColor="text-green-400"
          />
          <DashboardCard 
            label="Token Density" 
            value="H. HIGH" 
            icon={<Zap className="w-8 h-8" />} 
            trend="Peak hours detected in Zone A"
            color="border-orange-500"
          />
          <DashboardCard 
            label="Automation Core" 
            value="V2.5" 
            icon={<Cpu className="w-8 h-8" />} 
            trend="6-Step Process Active"
            color="border-blue-500"
          />
        </div>
        
        {/* Main Portal Integration - High Resolution Wrap */}
        <div className="bg-white rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.4)] border-8 border-slate-900">
          <AdminPortal />
        </div>
      </div>

      <footer className="p-10 text-center opacity-20 hover:opacity-100 transition-opacity">
        <p className="text-[10px] font-black uppercase tracking-[1em]">Hassle-Free Ration Service • Enterprise Control • District Confidential</p>
      </footer>
    </div>
  );
}

function DashboardCard({ label, value, icon, trend, color, valueColor = "text-white" }: any) {
  return (
    <div className={`bg-slate-900 p-8 rounded-[2.5rem] border-l-8 ${color} shadow-2xl flex items-center justify-between group hover:bg-slate-800 transition-colors`}>
      <div className="space-y-2">
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
        <h3 className={`text-3xl font-black ${valueColor} tracking-tighter`}>{value}</h3>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{trend}</p>
      </div>
      <div className="bg-white/5 p-4 rounded-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
  );
}
