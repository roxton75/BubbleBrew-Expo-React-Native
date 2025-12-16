// components/EditItemSheet.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getBottomSpace } from "react-native-iphone-x-helper";
import theme from "../constants/theme";

type Item = {
  id?: string | null;
  name?: string;
  basePrice?: number;
  price?: number;
  sizeLabel?: string | null;
  category?: string | null;
  imageUri?: string | null;
};

export default function EditItemSheet({
  visible,
  initial,
  onClose,
  onSave,
}: {
  visible: boolean;
  initial: Item | null;
  onClose: () => void;
  onSave: (payload: {
    id: string | null;
    name: string;
    price: number;
    category?: string | null;
    sizeLabel?: string | null;
    imageUri?: string | null;
  }) => void;
}) {
  const [name, setName] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [imageUri, setImageUri] = React.useState<string | null>(null);
  const [selectedChip, setSelectedChip] = React.useState<string>("R");

  const scale = React.useRef(new Animated.Value(0.96)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    setName(initial?.name ?? "");
    setPrice(
      initial?.price !== undefined
        ? String(initial.price)
        : initial?.basePrice !== undefined
        ? String(initial.basePrice)
        : ""
    );
    setCategory(initial?.category ?? "");
    setSelectedChip(initial?.sizeLabel ?? "R");
    setImageUri(initial?.imageUri ?? null);
  }, [initial, visible]);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: visible ? 1 : 0.96,
        duration: visible ? 160 : 120,
        easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: visible ? 160 : 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, visible]);

  const canSave = Boolean(name.trim()) && !isNaN(Number(price));
  const chipLabels = ["R", "M", "L"];

  const WIDTH = Math.min(
    700,
    Math.round(Math.max(320, Dimensions.get("window").width * 0.9))
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <Animated.View
            style={[
              styles.centerWrap,
              { transform: [{ scale }], opacity, marginTop: 28 },
            ]}
          >
            <View
              style={[
                styles.card,
                { width: WIDTH, paddingBottom: 18 + getBottomSpace() },
              ]}
            >
              <View style={styles.titleWrap}>
                <Text style={styles.title}>Edit Item</Text>
              </View>

              <View style={styles.content}>
                {/* LEFT */}
                <View style={styles.leftCol}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.imageBox} />
                  ) : (
                    <View style={styles.imageBox}>
                      <Ionicons
                        name="image"
                        size={40}
                        color={theme.colors.divider}
                      />
                    </View>
                  )}

                  <Text style={styles.imageLabel}>Image (read-only)</Text>

                  <Text style={styles.sizeLabel}>Size</Text>
                  <View style={styles.chipsRow}>
                    {chipLabels.map((lbl) => {
                      const isActive = selectedChip === lbl;
                      return (
                        <TouchableOpacity
                          key={lbl}
                          onPress={() => setSelectedChip(lbl)}
                          style={[
                            styles.chip,
                            isActive ? styles.chipActive : styles.chipInactive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              isActive
                                ? { color: "#fff", fontWeight: "800" }
                                : {},
                            ]}
                          >
                            {lbl}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* RIGHT */}
                <View style={styles.rightCol}>
                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Name</Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.fieldBlock}>
                    <Text style={styles.fieldLabel}>Category</Text>
                    <TextInput
                      value={category}
                      onChangeText={setCategory}
                      style={styles.input}
                    />
                  </View>

                  <View
                    style={{
                      width: "70%",
                      marginRight: 10,
                      marginLeft: "auto",
                    }}
                  >
                    <Text style={styles.fieldLabel}>Price</Text>
                    <TextInput
                      value={price}
                      onChangeText={setPrice}
                      placeholder="Price"
                      placeholderTextColor="#9aa"
                      style={styles.input}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.btn, styles.btnGhost]}
                >
                  <Text style={styles.btnGhostText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={!canSave}
                  onPress={() =>
                    onSave({
                      id: initial?.id ?? null,
                      name: name.trim(),
                      price: Number(price),
                      category: category || null,
                      sizeLabel: selectedChip,
                      imageUri,
                    })
                  }
                  style={[
                    styles.btn,
                    styles.btnPrimary,
                    !canSave && styles.btnDisabled,
                  ]}
                >
                  <Text style={styles.btnPrimaryText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.42)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  centerWrap: { width: "100%", alignItems: "center", justifyContent: "center" },

  card: {
    borderRadius: 10,
    backgroundColor: "#fff",
    marginVertical: 80,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 12,
  },

  titleWrap: { alignItems: "center", marginBottom: 6 },
  title: { fontSize: 32, fontWeight: "800", color: theme.colors.accent },

  content: { flexDirection: "row", gap: 12, marginTop: 23 },
  leftCol: { width: 140, alignItems: "center" },

  imageBox: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: theme.colors.divider,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  imageLabel: { fontSize: 12, color: "#999", marginBottom: 7 },

  sizeLabel: {
    alignSelf: "flex-start",
    marginLeft: 10,
    fontSize: 14,
    color: "#444",
    marginTop: 2,
  },
  chipsRow: { flexDirection: "row", marginTop: 4, marginLeft: 38 },
  chip: {
    width: 44,
    height: 44,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 2,
  },
  chipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  chipInactive: { backgroundColor: "#fff", borderColor: "#111" },
  chipText: { fontSize: 18 },

  rightCol: { flex: 1 },
  fieldBlock: { marginBottom: 14, marginRight: 8 },
  fieldLabel: { fontSize: 13, color: "#666", marginBottom: 2 },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },

  actions: {
    marginTop: 40,
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  btn: {
    minWidth: 120,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhost: { backgroundColor: "#fff", borderWidth: 1.8, borderColor: "#ddd" },
  btnGhostText: { color: "#222", fontWeight: "700" },
  btnPrimary: { backgroundColor: theme.colors.accent },
  btnPrimaryText: { color: "#fff", fontWeight: "800" },
  btnDisabled: { opacity: 0.55 },
});
