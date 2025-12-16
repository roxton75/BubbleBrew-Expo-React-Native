// /* eslint-disable @typescript-eslint/no-unused-vars */
// // state/useMenuStore.ts
// import { create } from "zustand";
// import {
//   createMenuItem,
//   updateMenuItem,
//   deleteMenuItem,
//   getAllMenuItems,
//   SizeInput,
// } from "../realm/menuActions";

// type MenuItem = {
//   id: string;
//   name: string;
//   // store shows price as `price` in Realm; keep basePrice for compatibility
//   basePrice: number;
//   category?: string | null;
//   imageUri?: string | null;
//   sizes?: { label: string; price?: number }[];
//   createdAt?: Date;
// };

// type MenuState = {
//   items: MenuItem[];
//   load: () => Promise<void>;
//   unload: () => void;
//   add: (payload: {
//     name: string;
//     basePrice: number;
//     category?: string | null;
//     imageUri?: string | null;
//     sizes?: SizeInput[] | undefined;
//   }) => Promise<void>;
//   edit: (id: string, patch: Partial<MenuItem>) => Promise<void>;
//   remove: (id: string) => Promise<void>;
// };

// export const useMenuStore = create<MenuState>((set, get) => {
//   // keep local refs so we can remove listeners & close realm on unload
//   let realmRef: Realm | null = null;
//   let resultsRef: any = null;

//   return {
//     items: [],
//     load: async () => {
//       // close previous if exists
//       if (realmRef) {
//         try {
//           resultsRef?.removeAllListeners?.();
//           realmRef.close();
//         } catch (e) {}
//         realmRef = null;
//         resultsRef = null;
//       }

//       const { realm, results } = await getAllMenuItems();
//       realmRef = realm;
//       resultsRef = results;

//       const list = results.map((r: any) => ({ ...r }));
//       set({ items: list });

//       // keep store in sync with Realm changes
//       results.addListener(() => {
//         const updated = results.map((r: any) => ({ ...r }));
//         set({ items: updated });
//       });
//     },
//     unload: () => {
//       try {
//         resultsRef?.removeAllListeners?.();
//         realmRef?.close();
//       } catch (e) {
//         // ignore
//       } finally {
//         realmRef = null;
//         resultsRef = null;
//         set({ items: [] });
//       }
//     },
//     add: async (payload) => {
//       await createMenuItem({
//         name: payload.name,
//         basePrice: payload.basePrice,
//         category: payload.category ?? null,
//         imageUri: payload.imageUri ?? null,
//         sizes: (payload.sizes as any) ?? undefined,
//       });
//       // createMenuItem writes to Realm; listener will update items automatically
//     },
//     edit: async (id, patch) => {
//       await updateMenuItem(id, patch as any);
//     },
//     remove: async (id) => {
//       await deleteMenuItem(id);
//     },
//   };
// });

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
  visible?: boolean;        // ← ADD THIS
  order?: number;           // optional ordering index (if you use it)
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
      // cleanup previous realm instance
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
