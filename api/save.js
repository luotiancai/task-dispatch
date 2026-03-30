import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  return initializeApp({
    credential: cert(serviceAccount),
    databaseURL: 'https://task-dispatch-73aab-default-rtdb.firebaseio.com',
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password, state } = req.body;

  const correctPassword = process.env.ADMIN_PASSWORD;
  if (!correctPassword || !password || password !== correctPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!state) {
    return res.status(400).json({ error: 'Missing state' });
  }

  try {
    const app = getAdminApp();
    const db = getDatabase(app);
    await db.ref('dispatch/state').set(state);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Firebase save error:', e);
    return res.status(500).json({ error: 'Save failed' });
  }
}
