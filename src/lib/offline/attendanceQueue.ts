'use client';

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface QueuedAttendance {
  id: string; // client uuid
  agenda_id: string;
  student_id: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';
  notes?: string;
  timestamp: number;
  synced: boolean;
}

interface RuangGuruDB extends DBSchema {
  attendance_queue: {
    key: string;
    value: QueuedAttendance;
    indexes: { 'by-agenda': string; 'by-synced': number };
  };
}

const DB_NAME = 'ruang-guru-offline-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<RuangGuruDB>> | null = null;

function getDB() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<RuangGuruDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('attendance_queue', { keyPath: 'id' });
        store.createIndex('by-agenda', 'agenda_id');
        store.createIndex('by-synced', 'synced');
      },
    });
  }
  return dbPromise;
}

export async function queueAttendance(
  agendaId: string,
  records: Array<{ student_id: string; status: 'hadir' | 'sakit' | 'izin' | 'alpa'; notes?: string }>
) {
  const db = await getDB();
  if (!db) return;

  const tx = db.transaction('attendance_queue', 'readwrite');
  for (const rec of records) {
    const item: QueuedAttendance = {
      id: `${agendaId}_${rec.student_id}`,
      agenda_id: agendaId,
      student_id: rec.student_id,
      status: rec.status,
      notes: rec.notes,
      timestamp: Date.now(),
      synced: false,
    };
    await tx.store.put(item);
  }
  await tx.done;
}

export async function getQueuedAttendanceForAgenda(agendaId: string) {
  const db = await getDB();
  if (!db) return [];
  const all = await db.getAllFromIndex('attendance_queue', 'by-agenda', agendaId);
  return all;
}

export async function getUnsyncedAttendanceCount(): Promise<number> {
  const db = await getDB();
  if (!db) return 0;
  const all = await db.getAll('attendance_queue');
  return all.filter(x => !x.synced).length;
}

export async function clearSyncedAttendance(agendaId: string) {
  const db = await getDB();
  if (!db) return;
  const all = await db.getAllFromIndex('attendance_queue', 'by-agenda', agendaId);
  const tx = db.transaction('attendance_queue', 'readwrite');
  for (const item of all) {
    await tx.store.delete(item.id);
  }
  await tx.done;
}

