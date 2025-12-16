// components/MenuItemCard.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export type MenuItem = {
  id: string;
  name: string;
  basePrice: number;
  category?: string | null;
  imageUri?: string | null;
};

type Props = {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
};

export default function MenuItemCard({ item, onEdit, onDelete }: Props) {
  return (
    <View style={styles.card}>
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={{ color: "#999" }}>No image</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>₹{item.basePrice}</Text>
        {item.category ? <Text style={styles.cat}>{item.category}</Text> : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete}>
          <Text style={[styles.actionText, { color: "#d64" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 1,
    alignItems: "center",
  },
  image: { width: 72, height: 72, borderRadius: 8, backgroundColor: "#eee" },
  placeholder: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: "600" },
  price: { marginTop: 6, color: "#333" },
  cat: { marginTop: 4, color: "#777", fontSize: 12 },
  actions: { marginLeft: 8, alignItems: "flex-end" },
  actionText: { color: "#0b8f73", paddingVertical: 6 },
});
