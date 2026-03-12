import { initializeFirebase } from '@/firebase/init';
import { collection, query, where, getDocs, doc, runTransaction, serverTimestamp, addDoc } from 'firebase/firestore';
import { sendSMS } from './sms';

/**
 * STRICT 6-STEP AUTOMATION PROCESS for Hassle-Free Ration Service:
 * 1. Verify mobile identity (last 10 digits normalization)
 * 2. Calculate next sequential token (Atomic)
 * 3. Fetch 10-digit Unique Household ID (Retrieval)
 * 4. Retrieve current stock details (Awareness)
 * 5. Dispatch Real-Time SMS Dispatch (Direct Delivery)
 * 6. Atomically decrement inventory (Protection)
 */
export async function handleMissedCall(phoneNumber: string) {
  const { firestore } = initializeFirebase();
  const today = new Date().toISOString().split('T')[0];
  
  // Normalize phone for database matching (extract last 10 digits)
  const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);
  
  const logStep = async (level: 'info' | 'error' | 'success', message: string, details: string = "") => {
    console.log(`[Hassle-Free-LOG] ${level.toUpperCase()}: ${message} ${details}`);
    try {
      await addDoc(collection(firestore, 'system_logs'), {
        timestamp: serverTimestamp(),
        level,
        message,
        details,
        caller: phoneNumber
      });
    } catch (e) {
      console.error("Log failed:", e);
    }
  };

  await logStep('info', `START: Call detected from ${phoneNumber}`);
  
  try {
    // Step 1: Verification
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('phone', '==', cleanPhone));
    const userSnap = await getDocs(q);

    if (userSnap.empty) {
      await logStep('error', `UNREGISTERED: Number ${cleanPhone} not found in registry.`);
      await sendSMS(phoneNumber, `Hassle-Free Ration Service: Your number ${cleanPhone} is not registered. Please register at our portal to receive tokens.`);
      return;
    }

    // Step 3: Fetching Registry (Picking the most recent registration)
    const userDoc = userSnap.docs[userSnap.docs.length - 1];
    const userData = userDoc.data();
    const uniqueID = userData.id || userDoc.id;
    const userName = userData.name || "User";

    await logStep('info', `VERIFIED: Household ID ${uniqueID} (${userName}) identified.`);

    let tokenNumber = 0;
    let stockSummary = "";

    // Steps 2, 4, 6: Atomic Transaction Block
    await runTransaction(firestore, async (transaction) => {
      const dailyCountRef = doc(firestore, 'daily_token_counts', today);
      const stockItemsList = [
        { id: 'rice', name: 'RICE', unit: 'kg' },
        { id: 'sugar', name: 'SUGAR', unit: 'kg' },
        { id: 'wheat', name: 'WHEAT', unit: 'kg' },
        { id: 'dhal', name: 'DHAL', unit: 'kg' },
        { id: 'oil', name: 'OIL', unit: 'liter' },
        { id: 'kerosene', name: 'KEROSENE', unit: 'liter' }
      ];
      
      const stockRefs = stockItemsList.map(item => doc(firestore, 'stock_items', item.id));
      
      const dailySnap = await transaction.get(dailyCountRef);
      const stockSnaps = await Promise.all(stockRefs.map(ref => transaction.get(ref)));

      // Step 2: Increment Token
      const currentCount = dailySnap.exists() ? (dailySnap.data().count || 0) : 0;
      tokenNumber = currentCount + 1;

      // Step 4 & 6: Inventory Management
      const stockLevels: Record<string, number> = {};
      
      stockItemsList.forEach((item, index) => {
        const snap = stockSnaps[index];
        let qty = 500; 
        
        if (snap.exists()) {
          qty = snap.data()?.quantity ?? 500;
        } else {
          // Initialize if missing (Default standard stock)
          transaction.set(stockRefs[index], { 
            name: item.name, 
            quantity: 500, 
            unit: item.unit, 
            lastUpdated: serverTimestamp() 
          });
        }
        
        stockLevels[item.id] = qty;
        
        // Step 6: Atomic Decrement
        transaction.update(stockRefs[index], { 
          quantity: Math.max(0, qty - 1), 
          lastUpdated: serverTimestamp() 
        });
      });

      stockSummary = Object.entries(stockLevels)
        .map(([id, qty]) => `${id.toUpperCase().charAt(0)}:${qty}`)
        .join(' ');

      // Save global count for the day
      transaction.set(dailyCountRef, { 
        count: tokenNumber, 
        lastUpdated: serverTimestamp() 
      }, { merge: true });

      // Create Individual Token Doc for the user
      const tokenRef = doc(collection(firestore, 'users', userDoc.id, 'tokens'));
      transaction.set(tokenRef, {
        userId: userDoc.id,
        issueDate: today,
        tokenNumber: tokenNumber,
        status: 'issued',
        uniqueID: uniqueID,
        issuedAt: serverTimestamp()
      });
    });

    await logStep('info', `PROCESS: Token #${tokenNumber} assigned. Stock updated.`);

    // Step 5: SMS Dispatch
    const waitTime = tokenNumber * 4; // Estimated 4 minutes per household
    const message = `Hassle-Free Ration Service: Household ID:${uniqueID}, Token:${tokenNumber}, Wait:${waitTime}m, Stock Status: ${stockSummary}`;
    
    const smsResult = await sendSMS(phoneNumber, message);

    if (smsResult.success) {
      await logStep('success', `COMPLETE: Token SMS delivered to ${phoneNumber}.`);
    } else {
      await logStep('error', `SMS FAILED: ${smsResult.error}`);
    }

  } catch (error: any) {
    await logStep('error', `FATAL ERROR: ${error.message}`);
    throw error;
  }
}
