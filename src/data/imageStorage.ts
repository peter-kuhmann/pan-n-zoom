import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import { createId } from "@paralleldrive/cuid2";

interface ImageStorageDatabase extends DBSchema {
  images: {
    key: string;
    value: {
      dataUrl: string;
    };
  };
}

let cachedDb: IDBPDatabase<ImageStorageDatabase> | null = null;

async function getDb() {
  if (!cachedDb) {
    cachedDb = await openDB<ImageStorageDatabase>("image-storage-db", 1, {
      upgrade(db) {
        db.createObjectStore("images");
      },
    });
  }

  return cachedDb;
}

export interface StoredImage {
  id: string;
}

export async function storeImage(dataUrl: string): Promise<StoredImage> {
  const db = await getDb();

  const newId = createId();
  await db.put("images", { dataUrl }, newId);

  return {
    id: newId,
  };
}

export async function deleteStoredImage(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("images", id);
}

export async function getStoredImage(id: string): Promise<string | null> {
  const db = await getDb();
  const storedImage = await db.get("images", id);
  if (!storedImage) return null;
  return storedImage.dataUrl;
}
