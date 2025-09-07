import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import EmojiList from "./EmojiList";

interface EmojiPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({
  isVisible,
  onClose,
  onSelect,
}: EmojiPickerProps) {
  return (
    <Modal animationType="slide" transparent visible={isVisible}>
      <View style={styles.modalContent}>
        <EmojiList
          onSelect={(emoji) => {
            onSelect(emoji);
            onClose();
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "#FFFFFF",
    marginTop: "auto",
    padding: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 8,
  },
});
