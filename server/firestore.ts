import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const getSafeDirname = (): string => {
  try {
    if (typeof __dirname !== 'undefined' && __dirname) {
      return __dirname;
    }
    if (typeof import.meta !== 'undefined' && import.meta && import.meta.url) {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch {}
  return process.cwd();
};

const _dir = getSafeDirname();
const CONFIG_PATH = path.resolve(_dir, '../firebase-applet-config.json');

let firestoreInstance: any = null;

function getFirestoreDb() {
  if (firestoreInstance) return firestoreInstance;

  try {
    const candidatePaths = [
      CONFIG_PATH,
      path.resolve(process.cwd(), 'firebase-applet-config.json'),
      path.resolve(_dir, '../firebase-applet-config.json'),
      path.resolve(_dir, '../../firebase-applet-config.json'),
    ];

    let foundConfig: any = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        try {
          foundConfig = JSON.parse(fs.readFileSync(p, 'utf-8'));
          break;
        } catch {}
      }
    }

    if (foundConfig) {
      const app = getApps().length > 0 ? getApp() : initializeApp(foundConfig);
      firestoreInstance = getFirestore(app, foundConfig.firestoreDatabaseId);
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
