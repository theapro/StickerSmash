import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import EmojiList from './EmojiList';

interface EmojiPickerProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ isVisible, onClose, onSelect }: EmojiPickerProps) {
  return (
    <Modal animationType="slide" transparent visible={isVisible}>
      <View style={styles.modalContent}>
        <EmojiList onSelect={emoji => {
          onSelect(emoji);
          onClose();
        }} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#fff',
    marginTop: 'auto',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 5,
    elevation: 5,
  },
});
