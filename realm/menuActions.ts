// realm/menuActions.ts
import * as Random from "expo-random";
import { v4 as uuidv4 } from "uuid";
import { openRealm } from "./realmConfig";

export type SizeInput = { label: string; price?: number };

async function generateUuid(): Promise<string> {
  try {
    // prefer native secure RNG when available
    if (Random && typeof (Random as any).getRandomBytesAsync === "function") {
      const bytes = await (Random as any).getRandomBytesAsync(16);
      const u8 = Array.isArray(bytes) ? Uint8Array.from(bytes) : bytes;
      return uuidv4({ random: u8 as any });
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // fall through to JS fallback
  }

  // JS fallback (not crypto-secure, but fine for local IDs)
  const fallback = `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
  return `fb-${fallback}`;
}



export async function createMenuItem({
  name,
  basePrice,
  category,
  imageUri,
  sizes,
}: {
  name: string;
  basePrice: number;
  category?: string | null;
  imageUri?: string | null;
  sizes?: SizeInput[] | null;
}): Promise<string[]> {
  const realm = await openRealm();

  try {
    if (sizes && sizes.length > 0) {
      // securely generate ids for each size BEFORE calling realm.write
      const ids = await Promise.all(sizes.map(() => generateUuid()));

      realm.write(() => {
        sizes.forEach((s, idx) => {
          realm.create("MenuItem", {
            id: ids[idx],
            name,
            sizeLabel: s.label,
            price: typeof s.price === "number" ? s.price : basePrice,
            category: category ?? null,
            imageUri: imageUri ?? null,
            createdAt: new Date(),
          });
        });
      });

      return ids;
    } else {
      const id = await generateUuid();

      realm.write(() => {
        realm.create("MenuItem", {
          id,
          name,
          sizeLabel: null,
          price: basePrice,
          category: category ?? null,
          imageUri: imageUri ?? null,
          createdAt: new Date(),
        });
      });

      return [id];
    }
  } finally {
    realm.close();
  }
}

export async function updateMenuItem(
  id: string,
  patch: Partial<{
    name: string;
    basePrice: number;
    category: string | null;
    imageUri: string | null;
    sizes: any[];
    price?: number;
    sizeLabel?: string | null;
  }>
): Promise<void> {
  const realm = await openRealm();
  try {
    realm.write(() => {
      const item: any = realm.objectForPrimaryKey("MenuItem", id);
      if (!item) return;
      Object.keys(patch).forEach((k) => {
        (item as any)[k] = (patch as any)[k];
      });
    });
  } finally {
    realm.close();
  }
}

export async function deleteMenuItem(id: string): Promise<void> {
  const realm = await openRealm();
  try {
    realm.write(() => {
      const item: any = realm.objectForPrimaryKey("MenuItem", id);
      if (item) realm.delete(item);
    });
  } finally {
    realm.close();
  }
}

export async function getAllMenuItems(): Promise<{ realm: Realm; results: any }> {
  const realm = await openRealm();
  const results: any = realm.objects("MenuItem").sorted("createdAt", true);
  return { realm, results };
}
