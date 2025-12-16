// components/FAB.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "../constants/theme";
import AddItemSheet from "./AddItemSheet"; // or EditItemSheet if you prefer

export default function FAB({
  onSave,
}: {
  onSave?: (
    name: string,
    price: number,
    category?: string | null,
    sizes?: any[],
    imageUri?: string | null
  ) => void;
}) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setOpen(true)}
        style={[styles.fab, { bottom: 5 + insets.bottom, right: 18 }]}
        accessibilityLabel="Add item"
      >
        <Ionicons name="add-sharp" size={34} color="#fff" />
      </TouchableOpacity>

      {/* AddItemSheet controlled by FAB */}
      <AddItemSheet
        visible={open}
        onClose={() => setOpen(false)}
        onSave={(name, price, category, sizes, imageUri) => {
          if (typeof onSave === "function") {
            onSave(name, price, category, sizes, imageUri);
          }
          setOpen(false);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accent,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
  },
});
