// // realm/schemas.ts
// // Realm object schemas for Bubble Brew

// realm/schemas.ts
export const MenuItemSchema = {
  name: "MenuItem",
  primaryKey: "id",
  properties: {
    id: "string",
    name: "string",
    sizeLabel: "string?",   // nullable
    price: "double",        // numeric (double) — not "string"
    category: "string?",    // nullable
    imageUri: "string?",    // nullable
    createdAt: "date",
  },
};

export const OrderItemSchema = {
  name: "OrderItem",
  embedded: true,
  properties: {
    itemId: "string",
    name: "string",
    price: "double",
    quantity: "int",
  },
};


export const OrderSchema = {
  name: "Order",
  primaryKey: "orderId",
  properties: {
    orderId: "string",
    customerName: "string?",
    status: {
      type: "string",
      default: "new",      // new | preparing | ready | paid | cancelled
    },
    items: {
      type: "list",
      objectType: "OrderItem",
    },
    createdAt: "date",
  },
};

