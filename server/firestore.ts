import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.resolve(__dirname, '../firebase-applet-config.json');

let firestoreInstance: any = null;

function getFirestoreDb() {
  if (firestoreInstance) return firestoreInstance;

  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      const app = getApps().length > 0 ? getApp() : initializeApp(config);
      firestoreInstance = getFirestore(app, config.firestoreDatabaseId);
    }
  } catch (err) {
    console.warn('Failed to initialize server-side Firestore client:', err);
  }

  return firestoreInstance;
}

/**
 * Syncs company settings to Firestore under collection `company/settings`
 */
export async function syncCompanySettingsToFirestore(settings: any): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db) return false;

  try {
    const docRef = doc(db, 'company', 'settings');
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore sync notice (company/settings):', err instanceof Error ? err.message : err);
    return false;
  }
}

/**
 * Syncs employee profile and Cloudinary URL to Firestore under collection `employees/{employeeId}`
 */
export async function syncEmployeeToFirestore(employeeId: string, employeeData: any): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db) return false;

  try {
    const cleanId = employeeId.trim();
    const docRef = doc(db, 'employees', cleanId);
    await setDoc(docRef, {
      ...employeeData,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn(`Firestore sync notice (employees/${employeeId}):`, err instanceof Error ? err.message : err);
    return false;
  }
}
