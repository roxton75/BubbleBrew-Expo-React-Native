// app/(tabs)/Menu.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {GestureHandlerRootView,Swipeable} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import AddItemSheet from "../../components/AddItemSheet";
import ConfirmDialog from "../../components/ConfirmDialog";
import EditItemSheet from "../../components/EditItemSheet";
import FAB from "../../components/FAB";
import theme from "../../constants/theme";
import { useMenuStore } from "../../state/useMenuStore";

const { width } = Dimensions.get("window");
const gridCardWidth = (width - 16 * 2 - 12) / 2; 

export default function MenuScreen() {
  // view modes
  const [view, setView] = useState<"list" | "grid">("list");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  // store
  const items = useMenuStore((s) => s.items);
  const load = useMenuStore((s) => s.load);
  const unload = useMenuStore((s) => s.unload);
  const addItem = useMenuStore((s) => s.add);
  const editItem = useMenuStore((s) => s.edit);
  const removeItem = useMenuStore((s) => s.remove);
  
  useEffect(() => {
    load();
    return () => unload();
  }, [load, unload]);

  const openEdit = (item: any) => {
    setEditing(item);
    setEditModalOpen(true);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmItem, setConfirmItem] = useState<any | null>(null);

  const openConfirmDelete = (item: any) => {
    setConfirmItem(item);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!confirmItem) return;
    try {
      await removeItem(confirmItem.id);
    } catch (e) {
      console.warn("delete failed", e);
    } finally {
      setConfirmOpen(false);
      setConfirmItem(null);
    }
  };

  const renderRightActions = (item: any) => {
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={styles.swipeActionBtn}
          onPress={() => openEdit(item)}
        >
          <Text style={styles.swipeEditText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.swipeActionBtn, { marginTop: 8 }]}
          onPress={() => openConfirmDelete(item)}
        >
          <Text style={styles.swipeDelText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderListItem = ({ item }: any) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => openActionMenu(item)}
        style={styles.listCard}
      >
        {item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            style={styles.listImagePlaceholder}
          />
        ) : (
          <View style={styles.listImagePlaceholder} />
        )}
        <View style={styles.listInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>
            ₹{item.price ?? item.basePrice}/-
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  const openActionMenu = (item: any) => {
    Alert.alert(item.name, undefined, [
      { text: "Edit", onPress: () => openEdit(item) },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => openConfirmDelete(item),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const renderGridItem = ({ item }: any) => (
    <View style={styles.gridCard}>
      {item.imageUri ? (
        <Image
          source={{ uri: item.imageUri }}
          style={styles.gridImagePlaceholder}
        />
      ) : (
        <View style={styles.gridImagePlaceholder} />
      )}

      <TouchableOpacity
        style={styles.kebabHam}
        onPress={() => setMenuOpenFor(menuOpenFor === item.id ? null : item.id)}
      >
        <Ionicons name="menu" size={18} color={theme.colors.accent} />
      </TouchableOpacity>

      {menuOpenFor === item.id && (
        <GridDropdown
          visible={true}
          onClose={() => setMenuOpenFor(null)}
          onEdit={() => openEdit(item)}
          onDelete={() => openConfirmDelete(item)}
        />
      )}

      <Text style={styles.gridName}>{item.name}</Text>
      <Text style={styles.gridPrice}>₹{item.price ?? item.basePrice}/-</Text>
    </View>
  );

  const filteredItems = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;

    return items.filter((it) => {
      const anyIt = it as any;
      const name = (anyIt.name ?? "").toString().toLowerCase();
      const cat = (anyIt.category ?? "").toString().toLowerCase();
      const sizeLabel = (anyIt.sizeLabel ?? anyIt.sizes?.[0]?.label ?? "")
        .toString()
        .toLowerCase();
      const priceStr = (anyIt.price ?? anyIt.basePrice ?? "")
        .toString()
        .toLowerCase();

      return (
        name.includes(term) ||
        cat.includes(term) ||
        sizeLabel.includes(term) ||
        priceStr.includes(term)
      );
    });
  }, [items, q]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <Text style={styles.header}>Menu</Text>

        <View style={styles.topRow}>

          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={18} />

            <TextInput
              placeholder="Search menu"
              placeholderTextColor="#9aa"
              value={q}
              onChangeText={setQ}
              style={styles.searchInput}
            />

            {q.length > 0 && (
              <TouchableOpacity onPress={() => setQ("")}>
                <Ionicons name="close" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.toggles}>
            <TouchableOpacity
              style={[styles.toggleBtn, view === "list" && styles.toggleActive]}
              onPress={() => setView("list")}
            >
              <Ionicons
                name="list"
                size={22}
                color={view === "list" ? "#fff" : "#000"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, view === "grid" && styles.toggleActive]}
              onPress={() => setView("grid")}
            >
              <Ionicons
                name="grid"
                size={22}
                color={view === "grid" ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* EMPTY STATE */}
        {items.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="restaurant-outline"
              size={42}
              color={theme.colors.text.muted}
            />
            <Text style={styles.emptyTitle}>No menu items yet</Text>
            <Text style={styles.emptySub}>
              Tap the + button to add your first item
            </Text>
          </View>
        )}

        {view === "list" ? (
          <FlatList
            key="list"
            data={filteredItems}
            keyExtractor={(i) => i.id}
            renderItem={renderListItem}
            contentContainerStyle={{
              paddingTop: 4,
              paddingBottom: 0,
              paddingHorizontal: 16,
            }}
          />
        ) : (
          <FlatList
            key="grid"
            data={items.filter((it) =>
              it.name.toLowerCase().includes(q.toLowerCase())
            )}
            keyExtractor={(i) => i.id}
            renderItem={renderGridItem}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: "space-between",
              paddingHorizontal: 16,
            }}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 0 }}
          />
        )}

        <EditItemSheet
          visible={editModalOpen}
          initial={editing}
          onClose={() => {
            setEditModalOpen(false);
            setEditing(null);
          }}
          onSave={(payload) => {
            if (!payload.id) return;

            editItem(payload.id, {
              name: payload.name,
              price: payload.price,
              category: payload.category ?? null,
              sizeLabel: payload.sizeLabel ?? null,
              imageUri: payload.imageUri ?? null,
            });

            setEditModalOpen(false);
            setEditing(null);
          }}
        />

        <AddItemSheet
          visible={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSave={async (name, price, category, sizes, imageUri) => {
            try {
              await addItem({
                name,
                basePrice: price,
                category: category ?? null,
                imageUri: imageUri ?? null,
                sizes: (sizes as any) ?? undefined,
              });
            } catch (e) {
              console.warn("add failed", e);
            } finally {
              setAddModalOpen(false);
            }
          }}
        />

        <FAB
          onSave={(_name?: string, _price?: number) => {
            setAddModalOpen(true);
          }}
        />

        <ConfirmDialog
          visible={confirmOpen}
          title="Delete item"
          message={`${confirmItem?.name ?? "this item"} ?`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setConfirmOpen(false);
            setConfirmItem(null);
          }}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

/* ---------- GridDropdown ---------- */
function GridDropdown({
  visible,
  onClose,
  onEdit,
  onDelete,
}: {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, anim]);

  if (!visible) return null;

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 0],
  });
  const opacity = anim;

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={dropdownStyles.overlay}>
        <Animated.View
          style={[
            dropdownStyles.menu,
            { transform: [{ translateY }], opacity },
          ]}
        >
          <TouchableOpacity
            style={dropdownStyles.item}
            onPress={() => {
              onEdit();
              onClose();
            }}
          >
            <Text style={dropdownStyles.itemText}>Edit</Text>
          </TouchableOpacity>
          <View style={dropdownStyles.sep} />
          <TouchableOpacity
            style={dropdownStyles.item}
            onPress={() => {
              onDelete();
              onClose();
            }}
          >
            <Text
              style={[dropdownStyles.itemText, { color: theme.colors.accent }]}
            >
              Delete
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

/* ---------- Styles ---------- */
const dropdownStyles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  menu: {
    position: "absolute",
    right: 13,
    top: 82,
    width: 120,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#eee",
  },
  item: { paddingVertical: 8, paddingHorizontal: 12 },
  itemText: { fontSize: 14, color: "#222", fontWeight: "600" },
  sep: { height: 1, backgroundColor: "#f1f1f1", marginHorizontal: 6 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    color: theme.colors.accent,
    fontSize: 32,
    fontWeight: "700",
    marginLeft: 16,
    marginTop: 16,
  },
  topRow: {
    flexDirection: "row",
    backgroundColor: theme.colors.background,
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 12,
    paddingBottom: 12,
  },

  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: 400,
  },
  searchClear: { position: "absolute", right: 16, paddingTop: 12 },

  toggles: { marginLeft: 12, flexDirection: "row", gap: 8 },
  toggleBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
  },
  toggleActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
    color: theme.colors.text.primary,
  },

  emptySub: {
    fontSize: 13,
    marginTop: 4,
    color: theme.colors.text.muted,
    textAlign: "center",
  },

  listCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  listImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 5,
    backgroundColor: theme.colors.divider,
  },
  listInfo: { marginLeft: 12 },
  itemName: { fontSize: 18, fontWeight: "600" },
  itemPrice: {
    marginTop: 6,
    color: theme.colors.accent,
    fontSize: 18,
    fontWeight: "700",
  },
  gridCard: {
    width: gridCardWidth,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  gridImagePlaceholder: {
    width: gridCardWidth - 24,
    height: gridCardWidth - 24,
    borderRadius: 8,
    backgroundColor: theme.colors.divider,
    marginBottom: 10,
  },
  gridName: { fontSize: 14, marginBottom: 6, fontWeight: "700" },
  gridPrice: { color: theme.colors.accent, fontSize: 18, fontWeight: "700" },
  kebab: { position: "absolute", right: 8, top: 8, padding: 6 },
  swipeActions: {
    width: 110,
    paddingBottom: 12,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  swipeActionBtn: {
    width: 92,
    height: 38,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  swipeEditText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  swipeDelText: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  kebabHam: {
    position: "absolute",
    right: 12,
    bottom: 12,
    padding: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.surface,
  },
});
