import serverless from 'serverless-http';
import { createExpressApp } from '../../server/app.ts';
import { db } from '../../server/db.ts';

// Cached serverless handler instance across warm invocations
let cachedHandler: any = null;

function initializeServerlessHandler() {
  if (!cachedHandler) {
    try {
      console.log('[Netlify Function api] Initializing Express application...');
      const app = createExpressApp();
      cachedHandler = serverless(app, {
        binary: ['image/*', 'application/octet-stream', 'text/vcard'],
      });
      console.log('[Netlify Function api] Express app successfully wrapped with serverless-http.');
    } catch (initErr: any) {
      console.error('[Netlify Function api] Startup initialization error:', initErr);
      console.log('[Netlify Function api Startup Catch]:', {
        name: initErr?.name,
        message: initErr?.message,
        stack: initErr?.stack,
      });
      throw initErr;
    }
  }
  return cachedHandler;
}

export const handler = async (event: any, context: any) => {
  // Prevent AWS/Netlify Lambda from hanging on open event loops
  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }

  console.log(`[Netlify Function api] Request received: ${event.httpMethod} ${event.path || event.rawUrl}`);

  try {
    // Ensure database data is loaded
    try {
      await db.init();
    } catch (dbErr: any) {
      console.warn('[Netlify Function api] Database init notice during request:', dbErr?.message);
    }

    const serverlessFn = initializeServerlessHandler();
    const response = await serverlessFn(event, context);
    return response;
  } catch (err: any) {
    // Catch startup, routing, or execution errors and log thoroughly
    console.error(`[Netlify Function api] Execution error on ${event.httpMethod} ${event.path}:`, err);
    console.log('[Netlify Function api Execution Catch]:', {
      errorName: err?.name,
      errorMessage: err?.message,
      errorStack: err?.stack,
      request: {
        httpMethod: event.httpMethod,
        path: event.path,
        headers: event.headers,
        hasBody: Boolean(event.body),
      },
    });

    // Return a structured JSON 500 error instead of throwing an unhandled rejection (which produces 502 Bad Gateway)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Netlify Function Execution Error',
        message: err?.message || 'Unknown internal function error',
        path: event.path,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
