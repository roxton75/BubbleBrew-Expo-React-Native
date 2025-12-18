import React, { useMemo, useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  Image,
} from "react-native";
import theme from "../constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { saveOrder } from "../realm/orderActions";

type OrderItem = {
  itemId: string; //  correct key
  name: string;
  price: number;
  quantity: number;
  imageUri?: string | null;
};

type Props = {
  visible: boolean;
  items: OrderItem[];
  onBack: () => void;
  onPlaceOrderSuccess: (name: string, items: OrderItem[]) => void;
  isEditing?: boolean;
  initialCustomerName?: string | null;
};

export default function ConfirmOrderModal({
  visible,
  items,
  onBack,
  onPlaceOrderSuccess,
  isEditing = false,
  initialCustomerName,
}: //onPlaceOrder,
Props) {
  const [customerName, setCustomerName] = useState("");
  const isNameValid = customerName.trim().length > 0;
  const [orderItems, setOrderItems] = useState(items);

  useEffect(() => {
    if (!visible) {
      setCustomerName("");
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setOrderItems(items);
    }
  }, [visible, items]);

  useEffect(() => {
    if (visible) {
      setCustomerName(initialCustomerName ?? "");
    }
  }, [visible, initialCustomerName]);

  const increaseQty = (itemId: string) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (itemId: string) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

  const total = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [orderItems]
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Confirm Order</Text>

          {/* Customer name */}
          <View style={styles.nameRow}>
            <Text style={styles.label}>Order for :</Text>
            <TextInput
              placeholder="Enter Name"
              placeholderTextColor={theme.colors.text.muted}
              value={customerName}
              onChangeText={setCustomerName}
              style={styles.nameInput}
            />
          </View>

          <Text style={styles.section}>Selected Items</Text>

          <FlatList
            data={orderItems}
            keyExtractor={(item) => item.itemId}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                {item.imageUri ? (
                  <Image source={{ uri: item.imageUri }} style={styles.image} />
                ) : (
                  <View style={styles.image} />
                )}

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.price}>₹ {item.price}</Text>
                </View>

                <View style={styles.qtyBox}>
                  {/* Decrease */}
                  <Pressable
                    disabled={item.quantity === 1}
                    onPress={() => decreaseQty(item.itemId)}
                    style={[
                      styles.qtyBtn,
                      item.quantity === 1
                        ? styles.qtyBtnMuted
                        : styles.qtyBtnActive,
                    ]}
                  >
                    <MaterialIcons
                      name="remove"
                      size={18}
                      color={
                        item.quantity === 1
                          ? theme.colors.text.muted
                          : theme.colors.accent
                      }
                    />
                  </Pressable>

                  <Text style={styles.qty}>{item.quantity}</Text>

                  {/* Increase */}
                  <Pressable
                    onPress={() => increaseQty(item.itemId)}
                    style={[styles.qtyBtn, styles.qtyBtnActive]}
                  >
                    <MaterialIcons
                      name="add"
                      size={18}
                      color={theme.colors.accent}
                    />
                  </Pressable>
                </View>
              </View>
            )}
          />

          {/* Footer */}
          <View style={styles.footer}>
            <View>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>₹ {total}/-</Text>
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.backBtn} onPress={onBack}>
                <Text style={styles.backText}>Back</Text>
              </Pressable>

              <Pressable
                disabled={!isNameValid}
                style={[
                  styles.placeBtn,
                  !isNameValid && styles.placeBtnDisabled,
                ]}
                
                onPress={async () => {
                  if (!isNameValid) return;

                  const nameToShow = customerName.trim();

                  if (!isEditing) {
                    await saveOrder({
                      customerName: nameToShow,
                      items: orderItems,
                    });
                  }

                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  );

                  onPlaceOrderSuccess(nameToShow, orderItems);
                  setCustomerName("");
                }}
              >
                <Text
                  style={[
                    styles.placeText,
                    !isNameValid && styles.placeTextDisabled,
                  ]}
                >
                  {isEditing ? "Save Order" : "Place Order"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "88%",
    height: "78%",
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.accent,
    textAlign: "center",
    marginBottom: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontWeight: "600",
    fontSize: 16,
    color: theme.colors.text.secondary,
  },

  //   placeholder: {
  //     color: theme.colors.text.muted,
  //   },

  nameInput: {
    flex: 1,
    color: theme.colors.text.primary,
    fontSize: 14,
    height: 38,
    borderRadius: 50,
    borderColor: theme.colors.primary,
    borderWidth: 2,
    marginVertical: 8,
    marginRight: 4,
    backgroundColor: theme.colors.background,
    paddingLeft: 14,
    //paddingHorizontal: 14,
  },
  section: {
    fontWeight: "600",
    //alighnSelf: "center",
    borderTopColor: theme.colors.divider,
    borderTopWidth: 1,
    borderStyle: "dashed",
    paddingTop: 10,
    fontSize: 18,
    color: theme.colors.accent,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    paddingTop: 6,
    backgroundColor: theme.colors.surface,
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 6,
    backgroundColor: "#dddddd",
    marginRight: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: "600",
  },
  price: {
    color: theme.colors.accent,
  },
  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnActive: {
    borderColor: theme.colors.divider,
    borderWidth: 2,
  },

  qtyBtnMuted: {
    borderColor: theme.colors.divider,
    backgroundColor: "#F2F2F2",
  },

  qty: {
    fontWeight: "600",
    fontSize: 22,
    color: theme.colors.primary,
    paddingHorizontal: 4,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    //borderTopWidth: 1,

    marginBottom: 0,
    borderTopColor: theme.colors.divider,
    paddingTop: 12,
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: -4,
    color: theme.colors.text.secondary,
  },

  totalAmount: {
    fontSize: 26,
    marginTop: -4,
    fontWeight: "800",
    color: theme.colors.accent,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelText: {
    fontWeight: "600",
  },
  placeBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: theme.colors.accent,
  },
  placeBtnDisabled: {
    backgroundColor: theme.colors.divider,
  },

  placeTextDisabled: {
    color: theme.colors.text.muted,
  },

  placeText: {
    color: "#fff",
    fontWeight: "700",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.divider,
  },

  backText: {
    fontWeight: "600",
    color: theme.colors.text.primary,
    paddingHorizontal: 6,
  },
});
