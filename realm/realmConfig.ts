// realm/realmConfig.ts
import Realm from "realm";
import { MenuItemSchema, OrderSchema, OrderItemSchema } from "./schemas";


export async function openRealm(): Promise<Realm> {
  const config = {
    schema: [
      MenuItemSchema,
      OrderItemSchema,
      OrderSchema,
    ],
    schemaVersion: 2,
    onMigration: (oldRealm: Realm, newRealm: Realm) => {
      if (oldRealm.schemaVersion < 2) {}
    },
  } as Realm.Configuration;

  return Realm.open(config);
}
  
