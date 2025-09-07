import React from "react";
import { FlatList, Image, Pressable, StyleSheet } from "react-native";

interface EmojiListProps {
  onSelect: (emoji: string) => void;
}

const emojis = [
  require("../assets/stickers/heart.png"),
  require("../assets/stickers/star.png"),
  require("../assets/stickers/unicorn.png"),
];

export default function EmojiList({ onSelect }: EmojiListProps) {
  return (
    <FlatList
      horizontal
      data={emojis}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onSelect(Image.resolveAssetSource(item).uri)}
          style={({ pressed }) => [
            styles.emojiButton,
            pressed && styles.emojiButtonPressed,
          ]}
        >
          <Image source={item} style={styles.image} />
        </Pressable>
      )}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={styles.list}
      showsHorizontalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  emojiButton: {
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  emojiButtonPressed: {
    backgroundColor: "#F0F0F0",
  },
  image: {
    width: 48,
    height: 48,
  },
});
