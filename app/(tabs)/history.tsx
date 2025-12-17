// app/(tabs)/history.tsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useState } from "react";
import {
  //Animated,
  FlatList,
  LayoutAnimation,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "../../constants/theme";
import { openRealm } from "../../realm/realmConfig";

export default function History() {
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      let realm: any;
      let ordersResult: any;

      const loadHistory = async () => {
        realm = await openRealm();

        ordersResult = realm
          .objects("Order")
          .filtered("status == 'paid' OR status == 'cancelled'")
          .sorted("createdAt", true);

        setOrders(JSON.parse(JSON.stringify(ordersResult)));
      };

      loadHistory();

      return () => {
        if (realm && !realm.isClosed) {
          realm.close();
        }
      };
    }, [])
  );

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredOrders = orders.filter((order) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    return (
      (order.customerName || "").toLowerCase().includes(q) ||
      order.orderId.toLowerCase().includes(q) ||
      order.status.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: 16,
        paddingHorizontal: 16,
      }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>History</Text>


        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={18} />

          <TextInput
            placeholder="Order history"
            placeholderTextColor={theme.colors.text.muted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons
                name="close"
                size={18}
                color={theme.colors.text.muted}
              />
            </TouchableOpacity>
          )}
        </View>

        {filteredOrders.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="time-outline"
              size={42}
              color={theme.colors.text.muted}
            />
            <Text style={styles.emptyTitle}>No order history</Text>
            <Text style={styles.emptySub}>
              Paid and cancelled orders will appear here
            </Text>
          </View>
        )}

        {/* {filteredOrders.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No past orders yet</Text>
            <Text style={styles.emptySub}>
              Paid and cancelled orders will appear here
            </Text>
          </View>
        )} */}

        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.orderId}
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item }) => {
            const expanded = expandedId === item.orderId;

            return (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => toggleExpand(item.orderId)}
                style={styles.card}
              >
                {/* Header */}
                <View style={styles.headerRow}>
                  <View>
                    <Text style={styles.orderId}>ORDER #{item.orderId}</Text>
                    <Text style={styles.customerName}>
                      {item.customerName || "Guest"}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      item.status === "paid" ? styles.paid : styles.cancelled,
                    ]}
                  >
                    <Text
                      style={[
                        item.status === "paid"
                          ? styles.status_paid_text
                          : styles.status_complete_text,
                      ]}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Expanded */}
                {expanded && (
                  <View style={styles.details}>
                    <View style={styles.divider} />
                    {item.items.map((i: any, index: number) => (
                      <View key={index} style={styles.itemRow}>
                        <Text style={styles.itemName}>{i.name}</Text>
                        <Text style={styles.itemQty}>x{i.quantity}</Text>
                        <Text style={styles.itemPrice}>
                          ₹{i.price * i.quantity}
                        </Text>
                      </View>
                    ))}

                    <View style={styles.divider} />

                    <View style={styles.footerRow}>
                      <View>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalAmount}>
                          ₹
                          {item.items.reduce(
                            (sum: number, it: any) =>
                              sum + it.price * it.quantity,
                            0
                          )}
                        </Text>
                      </View>

                      <View style={styles.timeBox}>
                        <Text style={styles.dateText}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                        <Text style={styles.timeText}>
                          {new Date(item.createdAt).toLocaleTimeString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 12,
    color: theme.colors.accent,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.primary,
  },

  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    backgroundColor: theme.colors.surface,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderId: {
    fontSize: 11,
    opacity: 0.6,
    fontWeight: 500,
  },

  customerName: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 2,
    color: theme.colors.accent,
  },

  statusBadge: {
    height: 28,
    //paddingHorizontal: 10,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 4,

    //borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  statusChipWrapper: {
    justifyContent: "center",
  },

  paid: {
    backgroundColor: "#c9f0cfff",
    color: theme.colors.accent,
  },

  cancelled: {
    backgroundColor: "#f7ccccff",
  },

  statusText: {
    fontSize: 12,

    fontWeight: "700",
    color: "#fff",
  },

  status_paid_text: {
    color: "#00af0fff", // strong green
    fontWeight: "700",
  },

  status_complete_text: {
    color: "#da0000ff", // strong green
    fontWeight: "700",
  },

  details: {
    marginTop: 10,
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },

  itemName: {
    flex: 1,
    fontSize: 13,
  },

  itemQty: {
    width: 40,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.text.secondary,
  },

  itemPrice: {
    width: 70,
    textAlign: "right",
    paddingRight: 12,
    fontSize: 13,
  },

  divider: {
    //height: 1,
    borderColor: theme.colors.text.muted,
    borderWidth: 1,
    borderStyle: "dashed",
    //opacity: 100,
    marginVertical: 10,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  totalLabel: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: "700",
    color: theme.colors.text.secondary,
  },

  totalAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.primary,
  },

  timeBox: {
    alignItems: "flex-end",
  },

  timeText: {
    fontSize: 12,
    paddingRight: 10,
    fontWeight: "600",
    marginBottom: 4,
  },

  dateText: {
    fontSize: 11,
    opacity: 0.6,
    paddingRight: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555555ff",
  },

  emptySub: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
});
