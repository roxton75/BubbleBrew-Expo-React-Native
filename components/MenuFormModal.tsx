// components/MenuFormModal.tsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useMenuStore } from "../state/useMenuStore";

export default function MenuFormModal({ visible, onClose, initial }: any) {
  const add = useMenuStore((s) => s.add);
  const edit = useMenuStore((s) => s.edit);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setName(initial.name || "");
      setPrice(String(initial.basePrice || ""));
      setCategory(initial.category || "");
      setUri(initial.imageUri || null);
    } else {
      setName("");
      setPrice("");
      setCategory("");
      setUri(null);
    }
  }, [initial, visible]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    console.log("picker result", res);
    if (res.canceled) return;
    setUri(res.assets?.[0]?.uri ?? null);
  };

  const onSubmit = () => {
    const payload = {
      name,
      basePrice: Number(price || 0),
      category: category || null,
      imageUri: uri || null,
      sizes: [],
    };
    if (initial) {
      edit(initial.id, payload);
    } else {
      add(payload);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{initial ? "Edit item" : "Add item"}</Text>

          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {uri ? (
              <Image source={{ uri }} style={styles.preview} />
            ) : (
              <Text style={{ color: "#666" }}>Pick image</Text>
            )}
          </TouchableOpacity>

          <TextInput
            placeholder="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Base price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Category"
            value={category}
            onChangeText={setCategory}
            style={styles.input}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginTop: 12,
            }}
          >
            <TouchableOpacity onPress={onClose} style={styles.btn}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSubmit}
              style={[
                styles.btn,
                { marginLeft: 8, backgroundColor: "#0b8f73" },
              ]}
            >
              <Text style={{ color: "#fff" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  imagePicker: {
    width: 86,
    height: 86,
    borderRadius: 8,
    backgroundColor: "#fafafa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  preview: { width: 86, height: 86, borderRadius: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
});
