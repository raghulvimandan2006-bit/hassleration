
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCollection, useMemoFirebase, useFirebase } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, serverTimestamp, writeBatch, query, limit } from 'firebase/firestore';
import { 
  Users, 
  Ticket, 
  Search, 
  LogOut, 
  Copy, 
  Clock, 
  Trash2, 
  ShieldCheck,
  Globe,
  PackagePlus,
  Loader2,
  Terminal,
  RefreshCw,
  PhoneCall,
  Activity,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { handleMissedCall } from '@/lib/missed-call-handler';

export function AdminPortal() {
  const { toast } = useToast();
  const firebase = useFirebase();
  const db = firebase.firestore;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Data Listeners
  const usersQuery = useMemoFirebase(() => collection(db, 'users'), [db]);
  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);

  const stockQuery = useMemoFirebase(() => collection(db, 'stock_items'), [db]);
  const { data: stockItems, isLoading: stockLoading } = useCollection(stockQuery);

  const logsQuery = useMemoFirebase(() => 
    query(collection(db, 'system_logs'), limit(100)), 
  [db]);
  const { data: rawLogs } = useCollection(logsQuery);
  
  const logs = [...(rawLogs || [])].sort((a, b) => {
    const timeA = a.timestamp?.seconds || 0;
    const timeB = b.timestamp?.seconds || 0;
    return timeB - timeA;
  });

  const today = new Date().toISOString().split('T')[0];
  
  const dailyTokenQuery = useMemoFirebase(() => collection(db, 'daily_token_counts'), [db]);
  const { data: dailyCounts = [] } = useCollection(dailyTokenQuery);
  
  const todayData = (dailyCounts || []).find(d => d.id === today);
  const todayCount = todayData ? (todayData.count || 0) : 0;
  const totalHouseholds = (users || []).length;

  const filteredUsers = (users || []).filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.phone?.includes(searchTerm) || 
    u.id?.includes(searchTerm)
  );

  const initializeInventory = async () => {
    setIsInitializing(true);
    try {
      const batch = writeBatch(db);
      const items = [
        { id: 'rice', name: 'RICE', quantity: 500, unit: 'kg' },
        { id: 'sugar', name: 'SUGAR', quantity: 200, unit: 'kg' },
        { id: 'wheat', name: 'WHEAT', quantity: 300, unit: 'kg' },
        { id: 'dhal', name: 'DHAL', quantity: 150, unit: 'kg' },
        { id: 'oil', name: 'OIL', quantity: 100, unit: 'liter' },
        { id: 'kerosene', name: 'KEROSENE', quantity: 80, unit: 'liter' },
      ];

      items.forEach(item => {
        const ref = doc(db, 'stock_items', item.id);
        batch.set(ref, { ...item, lastUpdated: serverTimestamp() });
      });

      await batch.commit();
      toast({ title: "Inventory Seeded", description: "Standard stock levels initialized for distribution." });
    } catch (error: any) {
      toast({ title: "Initialization Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsInitializing(false);
    }
  };

  const updateStockValue = (stockId: string, value: string) => {
    const num = parseInt(value) || 0;
    const stockRef = doc(db, 'stock_items', stockId);
    updateDoc(stockRef, { quantity: num, lastUpdated: serverTimestamp() });
    toast({ title: "Stock Adjusted" });
  };

  const runSimulation = async () => {
    if (!users || users.length === 0) {
      toast({ title: "No Households", description: "Register a household first to simulate automation.", variant: "destructive" });
      return;
    }
    
    setIsSimulating(true);
    try {
      // Use the phone number of the first registered user for simulation
      const testPhone = users[0].phone;
      await handleMissedCall(testPhone);
      toast({ title: "Automation Simulation Success", description: "The 6-step kernel bypass was successful. Check logs." });
    } catch (error: any) {
      toast({ title: "Simulation Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSimulating(false);
    }
  };

  const copyWebhookUrl = () => {
    const url = `${window.location.origin}/api/webhook/twilio-voice`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: "Webhook Endpoint Copied" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (usersLoading || stockLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.3em]">Hassle-Free Syncing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-2.5 rounded-xl">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <span className="font-black text-2xl text-primary uppercase tracking-tighter">Hassle-Free Ration Service</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">District Operations Console</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 mr-4 text-green-600">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Automation Engine: Active</span>
            </div>
            <Button variant="outline" className="font-black border-2" onClick={() => window.location.href = '/'}>
              <LogOut className="w-4 h-4 mr-2" /> EXIT CONSOLE
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 py-10 space-y-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Household Registry" value={totalHouseholds} icon={<Users className="w-6 h-6" />} color="blue" />
          <StatsCard title="Daily Tokens Issued" value={todayCount} icon={<Ticket className="w-6 h-6" />} color="green" />
          <StatsCard title="Est. Queue Wait" value={`${todayCount * 4} Min`} icon={<Clock className="w-6 h-6" />} color="orange" />
          <StatsCard title="Carrier Latency" value="18ms" icon={<Globe className="w-6 h-6" />} color="purple" />
        </div>

        <Tabs defaultValue="users" className="space-y-8">
          <TabsList className="bg-white border-none shadow-xl p-1.5 h-auto inline-flex rounded-2xl">
            <TabsTrigger value="users" className="px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase tracking-tighter text-xs">Registry</TabsTrigger>
            <TabsTrigger value="stock" className="px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase tracking-tighter text-xs">Inventory</TabsTrigger>
            <TabsTrigger value="webhook" className="px-8 py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase tracking-tighter text-xs">Automation</TabsTrigger>
            <TabsTrigger value="logs" className="px-8 py-3 rounded-xl data-[state=active]:bg-slate-900 data-[state=active]:text-green-400 font-black uppercase tracking-tighter text-xs gap-2">
              <Terminal className="w-4 h-4" /> Live Terminal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-white border-b p-8 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter text-slate-800">Verified Household Registry</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">Complete database of digital ration card holders</CardDescription>
                </div>
                <div className="relative w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-40" />
                  <Input placeholder="Search Registry..." className="pl-12 h-14 text-base font-bold bg-slate-50 border-none rounded-2xl" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="border-none">
                      <TableHead className="px-8 h-16 font-black uppercase tracking-widest text-[10px]">Registry ID</TableHead>
                      <TableHead className="h-16 font-black uppercase tracking-widest text-[10px]">Head of Household</TableHead>
                      <TableHead className="h-16 font-black uppercase tracking-widest text-[10px]">Contact</TableHead>
                      <TableHead className="h-16 font-black uppercase tracking-widest text-[10px]">Ration Card</TableHead>
                      <TableHead className="px-8 h-16 text-right font-black uppercase tracking-widest text-[10px]">Management</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-24">
                          <div className="flex flex-col items-center gap-4 opacity-20">
                            <Users className="w-16 h-16" />
                            <p className="font-black uppercase tracking-[0.3em] text-xs">No matching household records</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((u) => (
                        <TableRow key={u.id} className="hover:bg-slate-50 border-slate-100 transition-colors">
                          <TableCell className="px-8 font-mono text-primary font-black text-lg">{u.id}</TableCell>
                          <TableCell className="font-black text-slate-800">{u.name}</TableCell>
                          <TableCell className="font-bold text-slate-500">{u.phone}</TableCell>
                          <TableCell><Badge variant="outline" className="font-mono">{u.rationCard}</Badge></TableCell>
                          <TableCell className="px-8 text-right">
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => deleteDoc(doc(db, 'users', u.id))}>
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock">
            <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-white border-b p-8 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter text-slate-800">Warehouse Inventory Levels</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">Live stock tracking for automated decrementing</CardDescription>
                </div>
                <Button onClick={initializeInventory} disabled={isInitializing} className="h-12 px-8 font-black rounded-2xl shadow-lg shadow-primary/20">
                  {isInitializing ? <Loader2 className="animate-spin mr-2" /> : <PackagePlus className="w-5 h-5 mr-2" />}
                  SYNC BASE STOCK
                </Button>
              </CardHeader>
              <CardContent className="p-8">
                {(!stockItems || stockItems.length === 0) ? (
                  <div className="p-24 text-center border-4 border-dashed rounded-[3rem] bg-slate-50/50">
                    <PackagePlus className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-20" />
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.4em]">Inventory uninitialized. Please sync base stock to begin.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    {stockItems.map((item) => (
                      <div key={item.id} className="p-6 border-2 border-slate-100 rounded-[2rem] space-y-4 bg-white hover:border-primary/20 transition-all group shadow-sm hover:shadow-xl">
                        <div className="flex justify-between items-start">
                          <Label className="font-black uppercase text-[10px] tracking-widest text-slate-400 group-hover:text-primary">{item.name}</Label>
                          <Badge variant="secondary" className="rounded-lg font-black text-[9px] px-2">{item.unit}</Badge>
                        </div>
                        <div className="space-y-2">
                          <Input type="number" className="h-14 text-2xl font-black text-center border-none bg-slate-50 rounded-2xl" value={item.quantity} onChange={(e) => updateStockValue(item.id, e.target.value)} />
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${Math.min(100, (item.quantity / 1000) * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhook">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Twilio Webhook Endpoint</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase">Configure this URL in your Twilio Voice console</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 font-mono text-xs break-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/twilio-voice` : 'Detecting...'}
                  </div>
                  <Button className="w-full h-14 font-black rounded-2xl gap-3 shadow-lg shadow-primary/20" onClick={copyWebhookUrl}>
                    {copied ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Copy className="w-5 h-5" />}
                    {copied ? "COPIED TO CLIPBOARD" : "COPY WEBHOOK URL"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <div className="bg-orange-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Automation Simulator</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase">Test the 6-step kernel bypass without a phone call</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-6">
                  <Alert className="bg-orange-50 border-orange-200">
                    <PhoneCall className="h-4 w-4 text-orange-500" />
                    <AlertTitle className="text-orange-800 font-black text-[10px] uppercase">Simulation Protocol</AlertTitle>
                    <AlertDescription className="text-orange-700 text-[10px] font-bold uppercase">
                      This will trigger the full automation flow for the first registered household in the registry.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    variant="outline" 
                    className="w-full h-14 font-black rounded-2xl border-2 border-orange-500 text-orange-600 hover:bg-orange-50" 
                    onClick={runSimulation}
                    disabled={isSimulating}
                  >
                    {isSimulating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                    RUN SYSTEM BYPASS SIMULATION
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="bg-slate-950 border-none shadow-[0_0_80px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden">
              <CardHeader className="border-b border-slate-900 p-8 flex flex-row items-center justify-between bg-slate-900/40">
                <div>
                  <CardTitle className="text-slate-100 flex items-center gap-4 text-2xl font-black uppercase tracking-tighter">
                    <Terminal className="w-8 h-8 text-green-500" />
                    Hassle-Free Live Terminal
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Real-time kernel tracking of 6-step missed call triggers</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[700px] min-h-[500px] overflow-auto font-mono text-xs leading-relaxed p-6 space-y-3">
                  {logs?.map((log) => (
                    <div key={log.id} className="p-4 rounded-2xl border border-slate-900 bg-slate-900/30 hover:bg-slate-900/50 transition-all group flex items-start gap-6">
                      <div className="shrink-0 pt-1">
                        <span className={cn(
                          "w-24 px-3 py-1 rounded-lg text-[10px] font-black uppercase text-center block",
                          log.level === 'error' ? 'bg-red-500/20 text-red-400' : 
                          log.level === 'success' ? 'bg-green-500/20 text-green-400' : 
                          'bg-blue-500/20 text-blue-400'
                        )}>
                          {log.level}
                        </span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <p className="text-slate-200 font-bold text-sm">{log.message}</p>
                          <span className="text-slate-700 text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                            ORIGIN: {log.caller} • {log.timestamp?.toDate()?.toLocaleTimeString()}
                          </span>
                        </div>
                        {log.details && <p className="text-slate-500 text-[11px] font-medium border-l-2 border-slate-800 pl-4 py-1">{log.details}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatsCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-500 text-white shadow-blue-500/20',
    green: 'bg-green-600 text-white shadow-green-600/20',
    orange: 'bg-orange-500 text-white shadow-orange-500/20',
    purple: 'bg-purple-600 text-white shadow-purple-600/20',
  };
  return (
    <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white hover:-translate-y-2 transition-all duration-300">
      <CardContent className="p-10 flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-[11px] uppercase font-black text-muted-foreground tracking-[0.2em]">{title}</p>
          <h3 className="text-4xl font-black tracking-tighter text-slate-800">{value}</h3>
        </div>
        <div className={`p-6 rounded-[2rem] ${colors[color]} shadow-2xl`}>{icon}</div>
      </CardContent>
    </Card>
  );
}
