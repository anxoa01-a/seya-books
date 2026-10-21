/**
 * Seya Books IndexedDB Storage Layer
 * High-performance, offline-first local database for financial transactions,
 * documents/receipts in files vault, client registry, notes, timesheets, and settings.
 */

const DB_NAME = 'seya_books_db';
const DB_VERSION = 1;

let dbInstance = null;

export async function getDB() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Transactions Store
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txStore.createIndex('date', 'date', { unique: false });
        txStore.createIndex('type', 'type', { unique: false });
        txStore.createIndex('category', 'category', { unique: false });
        txStore.createIndex('clientId', 'clientId', { unique: false });
        txStore.createIndex('bankId', 'bankId', { unique: false });
      }

      // 2. Clients Store
      if (!db.objectStoreNames.contains('clients')) {
        const clientStore = db.createObjectStore('clients', { keyPath: 'id' });
        clientStore.createIndex('name', 'name', { unique: false });
      }

      // 3. Banks Store
      if (!db.objectStoreNames.contains('banks')) {
        const bankStore = db.createObjectStore('banks', { keyPath: 'id' });
        bankStore.createIndex('name', 'name', { unique: false });
      }

      // 4. Files Vault Store (Receipts, Invoices, Contracts, Tax notices)
      if (!db.objectStoreNames.contains('filesVault')) {
        const vaultStore = db.createObjectStore('filesVault', { keyPath: 'id' });
        vaultStore.createIndex('type', 'type', { unique: false });
        vaultStore.createIndex('uploadDate', 'uploadDate', { unique: false });
        vaultStore.createIndex('linkedTxId', 'linkedTxId', { unique: false });
      }

      // 5. Notes Store
      if (!db.objectStoreNames.contains('notes')) {
        const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
        noteStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // 6. Timesheet Store
      if (!db.objectStoreNames.contains('timesheets')) {
        const timeStore = db.createObjectStore('timesheets', { keyPath: 'id' });
        timeStore.createIndex('clientId', 'clientId', { unique: false });
        timeStore.createIndex('date', 'date', { unique: false });
        timeStore.createIndex('invoiced', 'invoiced', { unique: false });
      }

      // 7. Settings Store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Generic CRUD helpers
export async function getAllFromStore(storeName) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getFromStore(storeName, key) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveToStore(storeName, item) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(item);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFromStore(storeName, key) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}

export async function clearStore(storeName) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
}
