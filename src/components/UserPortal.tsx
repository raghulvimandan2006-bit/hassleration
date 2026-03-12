"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingBasket, Phone, CheckCircle2, Info, ShieldCheck, AlertTriangle, UserPlus, Loader2 } from 'lucide-react';
import { sendSMS, generateOTP } from '@/lib/sms';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useAuth, useUser } from '@/firebase';
import { collection, doc, setDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export function UserPortal() {
  const { toast } = useToast();
  const db = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  
  const [step, setStep] = useState<'welcome' | 'register' | 'otp' | 'success'>('welcome');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    zone: '',
    phone: '',
    rationCard: ''
  });
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSmsError, setLastSmsError] = useState<string | null>(null);

  useEffect(() => {
    if (!user && !isUserLoading) {
      signInAnonymously(auth).catch(err => {
        console.error("Auth failed:", err);
      });
    }
  }, [user, isUserLoading, auth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleZoneChange = (value: string) => {
    setFormData({ ...formData, zone: value });
  };

  const startRegistration = async () => {
    if (!formData.name || !formData.phone || !formData.rationCard) {
      toast({ title: "Missing Data", description: "All fields are required.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setLastSmsError(null);
    try {
      const nameQuery = query(collection(db, 'users'), where('name', '==', formData.name.trim()));
      const nameSnap = await getDocs(nameQuery);
      
      if (!nameSnap.empty) {
        toast({ title: "Name Exists", description: "Household name already registered.", variant: "destructive" });
        setIsProcessing(false);
        return;
      }

      const code = await generateOTP();
      setGeneratedOtp(code);
      
      const result = await sendSMS(formData.phone, `Hassle-Free Ration: Hello ${formData.name}, your verification code is ${code}.`);
      
      if (result.success) {
        setStep('otp');
        toast({ title: "OTP Sent", description: "Check your mobile for the code." });
      } else {
        setLastSmsError(result.error || "SMS failed.");
        toast({ title: "SMS Error", description: result.error, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "System Error", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyOTP = async () => {
    if (otp === generatedOtp) {
      setIsProcessing(true);
      const uniqueId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      
      try {
        const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
        const userRef = doc(db, 'users', uniqueId);
        const userData = {
          ...formData,
          id: uniqueId,
          registeredAt: serverTimestamp(),
          phone: cleanPhone 
        };
        
        await setDoc(userRef, userData);
        setCurrentUser(userData);
        await sendSMS(formData.phone, `Hassle-Free Ration: Registration Success! ID:${uniqueId}. Give a missed call to +18505053789 for token.`);
        setStep('success');
      } catch (err: any) {
        toast({ title: "Failed", description: err.message, variant: "destructive" });
      } finally {
        setIsProcessing(false);
      }
    } else {
      toast({ title: "Wrong OTP", variant: "destructive" });
    }
  };

  const checkExistingUser = async () => {
    if (!formData.phone) {
      toast({ title: "Mobile Required" });
      return;
    }
    setIsProcessing(true);
    try {
      const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
      const q = query(collection(db, 'users'), where('phone', '==', cleanPhone));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const user = snap.docs[0].data();
        setCurrentUser(user);
        setStep('success');
      } else {
        toast({ title: "Not Found", description: "Use New Registration." });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Portal Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <header className="text-center py-4">
        <h1 className="text-3xl font-black text-primary uppercase tracking-tighter">Hassle-Free Ration Service</h1>
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest italic">Digital Distribution Engine</p>
      </header>

      {lastSmsError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>SMS Service Error</AlertTitle>
          <AlertDescription className="text-xs">{lastSmsError}</AlertDescription>
        </Alert>
      )}

      {step === 'welcome' && (
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Portal Entry</CardTitle>
            <CardDescription>Verify your identity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input 
                id="phone" 
                name="phone" 
                placeholder="Mobile Number" 
                className="pl-10 h-12 text-lg font-bold"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Button className="w-full h-12 text-lg font-black" onClick={checkExistingUser} disabled={isProcessing}>
                {isProcessing ? "CHECKING..." : "ACCESS PORTAL"}
              </Button>
              <Button variant="outline" className="w-full h-12 text-sm font-bold gap-2" onClick={() => setStep('register')} disabled={isProcessing}>
                <UserPlus className="w-4 h-4" /> NEW REGISTRATION
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'register' && (
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Household Registration</CardTitle>
            <CardDescription>Registering for: <span className="font-bold text-primary">{formData.phone}</span></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Head of Household Name</Label>
              <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="h-11 font-bold" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Address</Label>
              <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="Street, Door No" className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Shop Zone</Label>
                <Select onValueChange={handleZoneChange}>
                  <SelectTrigger className="h-11 font-bold">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Zone A">Zone A</SelectItem>
                    <SelectItem value="Zone B">Zone B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Ration Card No</Label>
                <Input name="rationCard" value={formData.rationCard} onChange={handleInputChange} placeholder="TN000" className="h-11 font-mono" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full h-12 text-base font-black" onClick={startRegistration} disabled={isProcessing}>
              {isProcessing ? "PROCESSING..." : "CONFIRM & SEND OTP"}
            </Button>
            <Button variant="ghost" className="text-xs font-bold uppercase" onClick={() => setStep('welcome')}>Back</Button>
          </CardFooter>
        </Card>
      )}

      {step === 'otp' && (
        <Card className="border-none shadow-xl">
          <CardHeader className="text-center">
            <CardTitle>Security Check</CardTitle>
            <CardDescription>Enter code sent to {formData.phone}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              className="text-center text-3xl tracking-widest h-14 font-black" 
              maxLength={4} 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="0000"
            />
            <Button className="w-full h-12 text-base font-black" onClick={verifyOTP} disabled={isProcessing}>
              {isProcessing ? "VERIFYING..." : "COMPLETE REGISTRATION"}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'success' && currentUser && (
        <Card className="border-none shadow-xl bg-accent/5">
          <CardContent className="pt-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-accent/10 p-4 rounded-full"><CheckCircle2 className="w-12 h-12 text-accent" /></div>
            </div>
            <div>
              <h2 className="text-2xl font-black">REGISTRATION SUCCESS</h2>
              <p className="text-xs font-bold text-muted-foreground mt-1 uppercase">Household ID: {currentUser.id}</p>
              <p className="text-lg font-bold text-primary mt-2">{currentUser.name}</p>
            </div>
            <Alert className="bg-white border-accent/20">
              <Info className="h-4 w-4 text-accent" />
              <AlertDescription className="text-[11px] font-bold uppercase text-accent-foreground">
                GIVE A MISSED CALL TO +18505053789 TO GET YOUR TOKEN INSTANTLY.
              </AlertDescription>
            </Alert>
            <Button variant="outline" className="w-full h-11 font-black" onClick={() => window.location.reload()}>FINISH</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
