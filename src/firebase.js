import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAJkcPg8oQYkjCwyRJ1qB79iqNq6bV_M58",
  authDomain: "task-dispatch-73aab.firebaseapp.com",
  databaseURL: "https://task-dispatch-73aab-default-rtdb.firebaseio.com",
  projectId: "task-dispatch-73aab",
  storageBucket: "task-dispatch-73aab.appspot.com",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
