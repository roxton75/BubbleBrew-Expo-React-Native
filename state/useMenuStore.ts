/* eslint-disable @typescript-eslint/no-unused-vars */
// state/useMenuStore.ts
import { create } from "zustand";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  SizeInput,
} from "../realm/menuActions";

type MenuItem = {
  id: string;
  name: string;
  basePrice: number;
  price?: number;                     // actual record price
  category?: string | null;
  imageUri?: string | null;
  sizeLabel?: string | null;          // single-size label
  sizes?: { label: string; price?: number }[];
  visible?: boolean;        
  order?: number;           
  createdAt?: Date;
};

type MenuState = {
  items: MenuItem[];
  load: () => Promise<void>;
  unload: () => void;
  add: (payload: {
    name: string;
    basePrice: number;
    category?: string | null;
    imageUri?: string | null;
    sizes?: SizeInput[] | undefined;
  }) => Promise<void>;
  edit: (id: string, patch: Partial<MenuItem>) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useMenuStore = create<MenuState>((set, get) => {
  let realmRef: Realm | null = null;
  let resultsRef: any = null;

  return {
    items: [],

    // LOAD DATA
    load: async () => {
      if (realmRef) {
        try {
          resultsRef?.removeAllListeners?.();
          realmRef.close();
        } catch (e) {}
      }

      const { realm, results } = await getAllMenuItems();
      realmRef = realm;
      resultsRef = results;

      const list = results.map((r: any) => ({ ...r }));
      set({ items: list });

      // real-time sync: Realm change listener
      results.addListener(() => {
        const updated = results.map((r: any) => ({ ...r }));
        set({ items: updated });
      });
    },

    // UNLOAD
    unload: () => {
      try {
        resultsRef?.removeAllListeners?.();
        realmRef?.close();
      } catch (e) {}
      realmRef = null;
      resultsRef = null;
      set({ items: [] });
    },

    // ADD NEW ITEM(S)
    add: async (payload) => {
      const ids = await createMenuItem({
        name: payload.name,
        basePrice: payload.basePrice,
        category: payload.category ?? null,
        imageUri: payload.imageUri ?? null,
        sizes: payload.sizes ?? undefined,
      });

      const createdIds = Array.isArray(ids) ? ids : [ids];

      const newItems = createdIds.map((id, index) => {
        const size = payload.sizes?.[index];

        return {
          id,
          name: payload.name,
          price: size?.price ?? payload.basePrice,
          basePrice: payload.basePrice,
          sizeLabel: size?.label ?? null,
          sizes: payload.sizes ?? undefined,
          category: payload.category ?? null,
          imageUri: payload.imageUri ?? null,
          createdAt: new Date(),
        };
      });

      // add immediately to UI
      set((state) => ({
        items: [...newItems, ...state.items],
      }));
    },

    // EDIT ITEM
    edit: async (id, patch) => {
      await updateMenuItem(id, patch as any);

      // update UI instantly
      set((state) => ({
        items: state.items.map((it) =>
          it.id === id ? { ...it, ...patch } : it
        ),
      }));
    },

    // DELETE ITEM
    remove: async (id) => {
      await deleteMenuItem(id);

      // update UI instantly
      set((state) => ({
        items: state.items.filter((it) => it.id !== id),
      }));
    },
  };
});
