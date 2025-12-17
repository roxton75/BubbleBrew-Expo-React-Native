// components/AddItemSheet.tsx
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
// at top of file with other imports
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getBottomSpace } from "react-native-iphone-x-helper";
import theme from "../constants/theme";
import { useMenuStore } from "../state/useMenuStore";

// match new createMenuItem size input
type MenuSize = { label: string; price?: number };

export default function AddItemSheet({
  visible,
  onClose,
  onSave,
  defaultSizes = ["R", "M", "L"],
}: {
  visible: boolean;
  onClose: () => void;
  onSave?: (
    name: string,
    price: number,
    category?: string | null,
    sizes?: MenuSize[] | undefined,
    imageUri?: string | null
  ) => void;

  defaultSizes?: string[];
}) {
  const [name, setName] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [imageUri, setImageUri] = React.useState<string | null>(null);
  const [selectedChip, setSelectedChip] = React.useState<string | null>(null);

  const scale = React.useRef(new Animated.Value(0.96)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // reset fields when opening add sheet
      setName("");
      setPrice("");
      setCategory("");
      setImageUri(null);
      setSelectedChip(null);

      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 160,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.96,
          duration: 120,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scale, opacity]);

  const bottomSafe =
    typeof getBottomSpace === "function" ? getBottomSpace() : 16;
  const canSave = Boolean(name.trim()) && !isNaN(Number(price));
  // put near top of file with other helpers/imports

  const IMAGE_PICKER_MEDIA_TYPES: any =
    // try modern export first, then legacy, then string fallback
    (ImagePicker as any).MediaType ??
    (ImagePicker as any).MediaTypeOptions ??
    "Images";

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;
     
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: IMAGE_PICKER_MEDIA_TYPES.Images ?? IMAGE_PICKER_MEDIA_TYPES, // works whether enum or string
        allowsEditing: true,
        quality: 0.7,
        aspect: [1, 1],
      });

      if (!res.canceled && res.assets?.length) setImageUri(res.assets[0].uri);
      else if (!(res as any).canceled && (res as any).uri)
        setImageUri((res as any).uri);
    } catch (e) {
      console.warn("pickImage error", e);
    }
  };

  const toggleChip = (lbl: string) =>
    setSelectedChip((p) => (p === lbl ? null : lbl));

  const WIDTH = Math.min(
    700,
    Math.round(Math.max(320, (Dimensions?.get?.("window")?.width ?? 360) * 0.9))
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
            pointerEvents={visible ? "auto" : "none"}
          >
            <View
              style={[
                styles.card,
                { width: WIDTH, paddingBottom: 18 + bottomSafe },
              ]}
            >
              <View style={styles.titleWrap}>
                <Text style={styles.title}>Add Item</Text>
              </View>

              {/* image centered top */}
              <View style={styles.imageRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={pickImage}
                  style={styles.plusBox}
                >
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.plusImage}
                    />
                  ) : (
                    <View style={styles.plusPlaceholder}>
                      <Ionicons name="add-sharp" size={48} color="#e0e0e0" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* form rows */}
              <View style={styles.form}>
                {/* top row: Name | Price */}
                <View style={styles.rowTop}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.fieldLabel}>Name</Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Name"
                      placeholderTextColor="#9aa"
                      style={styles.input}
                    />
                  </View>

                  <View style={{ width: 100, marginRight: 2 }}>
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

                {/* second row: Category (left) + Size chips (right) */}
                <View style={styles.rowBottom}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.fieldLabel}>Category</Text>
                    <TextInput
                      value={category}
                      onChangeText={setCategory}
                      placeholder="Category"
                      placeholderTextColor="#9aa"
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.sizeBlock}>
                    <Text style={styles.fieldLabel}>Size</Text>
                    <View style={styles.chipsRow}>
                      {defaultSizes.map((lbl) => {
                        const isActive = selectedChip === lbl;
                        return (
                          <TouchableOpacity
                            key={lbl}
                            style={[
                              styles.chip,
                              isActive
                                ? styles.chipActive
                                : styles.chipInactive,
                            ]}
                            onPress={() => toggleChip(lbl)}
                            activeOpacity={0.85}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                isActive
                                  ? {
                                      color: theme.colors.surface,
                                      fontWeight: "800",
                                    }
                                  : { color: theme.colors.text.primary },
                              ]}
                            >
                              {lbl}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>

              {/* actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.btn, styles.btnGhost]}
                >
                  <Text style={styles.btnGhostText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={!canSave}
                  onPress={async () => {
                    const p = Number(price || 0);
                    const basePrice = isNaN(p) ? 0 : p;

                    const sizes = selectedChip
                      ? [{ label: selectedChip }]
                      : undefined;

                    try {
                      // use the store's add so the screen with active Realm listener updates immediately
                      await useMenuStore.getState().add({
                        name: name.trim() || "#item",
                        basePrice,
                        category: category?.trim() || null,
                        imageUri: imageUri ?? null,
                        sizes: sizes as any,
                      });
                    } catch (err) {
                      console.error("addItem failed:", err);
                    } finally {
                      onClose();
                    }
                  }}
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
    marginVertical: 80,
    backgroundColor: theme.colors.surface,
    padding: 18,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 12,
  },

  titleWrap: { alignItems: "center", marginBottom: 8 },
  title: { fontSize: 32, fontWeight: "800", color: theme.colors.accent },

  imageRow: { alignItems: "center", marginBottom: 10 },
  plusBox: {
    width: 120,
    height: 120,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  plusPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.divider,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.04,
    elevation: 2,
  },
  plusImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: theme.colors.divider,
  },

  form: { marginTop: 6 },
  rowTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
  rowBottom: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 2,
    marginBottom: 12,
  },

  fieldLabel: { fontSize: 13, color: "#666", marginBottom: 6 },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.divider,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surface,
  },

  sizeBlock: { width: 140, alignItems: "flex-start", marginRight: 5 },
  chipsRow: { flexDirection: "row" },
  chip: {
    minWidth: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
    borderWidth: 2,
  },
  chipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  chipInactive: { backgroundColor: theme.colors.surface, borderColor: "#111" },
  chipText: { fontSize: 18 },

  actions: {
    marginTop: 16,
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
  btnGhost: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.divider,
  },
  btnGhostText: { color: "#222", fontWeight: "700" },
  btnPrimary: { backgroundColor: theme.colors.accent },
  btnPrimaryText: { color: theme.colors.surface, fontWeight: "800" },
  btnDisabled: { backgroundColor: theme.colors.divider },
});
