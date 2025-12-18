// app/(tabs)/index.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import "react-native-get-random-values";
import { SafeAreaView } from "react-native-safe-area-context";
import { openRealm } from "../../realm/realmConfig";

import Realm from "realm";
import ConfirmDialog from "../../components/ConfirmDialog";

import ConfirmOrderModal from "../../components/ConfirmOrderModal";
import SelectItemsModal from "../../components/SelectItemsModal";
import TopNotification from "../../components/TopNotification";
import theme from "../../constants/theme";

/* ---------------- TYPES ---------------- */

type OrderItem = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  orderId: string;
  customerName: string | null;
  status: "new" | "preparing" | "ready" | "paid" | "cancelled";
  items: OrderItem[];
  createdAt: Date;
};

/* -------------------- STATUS MAPS -------------------- */

const NEXT_STATUS = {
  new: "preparing",
  preparing: "ready",
  ready: "paid", 
};

const PREV_STATUS: Record<string, string | null> = {
  preparing: "new",
  ready: "preparing",
  completed: "ready",
};

const getCTALabel = (status: string) => {
  if (status === "new") return "Take";
  if (status === "preparing") return "Done";
  if (status === "ready") return "Complete";
  return null;
};

/* ---------------- TICKET CARD ---------------- */

function OrderTicket({
  item,
  onNext,
  onPrev,
  onDelete,
  onEdit,
}: {
  item: Order;
  onNext: (id: string, status: Order["status"]) => void;
  onPrev: (id: string, status: Order["status"]) => void;
  onDelete: (id: string) => void;
  onEdit: (order: Order) => void;
}) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  /* -------------------- TOOLTIP -------------------- */
  const [showHint, setShowHint] = React.useState(false);
  const hintOpacity = React.useRef(new Animated.Value(0)).current;

  const showUndoHint = () => {
    setShowHint(true);
    Animated.sequence([
      Animated.timing(hintOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.delay(900),
      Animated.timing(hintOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => setShowHint(false));
  };

  const total = item.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  
  const ctaLabel = getCTALabel(item.status);
  const nextStatus = NEXT_STATUS[item.status];
  const prevStatus = PREV_STATUS[item.status];

  const animatePress = (cb: () => void) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(cb);
  };

  return (
    <Swipeable>
      <View style={styles.ticket}>
        <View style={styles.ticketTop}>
          <View>
            <Text style={styles.orderId}>
              ORDER #{item.orderId.slice(0, 6)}
            </Text>
            <Text style={styles.customer}>
              {item.customerName || "Customer"}
            </Text>
          </View>

          <View style={styles.statusChipWrapper}>
            <View style={[styles.statusChip, styles[`status_${item.status}`]]}>
              <Text
                style={[
                  styles.statusText,
                  styles[`status_${item.status}_text`],
                ]}
              >
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.dashedDivider} />

        {item.items.map((i, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemName}>{i.name}</Text>
            <Text style={styles.itemQty}>×{i.quantity}</Text>
            <Text style={styles.itemPrice}>₹{i.price * i.quantity}</Text>
          </View>
        ))}

        <View style={styles.dashedDivider} />

        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalAmount}>₹{total}</Text>
          </View>

          <View style={styles.actionRow}>
            {(item.status === "new" || item.status === "preparing") && (
              <Pressable
                style={[styles.iconBtn, styles.deleteBtn]}
                onPress={() => onDelete(item.orderId)}
              >
                <MaterialIcons name="close" size={20} color="#1f1f1fff" />
              </Pressable>
            )}

            {item.status === "ready" && (
              <Pressable
                style={[styles.iconBtn, styles.deleteBtn]}
                onPress={() => onDelete(item.orderId)}
              >
                <MaterialIcons name="delete" size={20} color="#1f1f1fff" />
              </Pressable>
            )}

            {/* EDIT → only for non-ready orders */}
            {item.status !== "ready" && (
              <Pressable
                style={styles.iconBtn}
                onPress={() => onEdit(item)} 
              >
                <MaterialIcons
                  name="edit"
                  size={20}
                  color={theme.colors.primary}
                />
              </Pressable>
            )}

            {ctaLabel && (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable
                  onPressIn={showUndoHint}
                  onPress={() =>
                    animatePress(() => {
                      if (nextStatus) onNext(item.orderId, nextStatus as any);
                    })
                  }
                  onLongPress={() =>
                    animatePress(() => {
                      if (prevStatus) onPrev(item.orderId, prevStatus as any);
                    })
                  }
                  delayLongPress={400}
                  style={[
                    styles.ctaBtn,
                    item.status !== "new" ? styles.ctaSolid : styles.ctaOutline,
                  ]}
                >
                  <Text
                    style={[
                      styles.ctaText,
                      item.status === "new" && styles.ctaOutlineText,
                    ]}
                  >
                    {ctaLabel}
                  </Text>
                </Pressable>
              </Animated.View>
            )}
          </View>
        </View>
        {showHint && (
          <Animated.View style={[styles.tooltip, { opacity: hintOpacity }]}>
            <Text style={styles.tooltipText}>Hold to undo</Text>
          </Animated.View>
        )}
      </View>
    </Swipeable>
  );
}

/* ---------------- SCREEN ---------------- */

export default function Home() {
  const [showSelect, setShowSelect] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showEditItems, setShowEditItems] = useState(false);

  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [homeTab, setHomeTab] = useState<"active" | "ready">("active");

  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingCustomerName, setEditingCustomerName] = useState<string | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);

  const handleEditOrder = (order: Order) => {
    setIsEditing(true);
    setEditingOrderId(order.orderId);
    setSelectedItems(order.items);
    setSelectedItemIds(order.items.map((i) => i.itemId));
    setEditingCustomerName(order.customerName);
    setShowEditItems(true);
    setShowSelect(true);
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const deleteOrder = async () => {
    if (!deleteTargetId) return;

    const realm = await openRealm();

    realm.write(() => {
      const order: any = realm.objectForPrimaryKey("Order", deleteTargetId);
      if (!order) return;

      if (order.status === "ready") {
        order.status = "cancelled"; 
      } else {
        realm.delete(order); 
      }
    });
    await loadOrders();

    setShowDeleteDialog(false);
    setDeleteTargetId(null);
  };

  /* -------------------- REALM LISTENER -------------------- */

  useEffect(() => {
    let realm: any;
    let results: any;

    const load = async () => {
      realm = await openRealm();
      results = realm.objects("Order").sorted("createdAt", true);

      const sync = () => {
        setOrders(
          results.map((o: any) => ({
            orderId: o.orderId,
            customerName: o.customerName,
            status: o.status,
            items: o.items.map((i: any) => ({
              itemId: i.itemId,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
            })),
            createdAt: o.createdAt,
          }))
        );
      };

      sync();
      results.addListener(sync);
    };

    load();

    return () => {
      if (results) results.removeAllListeners();
      if (realm && !realm.isClosed) realm.close();
    };
  }, []);

  /* ---------------- DATA ---------------- */

  const loadOrders = async () => {
    const realm = await openRealm();
    const data = realm.objects<any>("Order").sorted("createdAt", true);

    setOrders(
      data.map((o) => ({
        orderId: o.orderId,
        customerName: o.customerName,
        status: o.status,
        items: o.items.map((i: any) => ({
          itemId: i.itemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        createdAt: o.createdAt,
      }))
    );
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateOrderStatus = async (
    orderId: string,
    nextStatus: Order["status"]
  ) => {
    const realm = await openRealm();
    realm.write(() => {
      const order = realm.objectForPrimaryKey("Order", orderId);
      if (order) order.status = nextStatus;
    });
    loadOrders();
  };

  /* ---------------- FILTERS ---------------- */

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();

    return orders.filter(
      (o) =>
        o.customerName?.toLowerCase().includes(q) ||
        o.orderId.toLowerCase().includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q))
    );
  }, [orders, search]);

  const finalOrders = useMemo(() => {
    return filteredOrders.filter((o) => {
      if (homeTab === "active") {
        return o.status === "new" || o.status === "preparing";
      }
      return o.status === "ready";
    });
  }, [filteredOrders, homeTab]);

  /* ---------------- RENDER CARD ---------------- */

  const renderOrder = ({ item }: { item: Order }) => (
    <OrderTicket
      item={item}
      onNext={updateOrderStatus}
      onPrev={updateOrderStatus}
      onDelete={(id) => {
        setDeleteTargetId(id);
        setShowDeleteDialog(true);
      }}
      onEdit={handleEditOrder}
    />
  );

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <TopNotification
        message={notification ?? ""}
        visible={notification !== null}
      />

      <Text style={styles.title}>Home</Text>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={18} />
          <TextInput
            placeholder="Search orders"
            placeholderTextColor={theme.colors.text.muted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <MaterialIcons name="close" size={18} />
            </Pressable>
          )}
        </View>

        <Pressable
          style={styles.newOrderBtn}
          onPress={() => {
            setIsEditing(false);
            setEditingOrderId(null);
            setEditingCustomerName(null);
            setSelectedItems([]);
            setSelectedItemIds([]);
            setShowSelect(true);
          }}
        >
          <Text style={styles.newOrderText}>New Order</Text>
        </Pressable>
      </View>

      <View style={styles.tabRow}>
        {["active", "ready"].map((t) => (
          <Pressable
            key={t}
            style={[styles.tabItem, homeTab === t && styles.tabActive]}
            onPress={() => setHomeTab(t as any)}
          >
            <Text
              style={[styles.tabText, homeTab === t && styles.tabTextActive]}
            >
              {t === "active" ? "Active Orders" : "Ready Orders"}
            </Text>
          </Pressable>
        ))}
      </View>
      {finalOrders.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialIcons
            name={
              homeTab === "active" ? "receipt-long" : "check-circle-outline"
            }
            size={42}
            color={theme.colors.text.muted}
          />
          <Text style={styles.emptyTitle}>
            {homeTab === "active" ? "No active orders" : "No ready orders"}
          </Text>
          <Text style={styles.emptySub}>
            {homeTab === "active"
              ? "New and preparing orders will appear here"
              : "Completed orders will show here"}
          </Text>
        </View>
      )}

      <FlatList
        data={finalOrders}
        keyExtractor={(item) => item.orderId}
        renderItem={renderOrder}
        showsVerticalScrollIndicator={false}
      />

      <SelectItemsModal
        visible={showSelect}
        selectedIds={selectedItemIds}
        setSelectedIds={setSelectedItemIds}
        existingItems={isEditing ? selectedItems : undefined}
        onClose={() => {
          setShowSelect(false);
          if (!isEditing) {
            setSelectedItemIds([]);
          }
        }}
        onContinue={(items) => {
          setSelectedItems(items);
          setShowSelect(false);
          setShowConfirm(true);
        }}
      />

      <ConfirmOrderModal
        visible={showConfirm}
        items={selectedItems}
        onBack={() => {
          setShowConfirm(false);
          setShowSelect(true);
        }}
        isEditing={isEditing}
        initialCustomerName={editingCustomerName}
        onPlaceOrderSuccess={async (name, items) => {
          const realm = await openRealm();

          realm.write(() => {
            if (isEditing && editingOrderId) {
              const order = realm.objectForPrimaryKey("Order", editingOrderId);
              if (!order) return;

              order.customerName = name;

              const realmItems = order.items as Realm.List<any>;
              realmItems.splice(0, realmItems.length);

              items.forEach((i) => {
                realmItems.push({
                  itemId: i.itemId,
                  name: i.name,
                  price: i.price,
                  quantity: i.quantity,
                });
              });
            }
          });

          setShowConfirm(false);
          setIsEditing(false);
          setEditingOrderId(null);
          setSelectedItems([]);
          setSelectedItemIds([]);

          loadOrders();

          setTimeout(() => setNotification(null), 2000);
          setNotification(
            isEditing
              ? "Order updated"
              : `Order placed for ${name || "Customer"}`
          );
        }}
      />

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete Order?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={deleteOrder}
        onCancel={() => {
          setShowDeleteDialog(false);
          setDeleteTargetId(null);
        }}
      />
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: { fontSize: 32, fontWeight: "700", color: theme.colors.accent },

  searchRow: { flexDirection: "row", gap: 8, marginVertical: 12 },
  searchBox: {
    flex: 1,
    height: 44,
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 22,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1 },

  newOrderBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
  },
  newOrderText: { color: "#fff", fontWeight: "700" },

  tabRow: { flexDirection: "row", marginBottom: 12 },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 6 },
  tabText: { color: theme.colors.text.muted, fontWeight: "700", fontSize: 16 },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  tabActive: {
    borderBottomWidth: 2,
    fontWeight: "700",
    borderBottomColor: theme.colors.background,
    fontSize: 16,
  },

  emptyText: { textAlign: "center", marginTop: 40 },

  ticket: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    marginBottom: 12,
  },

  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  orderId: {
    fontSize: 12,
    color: theme.colors.text.muted,
    //marginTop: 4,
    fontWeight: "700",
  },
  customer: { fontSize: 28, color: theme.colors.accent, fontWeight: "700" },

  dashedDivider: {
    borderBottomWidth: 1.5,
    borderColor: theme.colors.text.muted,
    borderStyle: "dashed",
    marginVertical: 12,
  },

  itemRow: { flexDirection: "row", paddingVertical: 3 },
  itemName: { flex: 1, color: theme.colors.text.primary, fontWeight: 700 },
  itemQty: { width: 40, color: theme.colors.text.secondary, fontWeight: 700 },
  itemPrice: {
    width: 80,
    textAlign: "right",
    marginRight: 23,
    fontWeight: 700,
  },

  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontWeight: "700", color: theme.colors.text.secondary },
  totalAmount: { fontSize: 26, fontWeight: "800", color: theme.colors.accent },

  ctaBtn: {
    marginTop: 4,
    alignSelf: "flex-end",
    paddingHorizontal: 32,
    paddingVertical: 10,
    //padding: 12,
    borderRadius: 8,
  },
  ctaSolid: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 33,
    borderColor: theme.colors.accent,
  },
  ctaOutline: {
    borderWidth: 2,
    paddingHorizontal: 32,
    borderColor: theme.colors.primary,
  },
  ctaText: { fontWeight: "700", color: "#fff", fontSize: 16 },
  ctaOutlineText: { color: theme.colors.accent },

  ticketTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusChipWrapper: {
    justifyContent: "center",
  },

  statusChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 14,
    fontWeight: "700",
  },

  status_new: {
    backgroundColor: "#e6f0f4ff", // light green tint
  },
  status_new_text: {
    color: "#6c97e9ff", // strong green
  },

  status_preparing: {
    backgroundColor: "#FEF3C7", // light yellow tint
  },
  status_preparing_text: {
    color: "#D97706", // amber
  },

  status_ready: {
    backgroundColor: "#fde8fdff", // light pink tint
  },
  status_ready_text: {
    color: "#ec59e0ff", // rose/red
  },
  tooltip: {
    position: "absolute",
    bottom: 60,
    right: 27,
    backgroundColor: "#000000d3",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },

  tooltipText: {
    color: theme.colors.divider,
    fontSize: 12,
    fontWeight: "600",
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  iconBtn: {
    marginTop: 3.5,
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.divider,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
  },

  deleteBtn: {
    borderColor: theme.colors.divider,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    color: theme.colors.text.primary,
  },

  emptySub: {
    fontSize: 13,
    marginTop: 4,
    color: theme.colors.text.muted,
    textAlign: "center",
  },
});
