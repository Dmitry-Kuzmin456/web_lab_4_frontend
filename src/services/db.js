import { openDB } from 'idb';

const DB_NAME = 'lab4-db';
const POINTS_STORE = 'points';
const META_STORE = 'meta';

export const initDB = async () => {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(POINTS_STORE)) {
                db.createObjectStore(POINTS_STORE, { keyPath: 'externalId' });
            }
            if (!db.objectStoreNames.contains(META_STORE)) {
                db.createObjectStore(META_STORE);
            }
        },
    });
};

export const savePointLocal = async (point) => {
    const db = await initDB();
    return db.put(POINTS_STORE, point);
};

export const getAllPointsLocal = async () => {
    const db = await initDB();
    return db.getAll(POINTS_STORE);
};

export const saveAllPointsLocal = async (points) => {
    const db = await initDB();
    const tx = db.transaction(POINTS_STORE, 'readwrite');
    for (const point of points) {
        await tx.store.put(point);
    }
    await tx.done;
};

export const getLamport = async () => {
    const db = await initDB();
    const val = await db.get(META_STORE, 'lamport');
    return val || 0;
};

export const incLamport = async (remoteTime = 0) => {
    const db = await initDB();
    const current = await getLamport();
    const next = Math.max(current, remoteTime) + 1;
    await db.put(META_STORE, next, 'lamport');
    return next;
};

export const clearLocalDB = async () => {
    const db = await initDB();
    const tx = db.transaction([POINTS_STORE, META_STORE], 'readwrite');
    await tx.objectStore(POINTS_STORE).clear();
    await tx.objectStore(META_STORE).clear();
    await tx.done;
};