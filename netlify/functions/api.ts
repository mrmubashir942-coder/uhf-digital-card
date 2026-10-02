import serverless from 'serverless-http';
import { app } from '../../server/app.ts';
import { db } from '../../server/db.ts';

// Pre-initialize database on cold-start
let initialized = false;
async function ensureDb() {
  if (!initialized) {
    try {
      await db.init();
      initialized = true;
    } catch (err) {
      console.warn('Cold-start db initialization note:', err);
    }
  }
}

const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  await ensureDb();
  return serverlessHandler(event, context);
};
