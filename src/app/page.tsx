import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, ShieldCheck, UserCog, ShoppingBasket } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-12">
      <div className="text-center space-y-4 max-w-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-primary p-6 rounded-[2rem] shadow-2xl shadow-primary/30 transform hover:rotate-3 transition-transform">
            <ShoppingBasket className="w-16 h-16 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-6xl font-black tracking-tighter text-primary uppercase italic leading-none">Hassle-Free Ration Service</h1>
        <p className="text-muted-foreground font-black uppercase tracking-[0.4em] text-xs">Enterprise Digital Distribution Engine</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1400px]">
        <PortalCard 
          href="/user" 
          title="User Portal" 
          description="Register household, verify identity & get pickup tokens via missed call." 
          icon={<User className="w-10 h-10" />}
          color="bg-blue-500"
        />
        <PortalCard 
          href="/admin" 
          title="Admin Portal" 
          description="Manage warehouse stock, household records & monitor live automation." 
          icon={<ShieldCheck className="w-10 h-10" />}
          color="bg-green-600"
        />
        <PortalCard 
          href="/head-admin" 
          title="Head Admin" 
          description="High-level district oversight, financial analytics & shop status." 
          icon={<UserCog className="w-10 h-10" />}
          color="bg-purple-600"
        />
      </div>

      <footer className="pt-12 text-[11px] text-muted-foreground uppercase font-black tracking-[0.5em] opacity-40">
        Optimized for Real-Time High-Volume Distribution
      </footer>
    </main>
  );
}

function PortalCard({ href, title, description, icon, color }: any) {
  return (
    <Link href={href} className="transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2">
      <Card className="h-full border-none shadow-2xl overflow-hidden cursor-pointer bg-white group">
        <div className={`h-3 w-full ${color}`} />
        <CardHeader className="flex flex-row items-center gap-6 p-8">
          <div className={`p-4 rounded-2xl text-white ${color} shadow-xl shadow-black/10 group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <div>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <CardDescription className="text-base font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
