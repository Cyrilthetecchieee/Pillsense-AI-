import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { ScanRecord } from '../types';

const LOCAL_STORAGE_KEY = 'pillsense_local_scans';

export const historyService = {
  async saveScan(userId: string, scan: ScanRecord): Promise<void> {
    // 1. Always save to local storage cache
    this.saveToLocalCache(scan);

    // 2. Persist to Firestore if authenticated
    if (userId && userId !== 'guest' && !scan.isDemo) {
      try {
        const scanRef = doc(db, 'users', userId, 'scans', scan.id);
        await setDoc(scanRef, scan);
      } catch (err) {
        console.warn('Failed to sync scan to Firestore; retained in local cache:', err);
      }
    }
  },

  async getScans(userId: string): Promise<ScanRecord[]> {
    if (userId && userId !== 'guest') {
      try {
        const scansRef = collection(db, 'users', userId, 'scans');
        const q = query(scansRef, orderBy('createdAt', 'desc'), limit(50));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => d.data() as ScanRecord);
        }
      } catch {
        // Fall back to local cache on network error
      }
    }
    return this.getLocalCache();
  },

  async deleteScan(userId: string, scanId: string): Promise<void> {
    this.deleteFromLocalCache(scanId);
    if (userId && userId !== 'guest') {
      try {
        await deleteDoc(doc(db, 'users', userId, 'scans', scanId));
      } catch (err) {
        console.warn('Failed to delete scan from Firestore:', err);
      }
    }
  },

  getLocalCache(): ScanRecord[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveToLocalCache(scan: ScanRecord) {
    const list = this.getLocalCache();
    const updated = [scan, ...list.filter(s => s.id !== scan.id)].slice(0, 30);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage quota or private browsing
    }
  },

  deleteFromLocalCache(scanId: string) {
    const list = this.getLocalCache().filter(s => s.id !== scanId);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Storage quota
    }
  },

  clearAll(userId: string) {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}
  }
};
