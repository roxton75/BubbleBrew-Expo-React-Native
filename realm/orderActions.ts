import { openRealm } from "./realmConfig";

type OrderItemInput = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
};

export async function saveOrder({
  customerName,
  items,
}: {
  customerName?: string;
  items: OrderItemInput[];
}) {
  const realm = await openRealm();

  // const orderId = `${Date.now()}`; // ✅ React Native safe

  const now = new Date();

  // const orderId = now
  //   .toISOString()
  //   .slice(2, 16) // YY-MM-DDTHH:MM
  //   .replace(/[-T:]/g, ""); // YYMMDDHHMM
  const pad = (n: number) => n.toString().padStart(2, "0");

  const orderId =
    `${pad(now.getMinutes())}${pad(now.getSeconds())}OI` +
    `${pad(now.getDate())}${pad(now.getMonth() + 1)}${now
      .getFullYear()
      .toString()
      .slice(2)}`;

  // Optional dash for readability
  const readableOrderId = orderId.slice(0, 6) + "-" + orderId.slice(6);

  realm.write(() => {
    realm.create("Order", {
      //orderId: uuidv4(), // ✅ NEW UNIQUE ID
      orderId: readableOrderId,
      customerName: customerName ?? null,
      status: "new",
      items: items.map((item) => ({
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      createdAt: new Date(),
    });
  });
}
