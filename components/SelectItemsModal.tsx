// components/SelectItemsModal.tsx
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import theme from "../constants/theme";
import { openRealm } from "../realm/realmConfig";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  imageUri?: string | null;
};

type Props = {
  visible: boolean;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void;
  onContinue: (
    items: {
      itemId: string;
      name: string;
      price: number;
      quantity: number;
      imageUri?: string | null;
    }[]
  ) => void;
  existingItems?: {
    itemId: string;
    quantity: number;
  }[];
};

export default function SelectItemsModal({
  visible,
  selectedIds,
  setSelectedIds,
  onClose,
  onContinue,
  existingItems, // ✅ ADD THIS
}: Props) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  //const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );


  useEffect(() => {
    if (!visible) return;

    const loadMenu = async () => {
      const realm = await openRealm();
      const items = realm.objects<any>("MenuItem");

      const mappedItems = items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        imageUri: item.imageUri ?? null,
      }));

      setMenuItems(mappedItems);

      // ✅ Always sync selectedIds with existingItems when modal opens
      if (existingItems?.length) {
        setSelectedIds(existingItems.map((i) => i.itemId));
      } else {
        setSelectedIds([]); // Clear if not editing
      }
    };

    loadMenu();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, existingItems]); // <--- add existingItems as dependency


  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    const selectedItems = menuItems
      .filter((item) => selectedIds.includes(item.id))
      .map((item) => ({
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1, // ✅ ALWAYS 1 here
        imageUri: item.imageUri,
      }));

    onContinue(selectedItems);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Select Items</Text>

          {/* Search (UI only for now) */}
          <View style={styles.searchBox}>
            <TextInput
              placeholder="Search"
              placeholderTextColor={theme.colors.text.muted}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />

            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <MaterialIcons
                  name="close"
                  size={18}
                  color={theme.colors.text.muted}
                />
              </Pressable>
            )}
          </View>

          <FlatList
            data={filteredItems}
            extraData={selectedIds} // ⭐⭐⭐ THIS LINE
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const selected = selectedIds.includes(item.id);
              return (
                <View style={styles.itemRow}>
                  {item.imageUri ? (
                    <Image
                      source={{ uri: item.imageUri }}
                      style={styles.imageBox}
                    />
                  ) : (
                    <View style={styles.imageBox} />
                  )}

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>

                    {/* PRICE FIX */}
                    <Text style={styles.price}>₹ {String(item.price)}</Text>
                  </View>

                  <Pressable
                    style={[styles.addBtn, selected && styles.checkedBtn]}
                    onPress={() => toggleSelect(item.id)}
                  >
                    {selected ? (
                      <MaterialIcons name="check" size={20} color="#fff" />
                    ) : (
                      <MaterialIcons
                        name="add"
                        size={20}
                        color={theme.colors.accent}
                      />
                    )}
                  </Pressable>
                </View>
              );
            }}
          />

          {/* Footer */}
          <View style={styles.footer}>
            <View>
              <Text style={styles.footerLabel}>Items Selected</Text>
              <Text style={styles.footerCount}>{selectedIds.length}</Text>
            </View>

            <View style={styles.footerActions}>
              <Pressable style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              {/* <Pressable
                style={[
                  styles.continueBtn,
                  selectedIds.length === 0 && {
                    backgroundColor: theme.colors.divider,
                  },
                ]}
                disabled={selectedIds.length === 0}
              >
                <Text style={styles.continueText}>Continue</Text>
              </Pressable> */}
              <Pressable
                style={[
                  styles.continueBtn,
                  selectedIds.length === 0 && {
                    backgroundColor: theme.colors.divider,
                  },
                ]}
                disabled={selectedIds.length === 0}
                onPress={handleContinue}
              >
                <Text style={styles.continueText}>Continue</Text>
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

  searchBox: {
    height: 42,
    borderRadius: 21,
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: "#EDEDED",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    justifyContent: "space-between",
  },

  searchInput: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },

  searchText: {
    color: theme.colors.text.muted,
    fontWeight: "800",
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    padding: 8,
    marginBottom: 5,
  },

  imageBox: {
    width: 64,
    height: 64,
    borderRadius: 6,
    backgroundColor: "#DDD",
    marginRight: 10,
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text.primary,
  },

  price: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.accent,
    marginTop: 2,
  },

  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  addText: {
    fontSize: 18,
    color: theme.colors.accent,
    fontWeight: "700",
  },

  footer: {
    flexDirection: "row",
    color: theme.colors.text.primary,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    //borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },

  footerLabel: {
    fontSize: 13,
    color: theme.colors.text.secondary,
  },

  footerCount: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.text.primary,
  },

  continueBtn: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    //borderWidth: 2,
    //borderColor: theme.colors.accent,
  },

  continueText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  checkedBtn: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },

  checkedText: {
    color: "#fff",
  },

  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.divider,
  },

  cancelText: {
    color: theme.colors.text.primary,
    fontWeight: "600",
  },
});
