// realm/realmConfig.ts
import Realm from "realm";
import { MenuItemSchema, OrderSchema, OrderItemSchema } from "./schemas";


export async function openRealm(): Promise<Realm> {
  // cast to Realm.Configuration to satisfy TypeScript
  const config = {
    schema: [
      MenuItemSchema,
      OrderItemSchema,
      OrderSchema,
    ],
    schemaVersion: 2,
    onMigration: (oldRealm: Realm, newRealm: Realm) => {
      if (oldRealm.schemaVersion < 2) {
        // optional migration logic if you changed fields
      }
    },
  } as Realm.Configuration;

  return Realm.open(config);
}
  