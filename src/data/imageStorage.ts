import { type DBSchema, openDB } from "idb";
import { createId } from "@paralleldrive/cuid2";

interface ImageStorageDatabase extends DBSchema {
  images: {
    key: string;
    value: {
      dataUrl: string;
    };
  };
}

const db = await openDB<ImageStorageDatabase>("image-storage-db", 1, {
  upgrade(db) {
    db.createObjectStore("images");
  },
});

export interface StoredImage {
  id: string;
}

export async function storeImage(dataUrl: string): Promise<StoredImage> {
  const newId = createId();

  await db.put("images", { dataUrl }, newId);

  return {
    id: newId,
  };
}

export async function getStoredImage(id: string): Promise<string | null> {
  const storedImage = await db.get("images", id);
  if (!storedImage) return null;
  return storedImage.dataUrl;
}
