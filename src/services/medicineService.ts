import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { MedicineRecord } from '../types';
import { SEED_MEDICINES } from '../data/seedMedicines';
import Fuse from 'fuse.js';

export const medicineService = {
  /**
   * Fetches all verified/reviewed medicines from Firestore or fallback to built-in seed
   */
  async getAllMedicines(): Promise<MedicineRecord[]> {
    try {
      const colRef = collection(db, 'medicines');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as MedicineRecord));
      }
    } catch {
      // Return offline seed data on network or emulator error
    }
    return SEED_MEDICINES;
  },

  /**
   * Fuzzy searches medicines across names, imprint, and keywords using Fuse.js
   */
  async searchMedicines(queryStr: string, limitCount = 10): Promise<MedicineRecord[]> {
    const list = await this.getAllMedicines();
    if (!queryStr.trim()) {
      return list.slice(0, limitCount);
    }

    const fuse = new Fuse(list, {
      keys: [
        { name: 'medicineName', weight: 0.35 },
        { name: 'genericName', weight: 0.25 },
        { name: 'brandName', weight: 0.2 },
        { name: 'imprint', weight: 0.15 },
        { name: 'packageKeywords', weight: 0.05 }
      ],
      threshold: 0.35,
      ignoreLocation: true
    });

    const results = fuse.search(queryStr);
    return results.slice(0, limitCount).map(r => r.item);
  },

  /**
   * Seed medicines into Firestore (admin utility)
   */
  async seedCatalog(): Promise<number> {
    let count = 0;
    for (const med of SEED_MEDICINES) {
      await setDoc(doc(db, 'medicines', med.id), med, { merge: true });
      count++;
    }
    return count;
  }
};
