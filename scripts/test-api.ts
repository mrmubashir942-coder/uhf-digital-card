import { handler } from '../netlify/functions/api.ts';

async function runTests() {
  console.log('--- STARTING NETLIFY API & SERVERLESS TESTS ---\n');
  let failures = 0;

  async function testEndpoint(name: string, event: any, expectedStatus = 200) {
    try {
      console.log(`Testing [${name}] => ${event.httpMethod || 'GET'} ${event.path}...`);
      const response: any = await handler(event, {} as any);
      
      const status = response.statusCode;
      let bodyText = response.body;
      let parsedBody: any = null;
      try {
        parsedBody = JSON.parse(bodyText);
      } catch {
        parsedBody = bodyText;
      }

      if (status === expectedStatus) {
        console.log(`  PASSED: Status ${status}`);
        if (typeof parsedBody === 'object' && parsedBody !== null) {
          const preview = JSON.stringify(parsedBody).substring(0, 140);
          console.log(`  Response: ${preview}...`);
        } else {
          console.log(`  Response preview: ${String(bodyText).substring(0, 80)}...`);
        }
        return { success: true, response, parsedBody };
      } else {
        console.error(`  FAILED: Expected ${expectedStatus} but got ${status}`);
        console.error(`  Body:`, bodyText);
        failures++;
        return { success: false, response, parsedBody };
      }
    } catch (err) {
      console.error(`  FAILED with error:`, err);
      failures++;
      return { success: false, error: err };
    }
  }

  // 1. GET /api/health
  await testEndpoint('GET /api/health', {
    httpMethod: 'GET',
    path: '/api/health',
    headers: {},
  });

  // 1b. GET /.netlify/functions/api/health (Rewritten by Netlify)
  await testEndpoint('GET /.netlify/functions/api/health', {
    httpMethod: 'GET',
    path: '/.netlify/functions/api/health',
    headers: {},
  });

  // 2. POST /api/auth/login with demo admin credentials
  const loginResult = await testEndpoint('POST /api/auth/login (Admin)', {
    httpMethod: 'POST',
    path: '/api/auth/login',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      identifier: 'ADMIN-001',
      password: 'AdminPassword123!',
    }),
  });

  // 2b. POST /.netlify/functions/api/auth/login (Rewritten path)
  await testEndpoint('POST /.netlify/functions/api/auth/login (Netlify splat path)', {
    httpMethod: 'POST',
    path: '/.netlify/functions/api/auth/login',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      identifier: 'ADMIN-001',
      password: 'AdminPassword123!',
    }),
  });

  // 2c. POST /api/auth/login with demo employee credentials
  await testEndpoint('POST /api/auth/login (Employee)', {
    httpMethod: 'POST',
    path: '/api/auth/login',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      identifier: 'UHF-001',
      password: 'Password123!',
    }),
  });

  // 3. GET /api/public/card/UHF-001
  await testEndpoint('GET /api/public/card/UHF-001', {
    httpMethod: 'GET',
    path: '/api/public/card/UHF-001',
    headers: {},
  });

  // 3b. GET /.netlify/functions/api/public/card/UHF-001
  await testEndpoint('GET /.netlify/functions/api/public/card/UHF-001 (Netlify splat path)', {
    httpMethod: 'GET',
    path: '/.netlify/functions/api/public/card/UHF-001',
    headers: {},
  });

  // 4. GET /api/public/qr/UHF-001
  await testEndpoint('GET /api/public/qr/UHF-001', {
    httpMethod: 'GET',
    path: '/api/public/qr/UHF-001',
    headers: {},
  });

  // 5. GET /api/public/vcard/UHF-001
  await testEndpoint('GET /api/public/vcard/UHF-001', {
    httpMethod: 'GET',
    path: '/api/public/vcard/UHF-001',
    headers: {},
  });

  // 6. Test authenticated route /api/auth/me using token from login
  if (loginResult.success && loginResult.parsedBody?.token) {
    await testEndpoint('GET /api/auth/me (with Bearer token)', {
      httpMethod: 'GET',
      path: '/api/auth/me',
      headers: {
        authorization: `Bearer ${loginResult.parsedBody.token}`,
      },
    });
  }

  console.log(`\n--- TEST SUMMARY: ${failures === 0 ? 'ALL PASSED!' : `${failures} FAILURES`} ---`);
  if (failures > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test runner error:', e);
  process.exit(1);
});
