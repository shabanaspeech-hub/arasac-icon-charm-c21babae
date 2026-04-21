import { openDB, type IDBPDatabase } from 'idb';

export interface CustomItem {
  id: string;
  categoryId: string;
  label: string;
  labelHi: string;
  imageData: string; // base64 data URL
  audioData?: string; // base64 data URL of recorded audio
  wordType: string;
  createdAt: string;
}

export interface CustomCategory {
  id: string;
  nameEn: string;
  nameHi: string;
  emoji: string;
  isDefault: boolean;
  createdAt: string;
}

const DB_NAME = 'spectra-aac-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('items')) {
          const itemStore = db.createObjectStore('items', { keyPath: 'id' });
          itemStore.createIndex('categoryId', 'categoryId');
        }
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// Default categories to seed
const defaultCategories: CustomCategory[] = [
  { id: 'custom-food', nameEn: '🍽️ Food', nameHi: '🍽️ खाना', emoji: '🍽️', isDefault: true, createdAt: '' },
  { id: 'custom-toys', nameEn: '🧸 Toys', nameHi: '🧸 खिलौने', emoji: '🧸', isDefault: true, createdAt: '' },
  { id: 'custom-actions', nameEn: '🏃 Actions', nameHi: '🏃 क्रियाएं', emoji: '🏃', isDefault: true, createdAt: '' },
  { id: 'custom-people', nameEn: '👨‍👩‍👧 People', nameHi: '👨‍👩‍👧 लोग', emoji: '👨‍👩‍👧', isDefault: true, createdAt: '' },
  { id: 'custom-emotions', nameEn: '😊 Emotions', nameHi: '😊 भावनाएं', emoji: '😊', isDefault: true, createdAt: '' },
  { id: 'custom-places', nameEn: '📍 Places', nameHi: '📍 स्थान', emoji: '📍', isDefault: true, createdAt: '' },
];

export async function initDefaults() {
  const db = await getDB();
  const existing = await db.getAll('categories');
  if (existing.length === 0) {
    const tx = db.transaction('categories', 'readwrite');
    for (const cat of defaultCategories) {
      await tx.store.put({ ...cat, createdAt: new Date().toISOString() });
    }
    await tx.done;
  }
}

// Categories
export async function getCustomCategories(): Promise<CustomCategory[]> {
  const db = await getDB();
  return db.getAll('categories');
}

export async function addCustomCategory(cat: CustomCategory) {
  const db = await getDB();
  await db.put('categories', cat);
}

export async function updateCustomCategory(id: string, updates: Partial<CustomCategory>) {
  const db = await getDB();
  const existing = await db.get('categories', id);
  if (existing) {
    await db.put('categories', { ...existing, ...updates });
  }
}

export async function deleteCustomCategory(id: string) {
  const db = await getDB();
  // Delete category and all its items
  const items = await db.getAllFromIndex('items', 'categoryId', id);
  const tx = db.transaction(['categories', 'items'], 'readwrite');
  await tx.objectStore('categories').delete(id);
  for (const item of items) {
    await tx.objectStore('items').delete(item.id);
  }
  await tx.done;
}

// Items
export async function getCustomItems(categoryId?: string): Promise<CustomItem[]> {
  const db = await getDB();
  if (categoryId) {
    return db.getAllFromIndex('items', 'categoryId', categoryId);
  }
  return db.getAll('items');
}

export async function addCustomItem(item: CustomItem) {
  const db = await getDB();
  await db.put('items', item);
}

export async function updateCustomItem(id: string, updates: Partial<CustomItem>) {
  const db = await getDB();
  const existing = await db.get('items', id);
  if (existing) {
    await db.put('items', { ...existing, ...updates });
  }
}

export async function deleteCustomItem(id: string) {
  const db = await getDB();
  await db.delete('items', id);
}
