import { NextResponse } from 'next/server';
import { handleMissedCall } from '@/lib/missed-call-handler';

/**
 * Universal Webhook handler for Twilio Voice calls.
 * Supports both POST (default) and GET methods.
 * Optimized for speed and background execution.
 */
async function processWebhook(req: Request) {
  try {
    let from = '';
    
    // Handle POST payloads (standard Twilio behavior)
    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await req.formData();
        from = formData.get('From') as string;
      } else {
        const body = await req.json().catch(() => ({}));
        from = body.From || '';
      }
    } else {
      // Handle GET payloads (Fallback)
      const { searchParams } = new URL(req.url);
      from = searchParams.get('From') || '';
    }

    console.log(`[ration.com-WEBHOOK] INCOMING (${req.method}): ${from}`);

    if (from) {
      // We start the automation but we DON'T block the response
      // to avoid Twilio timeout errors.
      handleMissedCall(from).catch(err => {
        console.error('[ration.com-WEBHOOK] Automation Error:', err);
      });
    }

    // Return TwiML to Twilio to reject the call immediately (saves costs)
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Reject reason="busy" />
</Response>`;

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error: any) {
    console.error('[ration.com-WEBHOOK] Critical Failure:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) { return processWebhook(req); }
export async function GET(req: Request) { return processWebhook(req); }
