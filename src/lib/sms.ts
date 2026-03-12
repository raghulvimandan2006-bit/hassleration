'use server';

import twilio from 'twilio';

/**
 * Sends an SMS message using Twilio directly from the server.
 * Optimized for real-time delivery to verified numbers on Hassle-Free Ration Service.
 */
export async function sendSMS(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  // Twilio credentials
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

  console.log(`[Hassle-Free-SMS] Processing destination: ${phone}`);
  
  try {
    const client = twilio(accountSid, authToken);
    
    // Strict E.164 formatting logic for India (+91)
    let clean = phone.trim();
    if (!clean.startsWith('+')) {
      clean = clean.replace(/\D/g, ''); 
      if (clean.length === 10) {
        clean = `+91${clean}`;
      } else if (clean.length === 12 && clean.startsWith('91')) {
        clean = `+${clean}`;
      } else {
        clean = `+${clean}`;
      }
    }

    const result = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: clean
    });
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateOTP(): Promise<string> {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
