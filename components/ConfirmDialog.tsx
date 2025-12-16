// components/ConfirmDialog.tsx
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import theme from "../constants/theme";

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={s.backdrop}>
        <View style={s.card}>
          {title ? <Text style={s.title}>{title}</Text> : null}
          {message ? <Text style={s.msg}>{message}</Text> : null}
          <View style={s.row}>
            <TouchableOpacity style={[s.btn, s.ghost]} onPress={onCancel}>
              <Text style={s.ghostText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, s.primary]} onPress={onConfirm}>
              <Text style={s.primaryText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.accent,
    marginBottom: 6,
  },
  msg: { color: "#444", marginBottom: 14, fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  btn: {
    minWidth: 92,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  ghost: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd" },
  ghostText: { color: "#333", fontWeight: "700" },
  primary: { backgroundColor: theme.colors.accent },
  primaryText: { color: "#fff", fontWeight: "800" },
});
